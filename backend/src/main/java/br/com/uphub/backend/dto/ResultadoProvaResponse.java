package br.com.uphub.backend.dto;

import br.com.uphub.backend.model.ResultadoProva;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public record ResultadoProvaResponse(
        Long id,
        Long pessoaId,
        String area,
        BigDecimal nota,
        LocalDate dataProva,
        OffsetDateTime registradoEm
) {

    public static ResultadoProvaResponse de(ResultadoProva prova) {
        return new ResultadoProvaResponse(
                prova.getId(),
                prova.getPessoaId(),
                prova.getArea(),
                prova.getNota(),
                prova.getDataProva(),
                prova.getRegistradoEm()
        );
    }
}
