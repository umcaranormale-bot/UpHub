package br.com.uphub.backend.dto;

public record CandidaturaEnvioResponse(
        CandidaturaResponse candidatura,
        ElegibilidadeResponse elegibilidade
) {
}
