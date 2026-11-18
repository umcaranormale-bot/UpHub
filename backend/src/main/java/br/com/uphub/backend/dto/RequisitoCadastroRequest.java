package br.com.uphub.backend.dto;

import tools.jackson.databind.JsonNode;

public record RequisitoCadastroRequest(
        String campo,
        String operador,
        JsonNode valor,
        Boolean obrigatoria,
        Integer ordem
) {
}
