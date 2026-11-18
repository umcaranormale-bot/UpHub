package br.com.uphub.backend.dto;

public record DecisaoSolicitacaoRequest(
        String motivo,
        Boolean recusaPorDocumento
) {
}
