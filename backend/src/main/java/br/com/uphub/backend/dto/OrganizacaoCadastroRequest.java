package br.com.uphub.backend.dto;

public record OrganizacaoCadastroRequest(
        String tipo,
        String nome,
        String razaoSocial,
        String cnpj,
        String porte,
        String setor,
        String estagio,
        Short anoFundacao,
        String sedeCidade,
        String sedeUf
) {
}