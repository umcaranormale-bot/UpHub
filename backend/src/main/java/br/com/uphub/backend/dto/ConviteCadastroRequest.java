package br.com.uphub.backend.dto;

public record ConviteCadastroRequest(
        String email,
        String papel,
        Long organizacaoId,
        Long enviadoPor
) {
}