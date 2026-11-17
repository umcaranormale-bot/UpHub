package br.com.uphub.backend.dto;

import java.math.BigDecimal;

// Campo null = "não alterar".
public record CriterioEdicaoRequest(
        Long pessoaId,
        Integer ordem,
        String descricao,
        BigDecimal peso,
        BigDecimal escalaMin,
        BigDecimal escalaMax,
        String evidenciaEsperada
) {
}
