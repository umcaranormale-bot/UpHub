package br.com.uphub.backend.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;

// codigo: só para a gestão; as squads recebem o código da coordenação, fora da plataforma
public record ResidenciaResponse(
        Long id,
        String nome,
        String descricao,
        String codigo,
        LocalDate inicio,
        LocalDate fim,
        String estado,
        int squads,
        int desafios,
        OffsetDateTime criadaEm,
        OffsetDateTime encerradaEm
) {
}
