package br.com.uphub.backend.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

// nota vazia = o avaliador ainda não deu nota neste critério
public record NotaCriterioResponse(
        Long avaliacaoId,
        Long criterioId,
        Short ordem,
        String descricao,
        BigDecimal peso,
        BigDecimal escalaMin,
        BigDecimal escalaMax,
        String evidenciaEsperada,
        BigDecimal nota,
        OffsetDateTime registradaEm
) {
}
