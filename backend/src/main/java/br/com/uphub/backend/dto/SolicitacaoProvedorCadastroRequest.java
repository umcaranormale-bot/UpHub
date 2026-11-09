package br.com.uphub.backend.dto;

public record SolicitacaoProvedorCadastroRequest(
        Long organizacaoId,
        Long solicitanteId,
        String emailInstitucional,
        Long documentoId,
        Long solicitacaoAnteriorId,
        String respostaRecusa
) {
}