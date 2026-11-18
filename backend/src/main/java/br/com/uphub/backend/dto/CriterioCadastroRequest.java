package br.com.uphub.backend.dto;

import java.math.BigDecimal;

public record CriterioCadastroRequest(
        Integer ordem,
        String descricao,
        BigDecimal peso,
        BigDecimal escalaMin,
        BigDecimal escalaMax,
        String evidenciaEsperada
) {
}
