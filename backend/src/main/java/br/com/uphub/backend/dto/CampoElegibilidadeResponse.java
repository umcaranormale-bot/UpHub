package br.com.uphub.backend.dto;

import java.util.List;

public record CampoElegibilidadeResponse(
        String campo,
        String descricao,
        String tipo,
        List<String> operadores
) {
}
