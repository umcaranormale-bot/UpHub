package br.com.uphub.backend.dto;

public record LoginRequest(
        String email,
        String senha
) {
}