package br.com.uphub.backend.dto;

import java.time.OffsetDateTime;

public record ItemAjusteResponse(
        Long id,
        Long pedidoAjusteId,
        String descricao,
        String detalhe,
        Long documentoExigidoId,
        String documentoExigidoNome,
        Long documentoNovoId,
        OffsetDateTime corrigidoEm
) {
}
