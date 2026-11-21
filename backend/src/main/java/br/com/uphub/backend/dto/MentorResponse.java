package br.com.uphub.backend.dto;

import java.math.BigDecimal;

// horasLivresMes vazio = o mentor não informou a disponibilidade
public record MentorResponse(
        Long vinculoId,
        Long pessoaId,
        String nome,
        Long organizacaoId,
        String areaAtuacao,
        BigDecimal horasDisponiveisMes,
        BigDecimal horasComprometidasMes,
        BigDecimal horasLivresMes
) {
}
