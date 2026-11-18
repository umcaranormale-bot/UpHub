package br.com.uphub.backend.dto;

import java.util.List;

public record SessaoResponse(
        PessoaResponse pessoa,
        List<VinculoResponse> vinculos
) {
}