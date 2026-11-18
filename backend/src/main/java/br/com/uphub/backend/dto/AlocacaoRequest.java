package br.com.uphub.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AlocacaoRequest(
        Long vinculoId,
        BigDecimal horasPrevistasMes,
        LocalDate prazoResposta
) {
}
