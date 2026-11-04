package br.com.uphub.backend.dto;

import br.com.uphub.backend.model.OrganizacaoTrilha;

public record OrganizacaoTrilhaResponse(
        Long organizacaoId,
        String organizacaoNome,
        String trilhaCodigo,
        String trilhaNome
) {

    public static OrganizacaoTrilhaResponse de(OrganizacaoTrilha associacao) {
        return new OrganizacaoTrilhaResponse(
                associacao.getId().getOrganizacaoId(),
                associacao.getOrganizacao().getNome(),
                associacao.getId().getTrilhaCodigo(),
                associacao.getTrilha().getNome()
        );
    }
}
