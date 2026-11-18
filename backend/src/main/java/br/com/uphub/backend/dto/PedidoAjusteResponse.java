package br.com.uphub.backend.dto;

import java.time.OffsetDateTime;

public record PedidoAjusteResponse(
        Long id,
        Long candidaturaId,
        Long avaliacaoId,
        Short rodada,
        OffsetDateTime pedidoEm,
        OffsetDateTime prazoReenvio,
        String situacao,
        String resposta,
        OffsetDateTime reenviadoEm,
        OffsetDateTime prazoPerdidoEm,
        OffsetDateTime reabertoEm,
        String estadoCandidatura
) {
}
