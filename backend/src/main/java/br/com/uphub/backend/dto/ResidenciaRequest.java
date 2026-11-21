package br.com.uphub.backend.dto;

import java.time.LocalDate;

// No cadastro, nome, inicio e fim são obrigatórios. Na edição, campo null = "não alterar".
public record ResidenciaRequest(
        String nome,
        String descricao,
        LocalDate inicio,
        LocalDate fim
) {
}
