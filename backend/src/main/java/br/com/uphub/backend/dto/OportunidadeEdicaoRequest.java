package br.com.uphub.backend.dto;

// campo null = "não alterar"
public record OportunidadeEdicaoRequest(
        String titulo,
        String resumo,
        String area,
        String tese
) {
}
