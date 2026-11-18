package br.com.uphub.backend.dto;

import br.com.uphub.backend.model.Oportunidade;
import java.time.OffsetDateTime;

public record OportunidadeResponse(
        Long id,
        Long organizacaoId,
        String trilhaCodigo,
        String titulo,
        String resumo,
        String estado,
        Long criadaPor,
        OffsetDateTime criadaEm,
        OffsetDateTime publicadaEm,
        OffsetDateTime encerradaEm
) {

    public static OportunidadeResponse de(Oportunidade oportunidade) {
        return new OportunidadeResponse(
                oportunidade.getId(),
                oportunidade.getOrganizacaoId(),
                oportunidade.getTrilhaCodigo(),
                oportunidade.getTitulo(),
                oportunidade.getResumo(),
                oportunidade.getEstado(),
                oportunidade.getCriadaPor(),
                oportunidade.getCriadaEm(),
                oportunidade.getPublicadaEm(),
                oportunidade.getEncerradaEm()
        );
    }
}