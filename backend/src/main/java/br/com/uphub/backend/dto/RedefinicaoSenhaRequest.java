package br.com.uphub.backend.dto;

public record RedefinicaoSenhaRequest(
        String token,
        String senha
) {
}