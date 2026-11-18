package br.com.uphub.backend.dto;

import java.time.LocalDate;

public record AvaliadorRequest(
        Long vinculoId,
        LocalDate prazoAvaliacao
) {
}
