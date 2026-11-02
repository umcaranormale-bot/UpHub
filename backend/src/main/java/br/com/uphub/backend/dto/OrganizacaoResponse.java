package br.com.uphub.backend.dto;

import br.com.uphub.backend.model.Organizacao;
import java.time.OffsetDateTime;

public record OrganizacaoResponse(
        Long id,
        String tipo,
        String nome,
        String razaoSocial,
        String cnpj,
        String porte,
        String setor,
        String estagio,
        Short anoFundacao,
        String sedeCidade,
        String sedeUf,
        OffsetDateTime criadaEm
) {

    public static OrganizacaoResponse de(Organizacao organizacao) {
        return new OrganizacaoResponse(
                organizacao.getId(),
                organizacao.getTipo(),
                organizacao.getNome(),
                organizacao.getRazaoSocial(),
                organizacao.getCnpj(),
                organizacao.getPorte(),
                organizacao.getSetor(),
                organizacao.getEstagio(),
                organizacao.getAnoFundacao(),
                organizacao.getSedeCidade(),
                organizacao.getSedeUf(),
                organizacao.getCriadaEm()
        );
    }
}