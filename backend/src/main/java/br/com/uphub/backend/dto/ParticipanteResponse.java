package br.com.uphub.backend.dto;

import java.time.OffsetDateTime;

public record ParticipanteResponse(
        Long candidaturaId,
        Long pessoaId,
        String nome,
        OffsetDateTime conviteEnviadoEm,
        OffsetDateTime confirmouEm
) {
}
