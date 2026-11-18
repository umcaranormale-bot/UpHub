package br.com.uphub.backend.dto;

import java.util.List;

public record ExtratoElegibilidadeResponse(
        Long candidaturaId,
        Long versaoId,
        String estado,
        String situacao,
        List<ExtratoRequisitoResponse> requisitos,
        List<String> faltou
) {
}
