package br.com.uphub.backend.dto;

import br.com.uphub.backend.model.AutodeclaracaoReserva;
import java.time.OffsetDateTime;

public record AutodeclaracaoResponse(
        Long candidaturaId,
        String criterio,
        OffsetDateTime declaradaEm,
        String situacao,
        Long conferidaPor,
        OffsetDateTime conferidaEm,
        String motivoRecusa,
        String estadoCandidatura
) {
    public static AutodeclaracaoResponse de(AutodeclaracaoReserva a, String estadoCandidatura) {
        return new AutodeclaracaoResponse(a.getId().getCandidaturaId(), a.getId().getCriterio(), a.getDeclaradaEm(),
                a.getSituacao(), a.getConferidaPor(), a.getConferidaEm(), a.getMotivoRecusa(), estadoCandidatura);
    }
}
