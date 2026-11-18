package br.com.uphub.backend.dto;

public record ConferenciaAutodeclaracaoRequest(
        Boolean confirmada,
        String motivo
) {
}
