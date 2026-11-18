package br.com.uphub.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public record AutorizacaoNotaResponse(
        Long id,
        Long candidaturaId,
        Long resultadoProvaId,
        Long pessoaId,
        String pessoaNome,
        String area,
        BigDecimal notaCongelada,
        LocalDate dataProvaCongelada,
        LocalDate validaAte,
        OffsetDateTime autorizadaEm
) {
}
