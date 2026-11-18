package br.com.uphub.backend.dto;

import java.math.BigDecimal;

public record AvaliacaoEntregaRequest(
        BigDecimal nota,
        String feedback
) {
}
