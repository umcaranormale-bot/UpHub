package br.com.uphub.backend.dto;

import br.com.uphub.backend.model.EventoAuditoria;
import java.time.OffsetDateTime;
import java.util.Map;

public record EventoAuditoriaResponse(
        Long id,
        OffsetDateTime ocorridoEm,
        Autor autor,
        String autorSistema,
        String papel,
        String acao,
        String entidadeTipo,
        Long entidadeId,
        Long oportunidadeId,
        Long candidaturaId,
        Long versaoId,
        String estadoAnterior,
        String estadoNovo,
        String justificativa
) {

    // a pessoa que agiu; null quando foi o sistema (autorSistema = "AGENDADOR")
    public record Autor(Long pessoaId, String nome) {
    }

    public static EventoAuditoriaResponse de(EventoAuditoria e, Map<Long, String> nomes) {
        Autor autor = e.getAutorPessoaId() == null ? null
                : new Autor(e.getAutorPessoaId(), nomes.get(e.getAutorPessoaId()));
        return new EventoAuditoriaResponse(
                e.getId(),
                e.getOcorridoEm(),
                autor,
                e.getAutorSistema(),
                e.getPapel(),
                e.getAcao(),
                e.getEntidadeTipo(),
                e.getEntidadeId(),
                e.getOportunidadeId(),
                e.getCandidaturaId(),
                e.getVersaoId(),
                e.getEstadoAnterior(),
                e.getEstadoNovo(),
                e.getJustificativa());
    }
}
