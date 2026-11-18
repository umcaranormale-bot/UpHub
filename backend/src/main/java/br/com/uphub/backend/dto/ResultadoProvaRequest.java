package br.com.uphub.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ResultadoProvaRequest(
        String area,
        BigDecimal nota,
        LocalDate dataProva
) {
}
