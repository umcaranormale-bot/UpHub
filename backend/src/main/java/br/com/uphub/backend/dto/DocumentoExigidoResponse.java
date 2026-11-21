package br.com.uphub.backend.dto;

import br.com.uphub.backend.model.DocumentoExigido;

public record DocumentoExigidoResponse(
        Long id,
        Long versaoId,
        String nome,
        boolean obrigatorio
) {

    public static DocumentoExigidoResponse de(DocumentoExigido documento) {
        return new DocumentoExigidoResponse(
                documento.getId(),
                documento.getVersao().getId(),
                documento.getNome(),
                documento.isObrigatorio()
        );
    }
}
