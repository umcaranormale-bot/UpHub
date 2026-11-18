package br.com.uphub.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

// Campo null = "não alterar".
public record VersaoOportunidadeEdicaoRequest(
        LocalDate prazoEnvio,
        BigDecimal notaMinima,
        Integer validadeNotaDias,
        Integer prazoAjusteDias,
        String escopo,
        String entregaveis,
        Integer cargaSemanalHoras,
        Integer duracaoSemanas,
        Integer quantidadeVagas
) {
}
