package br.com.uphub.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

// vinculoId e avaliadorNome vêm vazios para a organização candidata (avaliação às cegas).
// parecerRetificado: o texto em vigor depois da última retificação (vazio se nunca foi retificado)
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
        String parecerRetificado,
        OffsetDateTime retificadaEm,
        BigDecimal notaFinal,
        OffsetDateTime assinadaEm
) {
}
