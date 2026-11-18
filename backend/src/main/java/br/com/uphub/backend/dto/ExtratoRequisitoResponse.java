package br.com.uphub.backend.dto;

import tools.jackson.databind.JsonNode;
import java.time.OffsetDateTime;

public record ExtratoRequisitoResponse(
        Long requisitoId,
        Short ordem,
        String campo,
        String operador,
        JsonNode valorExigido,
        boolean obrigatoria,
        String valorInformado,
        String situacao,
        OffsetDateTime avaliadoEm
) {
}
