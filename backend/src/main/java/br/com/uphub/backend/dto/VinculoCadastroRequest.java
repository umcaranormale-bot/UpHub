package br.com.uphub.backend.dto;

public record VinculoCadastroRequest(
        Long pessoaId,
        Long organizacaoId,
        String papel,
        String funcao,
        Boolean representante
) {
}