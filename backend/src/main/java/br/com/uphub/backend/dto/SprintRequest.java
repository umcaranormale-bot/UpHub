package br.com.uphub.backend.dto;

import java.time.LocalDate;

public record SprintRequest(
        LocalDate prazoEntrega
) {
}
