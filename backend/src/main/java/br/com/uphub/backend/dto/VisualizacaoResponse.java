package br.com.uphub.backend.dto;

import java.time.OffsetDateTime;

public record VisualizacaoResponse(
        Long organizacaoId,
        String organizacaoNome,
        OffsetDateTime primeiraEm,
        OffsetDateTime ultimaEm
) {
}
