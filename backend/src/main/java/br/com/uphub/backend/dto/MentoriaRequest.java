package br.com.uphub.backend.dto;

import java.math.BigDecimal;

public record MentoriaRequest(
        String areaAtuacao,
        BigDecimal horasDisponiveisMes
) {
}
