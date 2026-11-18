package br.com.uphub.backend.dto;

public record SquadCadastroRequest(
        Long organizacaoId,
        String descricao,
        String codigoCoordenacao
) {
}