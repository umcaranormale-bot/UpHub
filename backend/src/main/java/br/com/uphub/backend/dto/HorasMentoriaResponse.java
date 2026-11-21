package br.com.uphub.backend.dto;

import java.math.BigDecimal;

// mes: "AAAA-MM". Só as sessões assinadas contam como realizadas.
public record HorasMentoriaResponse(
        Long alocacaoId,
        String mes,
        BigDecimal horasPrevistasMes,
        int minutosRealizados,
        BigDecimal horasRealizadas,
        int sessoesAssinadas
) {
}
