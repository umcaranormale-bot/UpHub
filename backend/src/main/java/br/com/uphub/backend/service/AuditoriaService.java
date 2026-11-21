package br.com.uphub.backend.service;

import br.com.uphub.backend.model.Candidatura;
import br.com.uphub.backend.model.EventoAuditoria;
import br.com.uphub.backend.repository.EventoAuditoriaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditoriaService {

    public static final String AGENDADOR = "AGENDADOR";

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
        repository.save(new EventoAuditoria(autorPessoaId, autorSistema, papel, acao, entidadeTipo,
                entidadeId, oportunidadeId, candidaturaId, versaoId, estadoAnterior, estadoNovo, justificativa));
    }

    // atalho para as mudanças de estado da candidatura
    @Transactional
    public void registrarTransicaoCandidatura(Candidatura candidatura, Long autorPessoaId, String autorSistema,
                                              String papel, String estadoAnterior, String estadoNovo,
                                              String justificativa) {
        registrar(autorPessoaId, autorSistema, papel,
                "CANDIDATURA_" + estadoNovo, "CANDIDATURA", candidatura.getId(),
                candidatura.getOportunidadeId(), candidatura.getId(), null,
                estadoAnterior, estadoNovo, justificativa);
    }
}
