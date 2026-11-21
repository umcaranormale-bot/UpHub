package br.com.uphub.backend.dto;

// campo null = "não alterar"
public record AvaliacaoRascunhoRequest(
        String decisao,
        String parecer
) {
}
