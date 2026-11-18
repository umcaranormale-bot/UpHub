package br.com.uphub.backend.dto;

import java.math.BigDecimal;

// No cadastro, organizacaoId é obrigatório. Na edição, campo null = "não alterar".
public record CandidaturaRequest(
        Long organizacaoId,
        String tituloProposta,
        String resumoExecutivo,
        BigDecimal valorSolicitado
) {
}
