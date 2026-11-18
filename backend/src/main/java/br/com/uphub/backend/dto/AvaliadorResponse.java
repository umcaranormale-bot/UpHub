package br.com.uphub.backend.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public record AvaliadorResponse(
        Long oportunidadeId,
        String oportunidadeTitulo,
        Long vinculoId,
        Long pessoaId,
        String nome,
        LocalDate prazoAvaliacao,
        Long designadoPor,
        OffsetDateTime designadoEm
) {
}
