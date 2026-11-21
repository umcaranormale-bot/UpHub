package br.com.uphub.backend.dto;

// No cadastro, nome é obrigatório. Na edição, campo null = "não alterar".
public record DocumentoExigidoRequest(
        String nome,
        Boolean obrigatorio
) {
}
