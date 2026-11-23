package br.com.uphub.backend.service;

import br.com.uphub.backend.model.Candidatura;
import br.com.uphub.backend.model.EventoAuditoria;
import br.com.uphub.backend.repository.EventoAuditoriaRepository;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditoriaService {

    public static final String AGENDADOR = "AGENDADOR";

    // os mesmos valores do tipo AcaoAuditoria do front (frontend/src/api/auditoria.ts)
    public static final Set<String> ACOES = Set.of(
            "OPORTUNIDADE_CRIADA", "OPORTUNIDADE_PUBLICADA", "VERSAO_PUBLICADA", "OPORTUNIDADE_ENCERRADA",
            "OPORTUNIDADE_SUSPENSA", "CANDIDATURA_ENVIADA", "ESTADO_ALTERADO", "ESTAGIO_FUNIL_ALTERADO",
            "AVALIADOR_DESIGNADO", "AVALIACAO_ATRIBUIDA", "AVALIACAO_ASSINADA", "PARECER_RETIFICADO",
            "AJUSTE_PEDIDO", "PRAZO_REABERTO", "RESULTADO_HOMOLOGADO", "PROVEDOR_APROVADO",
            "PROVEDOR_RECUSADO", "PROVEDOR_REVOGADO", "CONVITE_ENVIADO", "CONVITE_ACEITO",
            "CONVITE_EXPIRADO", "MENTOR_CONVIDADO", "ALOCACAO_RESPONDIDA", "SPRINT_AVALIADA");

    // papel de quem agiu; quando o autor é o sistema, o papel fica null
    public static final Set<String> PAPEIS = Set.of("PROVEDOR", "CANDIDATO", "AVALIADOR", "MENTOR", "GESTAO");

    private final EventoAuditoriaRepository repository;

    public AuditoriaService(EventoAuditoriaRepository repository) {
        this.repository = repository;
    }

    // grava dentro da transação de quem chamou: se a mudança der erro e voltar atrás, o registro volta junto
    @Transactional
    public void registrar(Long autorPessoaId, String autorSistema, String papel,
                          String acao, String entidadeTipo, Long entidadeId,
                          Long oportunidadeId, Long candidaturaId, Long versaoId,
                          String estadoAnterior, String estadoNovo, String justificativa) {
        if (autorPessoaId == null && (autorSistema == null || autorSistema.isBlank())) {
            throw new IllegalArgumentException("Todo evento de auditoria precisa de um autor (pessoa ou sistema)");
        }
        if (!ACOES.contains(acao)) {
            throw new IllegalArgumentException("Ação de auditoria fora do contrato: " + acao);
        }
        if (autorPessoaId == null ? papel != null : !PAPEIS.contains(papel)) {
            throw new IllegalArgumentException("Papel de auditoria inválido: " + papel);
        }
        repository.save(new EventoAuditoria(autorPessoaId, autorSistema, papel, acao, entidadeTipo,
                entidadeId, oportunidadeId, candidaturaId, versaoId, estadoAnterior, estadoNovo, justificativa));
    }

    // atalho para as mudanças de estado da candidatura
    @Transactional
    public void registrarTransicaoCandidatura(Candidatura candidatura, Long autorPessoaId, String autorSistema,
                                              String papel, String estadoAnterior, String estadoNovo,
                                              String justificativa) {
        registrar(autorPessoaId, autorSistema, papel,
                acaoDaTransicao(estadoAnterior, estadoNovo), "CANDIDATURA", candidatura.getId(),
                candidatura.getOportunidadeId(), candidatura.getId(), null,
                estadoAnterior, estadoNovo, justificativa);
    }

    // o nome da ação segue o contrato; o detalhe (de qual estado para qual) vai em estadoAnterior e estadoNovo
    static String acaoDaTransicao(String estadoAnterior, String estadoNovo) {
        if ("RASCUNHO".equals(estadoAnterior)) {
            return "CANDIDATURA_ENVIADA";
        }
        if ("AJUSTE".equals(estadoNovo)) {
            return "PERDA_DE_PRAZO".equals(estadoAnterior) ? "PRAZO_REABERTO" : "AJUSTE_PEDIDO";
        }
        if ("HOMOLOGADA".equals(estadoNovo)) {
            return "RESULTADO_HOMOLOGADO";
        }
        return "ESTADO_ALTERADO";
    }
}
