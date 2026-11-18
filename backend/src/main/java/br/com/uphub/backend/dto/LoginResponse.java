package br.com.uphub.backend.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record LoginResponse(
        String token,
        OffsetDateTime expiraEm,
        PessoaResponse pessoa,
        List<VinculoResponse> vinculos
) {
}