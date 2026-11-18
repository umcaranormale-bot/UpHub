package br.com.uphub.backend.dto;

import br.com.uphub.backend.model.VersaoOportunidade;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public record VersaoOportunidadeResponse(
        Long id,
        Long oportunidadeId,
        Integer numero,
        boolean publicada,
        LocalDate prazoEnvio,
        BigDecimal notaMinima,
        Short validadeNotaDias,
        Short prazoAjusteDias,
        String escopo,
        String entregaveis,
        Short cargaSemanalHoras,
        Short duracaoSemanas,
        Integer quantidadeVagas,
        Long criadaPor,
        OffsetDateTime criadaEm,
        OffsetDateTime publicadaEm
) {

    public static VersaoOportunidadeResponse de(VersaoOportunidade versao) {
        return new VersaoOportunidadeResponse(
                versao.getId(),
                versao.getOportunidadeId(),
                versao.getNumero(),
                versao.isPublicada(),
                versao.getPrazoEnvio(),
                versao.getNotaMinima(),
                versao.getValidadeNotaDias(),
                versao.getPrazoAjusteDias(),
                versao.getEscopo(),
                versao.getEntregaveis(),
                versao.getCargaSemanalHoras(),
                versao.getDuracaoSemanas(),
                versao.getQuantidadeVagas(),
                versao.getCriadaPor(),
                versao.getCriadaEm(),
                versao.getPublicadaEm()
        );
    }
}
