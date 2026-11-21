package br.com.uphub.backend.dto;

import java.time.LocalDate;

// No registro, dataSessao e duracaoMinutos são obrigatórios. Na edição, campo null = "não alterar".
public record SessaoMentoriaRequest(
        LocalDate dataSessao,
        Integer duracaoMinutos,
        Long sprintId,
        String feedback
) {
}
