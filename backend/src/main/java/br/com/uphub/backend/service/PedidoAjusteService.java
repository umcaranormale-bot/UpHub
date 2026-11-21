package br.com.uphub.backend.service;

import br.com.uphub.backend.candidatura.MaquinaDeEstados.Ator;
import br.com.uphub.backend.dto.ItemAjusteRequest;
import br.com.uphub.backend.dto.PedidoAjusteResponse;
import br.com.uphub.backend.dto.ReenvioRequest;
import br.com.uphub.backend.model.Avaliacao;
import br.com.uphub.backend.model.Candidatura;
import br.com.uphub.backend.model.PedidoAjuste;
import br.com.uphub.backend.model.VersaoOportunidade;
import br.com.uphub.backend.repository.AvaliacaoRepository;
import br.com.uphub.backend.repository.CandidaturaRepository;
import br.com.uphub.backend.repository.PedidoAjusteRepository;
import br.com.uphub.backend.repository.VersaoOportunidadeRepository;
import br.com.uphub.backend.seguranca.Acesso;
import br.com.uphub.backend.seguranca.Permissao;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class PedidoAjusteService {

    private static final Logger LOG = LoggerFactory.getLogger(PedidoAjusteService.class);
    private static final DateTimeFormatter DATA_HORA = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final PedidoAjusteRepository pedidoRepository;
    private final AvaliacaoRepository avaliacaoRepository;
    private final CandidaturaRepository candidaturaRepository;
    private final VersaoOportunidadeRepository versaoRepository;
    private final CandidaturaService candidaturaService;
    private final ItemAjusteService itemService;
    private final Acesso acesso;
    private final TransactionTemplate transacao;
    private final AuditoriaService auditoria;

    public PedidoAjusteService(PedidoAjusteRepository pedidoRepository,
                               AvaliacaoRepository avaliacaoRepository,
                               CandidaturaRepository candidaturaRepository,
                               VersaoOportunidadeRepository versaoRepository,
                               CandidaturaService candidaturaService,
                               ItemAjusteService itemService,
                               Acesso acesso,
                               TransactionTemplate transacao,
                               AuditoriaService auditoria) {
        this.pedidoRepository = pedidoRepository;
        this.avaliacaoRepository = avaliacaoRepository;
        this.candidaturaRepository = candidaturaRepository;
        this.versaoRepository = versaoRepository;
        this.candidaturaService = candidaturaService;
        this.itemService = itemService;
        this.acesso = acesso;
        this.transacao = transacao;
        this.auditoria = auditoria;
    }

    // ---------- chamado pela avaliação

    // o primeiro avaliador que assina AJUSTE na rodada abre o pedido; os outros põem os itens no mesmo
    @Transactional
    public PedidoAjuste abrirOuUsar(Avaliacao avaliacao, List<ItemAjusteRequest> itens) {
        PedidoAjuste pedido = pedidoRepository.findFirstByCandidaturaIdAndSituacaoInOrderByPedidoEmDesc(avaliacao.getCandidaturaId(), List.of("AGUARDANDO"))
                .orElseGet(() -> {
                    OffsetDateTime agora = OffsetDateTime.now();
                    return pedidoRepository.save(new PedidoAjuste(avaliacao.getCandidaturaId(), avaliacao.getId(), agora,
                            agora.plusDays(prazoDias(avaliacao.getCandidaturaId()))));
                });
        itemService.criar(pedido, itens);
        return pedido;
    }

    // a rodada fechou em AJUSTE: o prazo conta a partir de agora
    @Transactional
    public void iniciarPrazo(Long candidaturaId) {
        pedidoRepository.findFirstByCandidaturaIdAndSituacaoInOrderByPedidoEmDesc(candidaturaId, List.of("AGUARDANDO"))
                .ifPresent(p -> {
                    p.novoPrazo(OffsetDateTime.now().plusDays(prazoDias(candidaturaId)));
                    pedidoRepository.saveAndFlush(p);
                });
    }

    // a rodada em que a candidatura está: 1, mais um a cada reenvio do ajuste
    public short rodadaAtual(Long candidaturaId) {
        return (short) (1 + pedidoRepository.countByCandidaturaIdAndSituacao(candidaturaId, "REENVIADO"));
    }

    // ---------- organização candidata

    @Transactional
    public PedidoAjusteResponse reenviar(Long candidaturaId, ReenvioRequest dados, Long pessoaId) {
        String resposta = dados == null || dados.resposta() == null ? "" : dados.resposta().trim();
        if (resposta.isEmpty()) {
            throw erro(HttpStatus.BAD_REQUEST, "Escreva a resposta ao ajuste antes de reenviar");
        }
        Candidatura candidatura = candidaturaService.paraLeitura(candidaturaId, pessoaId);
        acesso.exigir(pessoaId, candidatura.getOrganizacaoId(), Permissao.CANDIDATAR);
        if (!"AJUSTE".equals(candidatura.getEstado())) {
            throw erro(HttpStatus.CONFLICT, "Esta candidatura não está aguardando ajuste");
        }
        PedidoAjuste pedido = aberto(candidaturaId);
        OffsetDateTime agora = OffsetDateTime.now();
        if (agora.isAfter(pedido.getPrazoReenvio())) {
            throw erro(HttpStatus.CONFLICT, "O prazo do ajuste venceu em " + pedido.getPrazoReenvio().format(DATA_HORA));
        }
        itemService.conferir(pedido);
        short rodadaQueFechou = rodadaAtual(candidaturaId);
        pedido.reenviar(resposta, pessoaId, agora);
        pedidoRepository.saveAndFlush(pedido);
        candidatura = candidaturaService.moverPor(candidatura, "EM_ANALISE", Ator.CANDIDATO);
        auditoria.registrarTransicaoCandidatura(candidatura, pessoaId, null, "CANDIDATO",
                "AJUSTE", "EM_ANALISE", resposta);

        // a nova rodada volta para os mesmos avaliadores
        short novaRodada = (short) (rodadaQueFechou + 1);
        for (Avaliacao anterior : avaliacaoRepository.findByCandidaturaIdAndRodada(candidaturaId, rodadaQueFechou)) {
            avaliacaoRepository.save(new Avaliacao(candidaturaId, anterior.getOportunidadeId(), anterior.getVinculoId(),
                    anterior.getAtribuidaPor(), agora, novaRodada));
        }
        return resposta(pedido, candidatura);
    }

    // ---------- provedor

    // depois da perda de prazo, o provedor pode dar mais um prazo
    @Transactional
    public PedidoAjusteResponse reabrir(Long candidaturaId, Long pessoaId) {
        Candidatura candidatura = candidaturaService.comoProvedor(candidaturaId, pessoaId);
        if (!"PERDA_DE_PRAZO".equals(candidatura.getEstado())) {
            throw erro(HttpStatus.CONFLICT, "Só dá para reabrir o ajuste depois da perda de prazo");
        }
        PedidoAjuste pedido = pedidoRepository.findFirstByCandidaturaIdAndSituacaoInOrderByPedidoEmDesc(candidaturaId, List.of("PERDA_DE_PRAZO"))
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Pedido de ajuste não encontrado"));
        OffsetDateTime agora = OffsetDateTime.now();
        pedido.reabrir(pessoaId, agora, agora.plusDays(prazoDias(candidaturaId)));
        pedidoRepository.saveAndFlush(pedido);
        candidatura = candidaturaService.moverPor(candidatura, "AJUSTE", Ator.PROVEDOR);
        auditoria.registrarTransicaoCandidatura(candidatura, pessoaId, null, "PROVEDOR",
                "PERDA_DE_PRAZO", "AJUSTE", null);
        return resposta(pedido, candidatura);
    }

    // ---------- leitura

    @Transactional(readOnly = true)
    public List<PedidoAjusteResponse> listar(Long candidaturaId, Long pessoaId) {
        Candidatura candidatura = candidaturaService.paraLeitura(candidaturaId, pessoaId);
        return pedidoRepository.findByCandidaturaIdOrderByPedidoEm(candidaturaId).stream()
                .map(p -> resposta(p, candidatura))
                .toList();
    }

    // ---------- sistema: perda de prazo

    // de tempos em tempos, quem passou do prazo sem reenviar vai para PERDA_DE_PRAZO
    @Scheduled(fixedDelayString = "${uphub.ajuste.intervalo-ms:600000}", initialDelayString = "${uphub.ajuste.intervalo-ms:600000}")
    public void verificarPrazos() {
        for (PedidoAjuste vencido : pedidoRepository.findBySituacaoAndPrazoReenvioBefore("AGUARDANDO", OffsetDateTime.now())) {
            try {
                transacao.executeWithoutResult(t -> perderPrazo(vencido.getId()));
            } catch (RuntimeException e) {
                // oportunidade pausada, por exemplo: tenta de novo na próxima volta
                LOG.warn("Pedido de ajuste {} não mudou para perda de prazo: {}", vencido.getId(), e.getMessage());
            }
        }
    }

    private void perderPrazo(Long pedidoId) {
        PedidoAjuste pedido = pedidoRepository.findById(pedidoId).orElseThrow();
        Candidatura candidatura = candidaturaRepository.findById(pedido.getCandidaturaId()).orElseThrow();
        if (!"AGUARDANDO".equals(pedido.getSituacao()) || !"AJUSTE".equals(candidatura.getEstado())) {
            return;
        }
        pedido.perderPrazo(OffsetDateTime.now());
        pedidoRepository.saveAndFlush(pedido);
        candidaturaService.moverPor(candidatura, "PERDA_DE_PRAZO", Ator.SISTEMA);
        auditoria.registrarTransicaoCandidatura(candidatura, null, AuditoriaService.AGENDADOR, "SISTEMA",
                "AJUSTE", "PERDA_DE_PRAZO", null);
    }

    // ---------- apoio

    private PedidoAjuste aberto(Long candidaturaId) {
        return pedidoRepository.findFirstByCandidaturaIdAndSituacaoInOrderByPedidoEmDesc(candidaturaId, List.of("AGUARDANDO"))
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Pedido de ajuste não encontrado"));
    }

    private long prazoDias(Long candidaturaId) {
        Candidatura candidatura = candidaturaRepository.findById(candidaturaId).orElseThrow();
        return versaoRepository.findById(candidatura.getVersaoId()).map(VersaoOportunidade::getPrazoAjusteDias)
                .map(Short::longValue).orElse(7L);
    }

    private PedidoAjusteResponse resposta(PedidoAjuste p, Candidatura c) {
        Short rodada = avaliacaoRepository.findById(p.getAvaliacaoId()).map(Avaliacao::getRodada).orElse(null);
        return new PedidoAjusteResponse(p.getId(), p.getCandidaturaId(), p.getAvaliacaoId(), rodada, p.getPedidoEm(),
                p.getPrazoReenvio(), p.getSituacao(), p.getResposta(), p.getReenviadoEm(), p.getPrazoPerdidoEm(),
                p.getReabertoEm(), c.getEstado(), itemService.itensDo(p.getId()));
    }

    private ResponseStatusException erro(HttpStatus status, String mensagem) {
        return new ResponseStatusException(status, mensagem);
    }
}