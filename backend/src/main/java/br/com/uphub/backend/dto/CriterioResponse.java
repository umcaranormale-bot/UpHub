package br.com.uphub.backend.dto;

import br.com.uphub.backend.model.Criterio;
import java.math.BigDecimal;

public record CriterioResponse(
        Long id,
        Long versaoId,
        Short ordem,
        String descricao,
        BigDecimal peso,
        BigDecimal escalaMin,
        BigDecimal escalaMax,
        String evidenciaEsperada
) {

    public static CriterioResponse de(Criterio criterio) {
        return new CriterioResponse(
                criterio.getId(),
                criterio.getVersao().getId(),
                criterio.getOrdem(),
                criterio.getDescricao(),
                criterio.getPeso(),
                criterio.getEscalaMin(),
                criterio.getEscalaMax(),
                criterio.getEvidenciaEsperada()
        );
    }
}
