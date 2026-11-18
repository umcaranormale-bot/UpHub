package br.com.uphub.backend.dto;

import java.time.LocalDate;

public record AnexoResponse(
        Long candidaturaId,
        Long documentoId,
        String tipo,
        String nomeArquivo,
        String tipoMime,
        long tamanhoBytes,
        LocalDate validade,
        Long documentoExigidoId,
        String documentoExigidoNome
) {
}
