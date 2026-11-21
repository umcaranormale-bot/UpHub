package br.com.uphub.backend.dto;

public record ConfirmacaoEmailRequest(
        String email,
        String codigo
) {
}