package br.com.uphub.backend.dto;

public record ItemAjusteRequest(
        String descricao,
        String detalhe,
        Long documentoExigidoId
) {
}
