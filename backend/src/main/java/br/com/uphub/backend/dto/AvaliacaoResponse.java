package br.com.uphub.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

// vinculoId e avaliadorNome vêm vazios para a organização candidata (avaliação às cegas)
public record AvaliacaoResponse(
        Long id,
        Long candidaturaId,
        Long oportunidadeId,
        String tituloProposta,
        String estadoCandidatura,
        Short rodada,
        Long vinculoId,
        String avaliadorNome,
        OffsetDateTime atribuidaEm,
        LocalDate prazoAvaliacao,
        String decisao,
        String parecer,
        BigDecimal notaFinal,
        OffsetDateTime assinadaEm
) {
}
