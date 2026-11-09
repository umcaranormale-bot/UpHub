package br.com.uphub.backend.dto;

import br.com.uphub.backend.model.Squad;

public record SquadResponse(
        Long organizacaoId,
        String nome,
        String descricao,
        String codigoCoordenacao
) {

    public static SquadResponse de(Squad squad) {
        return new SquadResponse(
                squad.getOrganizacaoId(),
                squad.getOrganizacao().getNome(),
                squad.getDescricao(),
                squad.getCodigoCoordenacao()
        );
    }
}