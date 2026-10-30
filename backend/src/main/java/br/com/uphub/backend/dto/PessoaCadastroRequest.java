package br.com.uphub.backend.dto;

public record PessoaCadastroRequest(
        String nome,
        String email,
        String telefone,
        String senha
) {
}