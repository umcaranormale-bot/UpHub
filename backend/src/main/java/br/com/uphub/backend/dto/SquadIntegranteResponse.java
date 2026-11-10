package br.com.uphub.backend.dto;

import br.com.uphub.backend.model.SquadIntegrante;

public record SquadIntegranteResponse(
        Long squadId,
        Long pessoaId,
        String nome,
        String competencia
) {

    public static SquadIntegranteResponse de(SquadIntegrante integrante) {
        return new SquadIntegranteResponse(
                integrante.getId().getSquadId(),
                integrante.getId().getPessoaId(),
                integrante.getPessoa().getNome(),
                integrante.getCompetencia()
        );
    }
}