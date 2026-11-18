package br.com.uphub.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public record AlocacaoResponse(
        Long id,
        Long candidaturaId,
        String tituloProposta,
        String estadoCandidatura,
        Long vinculoId,
        String mentorNome,
        String areaAtuacao,
        BigDecimal horasPrevistasMes,
        LocalDate prazoResposta,
        String situacao,
        OffsetDateTime convidadaEm,
        OffsetDateTime respondidaEm
) {
}
