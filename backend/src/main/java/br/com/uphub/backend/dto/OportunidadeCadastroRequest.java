package br.com.uphub.backend.dto;

public record OportunidadeCadastroRequest(
        Long organizacaoId,
        String trilhaCodigo,
        String titulo,
        String resumo,
        Long criadaPor
) {
}