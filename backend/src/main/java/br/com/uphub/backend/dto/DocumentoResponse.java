package br.com.uphub.backend.dto;

import br.com.uphub.backend.model.Documento;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public record DocumentoResponse(
        Long id,
        Long organizacaoId,
        String organizacaoNome,
        Long enviadoPorId,
        String enviadoPorNome,
        String tipo,
        String nomeArquivo,
        long tamanhoBytes,
        String tipoMime,
        LocalDate validade,
        Boolean textoPesquisavel,
        OffsetDateTime enviadoEm
) {

    public static DocumentoResponse de(Documento documento) {
        return new DocumentoResponse(
                documento.getId(),
                documento.getOrganizacao().getId(),
                documento.getOrganizacao().getNome(),
                documento.getEnviadoPor().getId(),
                documento.getEnviadoPor().getNome(),
                documento.getTipo(),
                documento.getNomeArquivo(),
                documento.getTamanhoBytes(),
                documento.getTipoMime(),
                documento.getValidade(),
                documento.getTextoPesquisavel(),
                documento.getEnviadoEm()
        );
    }
}