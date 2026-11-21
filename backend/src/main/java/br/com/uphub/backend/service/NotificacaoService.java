package br.com.uphub.backend.service;

import br.com.uphub.backend.candidatura.MaquinaDeEstados.Ator;
import br.com.uphub.backend.dto.NotificacaoResponse;
import br.com.uphub.backend.dto.QuantidadeResponse;
import br.com.uphub.backend.model.Candidatura;
import br.com.uphub.backend.model.Notificacao;
import br.com.uphub.backend.model.Oportunidade;
import br.com.uphub.backend.model.Vinculo;
import br.com.uphub.backend.repository.NotificacaoRepository;
import br.com.uphub.backend.repository.OportunidadeRepository;
import br.com.uphub.backend.repository.VinculoRepository;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

// Notificações só dentro do site, sem e-mail (decisão de 17/11/2026): email_enviado_em fica sempre null.
@Service
public class NotificacaoService {

    // o nome de cada estado como a pessoa lê na tela
    private static final Map<String, String> ROTULOS_ESTADO = Map.ofEntries(
            Map.entry("ENVIADA", "enviada"), Map.entry("ELEGIVEL", "elegível"),
            Map.entry("NAO_ELEGIVEL", "não elegível"), Map.entry("EM_ANALISE", "em análise"),
            Map.entry("AJUSTE", "com ajuste pedido"), Map.entry("PERDA_DE_PRAZO", "com o prazo do ajuste perdido"),
            Map.entry("APROVADA", "aprovada"), Map.entry("REPROVADA", "reprovada"),
            Map.entry("HOMOLOGADA", "homologada"), Map.entry("LISTA_DE_ESPERA", "na lista de espera"),
            Map.entry("EM_ACOMPANHAMENTO", "em acompanhamento"), Map.entry("DESISTENTE", "desistente"),
            Map.entry("NAO_CONVOCADA", "não convocada"), Map.entry("DESCLASSIFICADA", "desclassificada"),
            Map.entry("DESCARTADA", "descartada"), Map.entry("CONCLUIDA", "concluída"));

    private final NotificacaoRepository repository;
    private final OportunidadeRepository oportunidadeRepository;
    private final VinculoRepository vinculoRepository;

    public NotificacaoService(NotificacaoRepository repository,
                              OportunidadeRepository oportunidadeRepository,
                              VinculoRepository vinculoRepository) {
        this.repository = repository;
        this.oportunidadeRepository = oportunidadeRepository;
        this.vinculoRepository = vinculoRepository;
    }

    // ---------- criar (chamado pelos gatilhos, dentro da transação de quem chamou)

    @Transactional
    public void criar(Long pessoaId, Long oportunidadeId, String titulo, String mensagem, String tipo) {
        if (!Notificacao.PEDE_ACAO.equals(tipo) && !Notificacao.INFORMATIVA.equals(tipo)) {
            throw new IllegalArgumentException("Tipo de notificação inválido: " + tipo);
        }
        if (pessoaId == null) {
            return;
        }
        repository.save(new Notificacao(pessoaId, oportunidadeId, titulo, mensagem, tipo));
    }

    // candidatura mudou de estado: informa quem criou a candidatura.
    // Fica de fora o que o próprio candidato fez e o AJUSTE, que já tem um aviso PEDE_ACAO só dele.
    @Transactional
    public void avisarMudancaDeEstado(Candidatura candidatura, Oportunidade oportunidade, Ator ator) {
        String estado = candidatura.getEstado();
        if (ator == Ator.CANDIDATO || "AJUSTE".equals(estado)) {
            return;
        }
        String rotulo = ROTULOS_ESTADO.getOrDefault(estado, estado);
        criar(candidatura.getCriadaPor(), oportunidade.getId(),
                "Sua candidatura está " + rotulo,
                "A candidatura \"" + candidatura.getTituloProposta() + "\" em " + oportunidade.getTitulo()
                        + " agora está " + rotulo + ".",
                Notificacao.INFORMATIVA);
    }

    // novo pedido de provedor: pede ação de todas as pessoas da gestão
    @Transactional
    public void avisarGestao(String titulo, String mensagem) {
        vinculoRepository.findByPapelAndEncerradoEmIsNull("GESTAO").stream()
                .map(v -> v.getPessoa().getId()).distinct()
                .forEach(pessoaId -> criar(pessoaId, null, titulo, mensagem, Notificacao.PEDE_ACAO));
    }

    // o aviso de prazo já saiu para este prazo? (evita repetir a cada volta do agendador)
    @Transactional(readOnly = true)
    public boolean jaAvisou(Long pessoaId, Long oportunidadeId, String titulo, OffsetDateTime desde) {
        return repository.existsByPessoaIdAndOportunidadeIdAndTituloAndCriadaEmAfter(pessoaId, oportunidadeId, titulo, desde);
    }

    // ---------- consultas da pessoa logada

    @Transactional(readOnly = true)
    public List<NotificacaoResponse> listar(Long pessoaId, boolean somenteNaoLidas) {
        List<Notificacao> lista = somenteNaoLidas
                ? repository.findTop50ByPessoaIdAndLidaEmIsNullOrderByCriadaEmDescIdDesc(pessoaId)
                : repository.findTop50ByPessoaIdOrderByCriadaEmDescIdDesc(pessoaId);
        return comTitulos(lista);
    }

    @Transactional(readOnly = true)
    public QuantidadeResponse contarNaoLidas(Long pessoaId) {
        return new QuantidadeResponse(repository.countByPessoaIdAndLidaEmIsNull(pessoaId));
    }

    // 404 tanto se não existe quanto se é de outra pessoa (não revela que a notificação existe)
    @Transactional
    public NotificacaoResponse marcarLida(Long id, Long pessoaId) {
        Notificacao notificacao = repository.findById(id)
                .filter(n -> n.getPessoaId().equals(pessoaId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notificação não encontrada"));
        if (notificacao.getLidaEm() == null) {
            notificacao.marcarLida(OffsetDateTime.now());
            notificacao = repository.save(notificacao);
        }
        return comTitulos(List.of(notificacao)).get(0);
    }

    @Transactional
    public QuantidadeResponse marcarTodasLidas(Long pessoaId) {
        return new QuantidadeResponse(repository.marcarTodasLidas(pessoaId));
    }

    // busca o título das oportunidades de uma vez (uma consulta, não uma por notificação)
    private List<NotificacaoResponse> comTitulos(List<Notificacao> lista) {
        List<Long> ids = lista.stream().map(Notificacao::getOportunidadeId).filter(Objects::nonNull).distinct().toList();
        Map<Long, String> titulos = oportunidadeRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Oportunidade::getId, Oportunidade::getTitulo));
        return lista.stream().map(n -> NotificacaoResponse.de(n, titulos.get(n.getOportunidadeId()))).toList();
    }
}
