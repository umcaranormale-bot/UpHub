package br.com.uphub.backend.dto;

import java.time.OffsetDateTime;

import br.com.uphub.backend.model.Pessoa;

public record PessoaResponse(
        Long id,
        String nome,
        String email,
        String telefone,
        String fotoRef,
        OffsetDateTime criadaEm
) {

    public static PessoaResponse de(Pessoa pessoa) {
        return new PessoaResponse(
                pessoa.getId(),
                pessoa.getNome(),
                pessoa.getEmail(),
                pessoa.getTelefone(),
                pessoa.getFotoRef(),
                pessoa.getCriadaEm()
        );
    }
}