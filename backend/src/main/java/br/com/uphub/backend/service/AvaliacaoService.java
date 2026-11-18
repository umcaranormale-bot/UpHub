package br.com.uphub.backend.service;

import br.com.uphub.backend.dto.AtribuicaoRequest;
import br.com.uphub.backend.dto.AvaliacaoRascunhoRequest;
import br.com.uphub.backend.dto.AvaliacaoResponse;
import br.com.uphub.backend.model.AvaliadorOportunidade;
import br.com.uphub.backend.model.AvaliadorOportunidadeId;
import br.com.uphub.backend.model.Avaliacao;
import br.com.uphub.backend.model.Candidatura;
import br.com.uphub.backend.model.Criterio;
import br.com.uphub.backend.model.NotaCriterio;
import br.com.uphub.backend.model.RetificacaoParecer;
import br.com.uphub.backend.model.CandidaturaParticipanteId;
import br.com.uphub.backend.model.Oportunidade;
import br.com.uphub.backend.model.Vinculo;
import br.com.uphub.backend.repository.AvaliacaoRepository;
import br.com.uphub.backend.repository.AvaliadorOportunidadeRepository;
import br.com.uphub.backend.repository.CandidaturaParticipanteRepository;
import br.com.uphub.backend.repository.CandidaturaRepository;
import br.com.uphub.backend.repository.CriterioRepository;
import br.com.uphub.backend.repository.NotaCriterioRepository;
import br.com.uphub.backend.repository.OportunidadeRepository;
import br.com.uphub.backend.repository.RetificacaoParecerRepository;
import br.com.uphub.backend.repository.VinculoRepository;
import br.com.uphub.backend.seguranca.Acesso;
import br.com.uphub.backend.seguranca.Permissao;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AvaliacaoService {

    private static final Set<String> DECISOES = Set.of("APROVADA", "REPROVADA", "AJUSTE");
    // na última rodada não se pede mais ajuste
    private static final Set<String> DECISOES_ULTIMA_RODADA = Set.of("APROVADA", "REPROVADA");
    private static final short ULTIMA_RODADA = 3;
    // critério sem peso vale 1; sem escala, vai de 0 a 10
    private static final BigDecimal PESO_PADRAO = BigDecimal.ONE;
    private static final BigDecimal ESCALA_MIN_PADRAO = BigDecimal.ZERO;
    private static final BigDecimal ESCALA_MAX_PADRAO = BigDecimal.TEN;
    private static final BigDecimal CEM = new BigDecimal("100");

    private final AvaliacaoRepository avaliacaoRepository;
    private final AvaliadorOportunidadeRepository designacaoRepository;
    private final CandidaturaRepository candidaturaRepository;
    private final CandidaturaParticipanteRepository participanteRepository;
    private final OportunidadeRepository oportunidadeRepository;
    private final VinculoRepository vinculoRepository;
    private final CriterioRepository criterioRepository;
    private final NotaCriterioRepository notaRepository;
    private final RetificacaoParecerRepository retificacaoRepository;
    private final CandidaturaService candidaturaService;
    private final PedidoAjusteService pedidoAjusteService;
    private final Acesso acesso;

    public AvaliacaoService(AvaliacaoRepository avaliacaoRepository,
                            AvaliadorOportunidadeRepository designacaoRepository,
                            CandidaturaRepository candidaturaRepository,
                            CandidaturaParticipanteRepository participanteRepository,
                            OportunidadeRepository oportunidadeRepository,
                            VinculoRepository vinculoRepository,
                            CriterioRepository criterioRepository,
                            NotaCriterioRepository notaRepository,
                            RetificacaoParecerRepository retificacaoRepository,
                            CandidaturaService candidaturaService,
                            PedidoAjusteService pedidoAjusteService,
                            Acesso acesso) {
        this.avaliacaoRepository = avaliacaoRepository;
        this.designacaoRepository = designacaoRepository;
        this.candidaturaRepository = candidaturaRepository;
        this.participanteRepository = participanteRepository;
        this.oportunidadeRepository = oportunidadeRepository;
        this.vinculoRepository = vinculoRepository;
        this.criterioRepository = criterioRepository;
        this.notaRepository = notaRepository;
        this.retificacaoRepository = retificacaoRepository;
        this.candidaturaService = candidaturaService;
        this.pedidoAjusteService = pedidoAjusteService;
        this.acesso = acesso;
    }

    // ---------- provedor

    // o provedor entrega a candidatura em análise a um avaliador designado para a oportunidade
    @Transactional
    public AvaliacaoResponse atribuir(Long candidaturaId, AtribuicaoRequest dados, Long pessoaId) {
        if (dados == null || dados.vinculoId() == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo vinculoId é obrigatório");
        }
        Candidatura candidatura = candidaturaService.comoProvedor(candidaturaId, pessoaId);
        candidaturaService.exigirQueAnda(candidatura);
        if (!"EM_ANALISE".equals(candidatura.getEstado())) {
            throw erro(HttpStatus.CONFLICT, "A candidatura precisa estar em análise para receber avaliadores");
        }
        if (!designacaoRepository.existsById(new AvaliadorOportunidadeId(candidatura.getOportunidadeId(), dados.vinculoId()))) {
            throw erro(HttpStatus.BAD_REQUEST, "Este avaliador não está designado para a oportunidade");
        }
        Vinculo vinculo = vinculoRepository.findById(dados.vinculoId()).orElseThrow();
        if (vinculo.getEncerradoEm() != null) {
            throw erro(HttpStatus.BAD_REQUEST, "O vínculo deste avaliador foi encerrado");
        }
        Long avaliadorId = vinculo.getPessoa().getId();
        if (acesso.ehMembro(avaliadorId, candidatura.getOrganizacaoId())
                || participanteRepository.existsById(new CandidaturaParticipanteId(candidatura.getId(), avaliadorId))) {
            throw erro(HttpStatus.CONFLICT, "Conflito de interesse: o avaliador faz parte da organização candidata");
        }
        short rodada = rodadaAtual(candidatura);
        if (avaliacaoRepository.existsByCandidaturaIdAndVinculoIdAndRodada(candidaturaId, vinculo.getId(), rodada)) {
            throw erro(HttpStatus.CONFLICT, "Este avaliador já recebeu esta candidatura nesta rodada");
        }
        Avaliacao avaliacao = avaliacaoRepository.save(new Avaliacao(candidaturaId, candidatura.getOportunidadeId(),
                vinculo.getId(), pessoaId, OffsetDateTime.now(), rodada));
        return resposta(avaliacao, candidatura, true);
    }

    // tirar o avaliador antes de ele assinar (por exemplo, para trocar por outro)
    @Transactional
    public void remover(Long avaliacaoId, Long pessoaId) {
        Avaliacao avaliacao = buscar(avaliacaoId);
        candidaturaService.comoProvedor(avaliacao.getCandidaturaId(), pessoaId);
        if (avaliacao.assinada()) {
            throw erro(HttpStatus.CONFLICT, "Esta avaliação já foi assinada");
        }
        avaliacaoRepository.delete(avaliacao);
    }

    // ---------- leitura

    // provedor e gestão veem todas; o avaliador, a dele; a organização candidata, as assinadas das rodadas fechadas, sem o nome
    @Transactional(readOnly = true)
    public List<AvaliacaoResponse> listarDaCandidatura(Long candidaturaId, Long pessoaId) {
        Candidatura candidatura = candidaturaService.paraLeitura(candidaturaId, pessoaId);
        List<Avaliacao> todas = avaliacaoRepository.findByCandidaturaIdOrderByRodadaAscAtribuidaEmAsc(candidaturaId);
        if (conduz(candidatura, pessoaId)) {
            return todas.stream().map(a -> resposta(a, candidatura, true)).toList();
        }
        if (candidaturaService.soComoAvaliador(candidatura, pessoaId)) {
            return todas.stream().filter(a -> ehDoAvaliador(a, pessoaId)).map(a -> resposta(a, candidatura, true)).toList();
        }
        short atual = rodadaAtual(candidatura);
        return todas.stream()
                .filter(a -> a.assinada() && (!"EM_ANALISE".equals(candidatura.getEstado()) || a.getRodada() < atual))
                .map(a -> resposta(a, candidatura, false))
                .toList();
    }

    // a fila do avaliador: o que falta assinar vem primeiro
    @Transactional(readOnly = true)
    public List<AvaliacaoResponse> fila(Long pessoaId) {
        return avaliacaoRepository.filaDa(pessoaId).stream()
                .map(a -> resposta(a, candidaturaRepository.findById(a.getCandidaturaId()).orElseThrow(), true))
                .toList();
    }

    @Transactional(readOnly = true)
    public AvaliacaoResponse buscarPorId(Long avaliacaoId, Long pessoaId) {
        Avaliacao avaliacao = paraLer(avaliacaoId, pessoaId);
        Candidatura candidatura = candidaturaRepository.findById(avaliacao.getCandidaturaId()).orElseThrow();
        return resposta(avaliacao, candidatura, true);
    }

    // ---------- avaliador

    @Transactional
    public AvaliacaoResponse salvarRascunho(Long avaliacaoId, AvaliacaoRascunhoRequest dados, Long pessoaId) {
        Avaliacao avaliacao = doAvaliadorParaEscrever(avaliacaoId, pessoaId);
        String decisao = dados == null || dados.decisao() == null ? null : dados.decisao().trim().toUpperCase();
        if (decisao != null && !decisoesAceitas(avaliacao).contains(decisao)) {
            throw erro(HttpStatus.BAD_REQUEST, "Decisão inválida. Use: " + String.join(", ", decisoesAceitas(avaliacao).stream().sorted().toList()));
        }
        String parecer = dados == null || dados.parecer() == null ? null : dados.parecer().trim();
        avaliacao.rascunho(decisao, parecer);
        Candidatura candidatura = candidaturaRepository.findById(avaliacao.getCandidaturaId()).orElseThrow();
        return resposta(avaliacaoRepository.saveAndFlush(avaliacao), candidatura, true);
    }

    // assinar fecha a avaliação; quando todos da rodada assinam, a candidatura anda
    @Transactional
    public AvaliacaoResponse assinar(Long avaliacaoId, Long pessoaId) {
        Avaliacao avaliacao = doAvaliadorParaEscrever(avaliacaoId, pessoaId);
        Candidatura candidatura = candidaturaRepository.findById(avaliacao.getCandidaturaId()).orElseThrow();
        candidaturaService.exigirQueAnda(candidatura);
        if (!"EM_ANALISE".equals(candidatura.getEstado())) {
            throw erro(HttpStatus.CONFLICT, "A candidatura não está em análise");
        }
        if (avaliacao.getDecisao() == null) {
            throw erro(HttpStatus.BAD_REQUEST, "Escolha a decisão antes de assinar");
        }
        if (avaliacao.getParecer() == null || avaliacao.getParecer().isBlank()) {
            throw erro(HttpStatus.BAD_REQUEST, "Escreva o parecer antes de assinar");
        }
        if (!decisoesAceitas(avaliacao).contains(avaliacao.getDecisao())) {
            throw erro(HttpStatus.BAD_REQUEST, "Na rodada " + ULTIMA_RODADA + ", a última, a decisão é APROVADA ou REPROVADA");
        }
        avaliacao.assinar(notaFinal(avaliacao, candidatura.getVersaoId()), OffsetDateTime.now());
        avaliacaoRepository.saveAndFlush(avaliacao);
        if ("AJUSTE".equals(avaliacao.getDecisao())) {
            pedidoAjusteService.abrirOuUsar(avaliacao);
        }
        candidatura = consolidar(candidatura, avaliacao.getRodada());
        return resposta(avaliacao, candidatura, true);
    }

    // ---------- regras da rodada

    // fechada a rodada: um pedido de ajuste já leva para AJUSTE; senão, maioria de aprovações aprova,
    // e empate ou maioria de reprovações reprova
    private Candidatura consolidar(Candidatura candidatura, short rodada) {
        List<Avaliacao> daRodada = avaliacaoRepository.findByCandidaturaIdAndRodada(candidatura.getId(), rodada);
        if (daRodada.stream().anyMatch(a -> !a.assinada())) {
            return candidatura;
        }
        if (daRodada.stream().anyMatch(a -> "AJUSTE".equals(a.getDecisao()))) {
            pedidoAjusteService.iniciarPrazo(candidatura.getId());
            return candidaturaService.moverComoAvaliador(candidatura, "AJUSTE");
        }
        long aprovadas = daRodada.stream().filter(a -> "APROVADA".equals(a.getDecisao())).count();
        long reprovadas = daRodada.stream().filter(a -> "REPROVADA".equals(a.getDecisao())).count();
        String resultado = aprovadas > reprovadas ? "APROVADA" : "REPROVADA";
        if ("REPROVADA".equals(resultado)) {
            candidatura.moverNoFunil(null);
        }
        return candidaturaService.moverComoAvaliador(candidatura, resultado);
    }

    // nota final de 0 a 100: a média ponderada pelos pesos, com cada nota levada para a mesma escala.
    // Todo critério da versão precisa de nota; sem critérios, a avaliação não tem nota final.
    private BigDecimal notaFinal(Avaliacao avaliacao, Long versaoId) {
        List<Criterio> criterios = criterioRepository.listarPorVersao(versaoId);
        if (criterios.isEmpty()) {
            return null;
        }
        Map<Long, BigDecimal> notas = notaRepository.findById_AvaliacaoId(avaliacao.getId()).stream()
                .collect(Collectors.toMap(n -> n.getId().getCriterioId(), NotaCriterio::getNota));
        List<String> faltam = criterios.stream().filter(c -> !notas.containsKey(c.getId()))
                .map(Criterio::getDescricao).toList();
        if (!faltam.isEmpty()) {
            throw erro(HttpStatus.BAD_REQUEST, "Dê nota a todos os critérios antes de assinar. Faltam: " + String.join(", ", faltam));
        }
        BigDecimal soma = BigDecimal.ZERO;
        BigDecimal pesos = BigDecimal.ZERO;
        for (Criterio c : criterios) {
            BigDecimal min = escalaMin(c);
            BigDecimal normalizada = notas.get(c.getId()).subtract(min)
                    .divide(escalaMax(c).subtract(min), 6, RoundingMode.HALF_UP).multiply(CEM);
            soma = soma.add(normalizada.multiply(peso(c)));
            pesos = pesos.add(peso(c));
        }
        return soma.divide(pesos, 2, RoundingMode.HALF_UP);
    }

    public static BigDecimal peso(Criterio c) {
        return c.getPeso() == null ? PESO_PADRAO : c.getPeso();
    }

    public static BigDecimal escalaMin(Criterio c) {
        return c.getEscalaMin() == null ? ESCALA_MIN_PADRAO : c.getEscalaMin();
    }

    public static BigDecimal escalaMax(Criterio c) {
        return c.getEscalaMax() == null ? ESCALA_MAX_PADRAO : c.getEscalaMax();
    }

    private Set<String> decisoesAceitas(Avaliacao avaliacao) {
        return avaliacao.getRodada() >= ULTIMA_RODADA ? DECISOES_ULTIMA_RODADA : DECISOES;
    }

    private short rodadaAtual(Candidatura candidatura) {
        return pedidoAjusteService.rodadaAtual(candidatura.getId());
    }

    // ---------- para as partes da avaliação (notas por critério, retificação)

    // o avaliador mexendo na própria avaliação, antes de assinar
    @Transactional(readOnly = true)
    public Avaliacao paraEscrever(Long avaliacaoId, Long pessoaId) {
        return doAvaliadorParaEscrever(avaliacaoId, pessoaId);
    }

    // o avaliador dela, o provedor e a gestão
    @Transactional(readOnly = true)
    public Avaliacao paraLer(Long avaliacaoId, Long pessoaId) {
        Avaliacao avaliacao = buscar(avaliacaoId);
        Candidatura candidatura = candidaturaRepository.findById(avaliacao.getCandidaturaId()).orElseThrow();
        if (!ehDoAvaliador(avaliacao, pessoaId) && !conduz(candidatura, pessoaId)) {
            throw erro(HttpStatus.NOT_FOUND, "Avaliação não encontrada");
        }
        return avaliacao;
    }

    public boolean ehDoAvaliadorLogado(Avaliacao avaliacao, Long pessoaId) {
        return ehDoAvaliador(avaliacao, pessoaId);
    }

    // ---------- apoio

    private Avaliacao doAvaliadorParaEscrever(Long avaliacaoId, Long pessoaId) {
        Avaliacao avaliacao = buscar(avaliacaoId);
        if (!ehDoAvaliador(avaliacao, pessoaId)) {
            throw erro(HttpStatus.FORBIDDEN, "Só o avaliador desta avaliação pode mexer nela");
        }
        if (avaliacao.assinada()) {
            throw erro(HttpStatus.CONFLICT, "Esta avaliação já foi assinada e não muda mais");
        }
        return avaliacao;
    }

    private boolean ehDoAvaliador(Avaliacao avaliacao, Long pessoaId) {
        return vinculoRepository.findById(avaliacao.getVinculoId())
                .map(v -> v.getPessoa().getId().equals(pessoaId) && v.getEncerradoEm() == null)
                .orElse(false);
    }

    private boolean conduz(Candidatura candidatura, Long pessoaId) {
        Oportunidade oportunidade = oportunidadeRepository.findById(candidatura.getOportunidadeId()).orElseThrow();
        return acesso.ehGestao(pessoaId)
                || acesso.tem(pessoaId, oportunidade.getOrganizacaoId(), Permissao.CONDUZIR_SELECAO);
    }

    private Avaliacao buscar(Long id) {
        return avaliacaoRepository.findById(id)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Avaliação não encontrada"));
    }

    private AvaliacaoResponse resposta(Avaliacao a, Candidatura c, boolean comAvaliador) {
        Vinculo vinculo = comAvaliador ? vinculoRepository.findById(a.getVinculoId()).orElse(null) : null;
        AvaliadorOportunidade designacao = designacaoRepository
                .findById(new AvaliadorOportunidadeId(a.getOportunidadeId(), a.getVinculoId())).orElse(null);
        RetificacaoParecer retificacao = retificacaoRepository.findFirstByAvaliacaoIdOrderByRetificadaEmDesc(a.getId()).orElse(null);
        return new AvaliacaoResponse(a.getId(), a.getCandidaturaId(), a.getOportunidadeId(), c.getTituloProposta(),
                c.getEstado(), a.getRodada(), vinculo == null ? null : vinculo.getId(),
                vinculo == null ? null : vinculo.getPessoa().getNome(), a.getAtribuidaEm(),
                designacao == null ? null : designacao.getPrazoAvaliacao(), a.getDecisao(), a.getParecer(),
                retificacao == null ? null : retificacao.getParecerRetificado(),
                retificacao == null ? null : retificacao.getRetificadaEm(),
                a.getNotaFinal(), a.getAssinadaEm());
    }

    private ResponseStatusException erro(HttpStatus status, String mensagem) {
        return new ResponseStatusException(status, mensagem);
    }
}
