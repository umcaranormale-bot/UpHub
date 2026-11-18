package br.com.uphub.backend.dto;

import br.com.uphub.backend.model.RequisitoElegibilidade;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

public record RequisitoResponse(
        Long id,
        Long versaoId,
        Short ordem,
        String campo,
        String operador,
        JsonNode valor,
        boolean obrigatoria
) {

    private static final JsonMapper JSON = JsonMapper.builder().build();

    public static RequisitoResponse de(RequisitoElegibilidade requisito) {
        return new RequisitoResponse(
                requisito.getId(),
                requisito.getVersao().getId(),
                requisito.getOrdem(),
                requisito.getCampo(),
                requisito.getOperador(),
                requisito.getValor() == null ? null : JSON.readTree(requisito.getValor()),
                requisito.isObrigatoria()
        );
    }
}
