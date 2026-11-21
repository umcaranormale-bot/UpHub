package br.com.uphub.backend.dto;

// No cadastro, os dois são obrigatórios. Na edição, campo null = "não alterar".
public record ReservaVagasRequest(
        String criterio,
        Integer quantidade
) {
}
