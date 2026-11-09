package br.com.uphub.backend.dto;

import br.com.uphub.backend.model.Vinculo;
import java.time.OffsetDateTime;

public record VinculoResponse(
        Long id,
        Long pessoaId,
        String pessoaNome,
        Long organizacaoId,
        String organizacaoNome,
        String papel,
        String funcao,
        boolean representante,
        OffsetDateTime ativoDesde,
        OffsetDateTime encerradoEm
) {

    public static VinculoResponse de(Vinculo vinculo) {
        return new VinculoResponse(
                vinculo.getId(),
                vinculo.getPessoa().getId(),
                vinculo.getPessoa().getNome(),
                vinculo.getOrganizacao().getId(),
                vinculo.getOrganizacao().getNome(),
                vinculo.getPapel(),
                vinculo.getFuncao(),
                vinculo.isRepresentante(),
                vinculo.getAtivoDesde(),
                vinculo.getEncerradoEm()
        );
    }
}