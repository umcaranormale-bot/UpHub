package br.com.uphub.backend.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;

// A favorita com o que a tela precisa para mostrar o cartão, sem outra chamada.
public record FavoritaResponse(
        Long organizacaoId,
        Long oportunidadeId,
        String titulo,
        String trilhaCodigo,
        String estado,
        String provedorNome,
        LocalDate prazoEnvio,
        Autor favoritadaPor,
        OffsetDateTime favoritadaEm
) {
    public record Autor(Long pessoaId, String nome) {
    }
}
