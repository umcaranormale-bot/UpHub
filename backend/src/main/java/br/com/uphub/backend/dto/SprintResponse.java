package br.com.uphub.backend.dto;

import br.com.uphub.backend.model.Sprint;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public record SprintResponse(
        Long id,
        Long candidaturaId,
        Short numero,
        String estado,
        LocalDate prazoEntrega,
        String entregaDescricao,
        OffsetDateTime entregaRegistradaEm,
        BigDecimal notaEntrega,
        String feedbackEntrega,
        OffsetDateTime avaliadaEm
) {
    public static SprintResponse de(Sprint s) {
        return new SprintResponse(s.getId(), s.getCandidaturaId(), s.getNumero(), s.getEstado(), s.getPrazoEntrega(),
                s.getEntregaDescricao(), s.getEntregaRegistradaEm(), s.getNotaEntrega(), s.getFeedbackEntrega(),
                s.getAvaliadaEm());
    }
}
