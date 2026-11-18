package br.com.uphub.backend.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public record SessaoMentoriaResponse(
        Long id,
        Long alocacaoId,
        Long candidaturaId,
        String mentorNome,
        Long sprintId,
        Short sprintNumero,
        LocalDate dataSessao,
        Short duracaoMinutos,
        String feedback,
        String situacao,
        OffsetDateTime assinadoEm,
        OffsetDateTime registradaEm
) {
}
