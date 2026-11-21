package br.com.uphub.backend.dto;

// campo null = "não alterar". O tipo não muda depois do cadastro.
public record OrganizacaoEdicaoRequest(
        String nome,
        String razaoSocial,
        String cnpj,
        String porte,
        String setor,
        String estagio,
        Short anoFundacao,
        String sedeCidade,
        String sedeUf,
        String descricao,
        Long deckDocumentoId
) {
}
