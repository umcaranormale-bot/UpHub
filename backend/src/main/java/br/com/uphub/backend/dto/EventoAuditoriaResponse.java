package br.com.uphub.backend.dto;

import br.com.uphub.backend.model.EventoAuditoria;
import java.time.OffsetDateTime;

public record EventoAuditoriaResponse(
        Long id,
        OffsetDateTime ocorridoEm,
        Long autorPessoaId,
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

    public static EventoAuditoriaResponse de(EventoAuditoria e) {
        return new EventoAuditoriaResponse(
                e.getId(),
                e.getOcorridoEm(),
                e.getAutorPessoaId(),
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