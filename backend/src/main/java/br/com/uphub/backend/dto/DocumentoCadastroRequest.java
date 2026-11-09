package br.com.uphub.backend.dto;

import java.time.LocalDate;

public record DocumentoCadastroRequest(
        Long organizacaoId,
        Long enviadoPor,
        String tipo,
        String nomeArquivo,
        Long tamanhoBytes,
        String tipoMime,
        String armazenamentoRef,
        LocalDate validade,
        Boolean textoPesquisavel
) {
}