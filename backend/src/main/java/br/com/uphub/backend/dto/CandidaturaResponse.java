package br.com.uphub.backend.dto;

import br.com.uphub.backend.candidatura.MaquinaDeEstados;
import br.com.uphub.backend.model.Candidatura;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Set;

public record CandidaturaResponse(
        Long id,
        Long oportunidadeId,
        Long versaoId,
        Long organizacaoId,
        Long criadaPor,
        String tituloProposta,
        String resumoExecutivo,
        BigDecimal valorSolicitado,
        String estado,
        Set<String> proximosEstados,
        String estagioFunil,
        Short posicaoLista,
        OffsetDateTime salvaEm,
        OffsetDateTime enviadaEm,
        OffsetDateTime criadaEm
) {

    public static CandidaturaResponse de(Candidatura c) {
        return new CandidaturaResponse(
                c.getId(),
                c.getOportunidadeId(),
                c.getVersaoId(),
                c.getOrganizacaoId(),
                c.getCriadaPor(),
                c.getTituloProposta(),
                c.getResumoExecutivo(),
                c.getValorSolicitado(),
                c.getEstado(),
                MaquinaDeEstados.proximos(c.getEstado()),
                c.getEstagioFunil(),
                c.getPosicaoLista(),
                c.getSalvaEm(),
                c.getEnviadaEm(),
                c.getCriadaEm()
        );
    }
}
