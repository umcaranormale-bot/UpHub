package br.com.uphub.backend.dto;

public record AceiteConviteRequest(
        String codigo,
        String nome,
        String senha
) {
}