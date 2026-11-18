package br.com.uphub.backend.dto;

import java.time.OffsetDateTime;

public record ConviteValidacaoResponse(
        String organizacaoNome,
        String convidadoPor,
        String papel,
        String email,
        OffsetDateTime expiraEm,
        boolean contaExistente
) {
}