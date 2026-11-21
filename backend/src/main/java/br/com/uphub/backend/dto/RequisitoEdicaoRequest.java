package br.com.uphub.backend.dto;

import tools.jackson.databind.JsonNode;

// Campo null = "não alterar". Para mudar a regra, mande campo, operador e valor juntos.
public record RequisitoEdicaoRequest(
        String campo,
        String operador,
        JsonNode valor,
        Boolean obrigatoria,
        Integer ordem
) {
}
