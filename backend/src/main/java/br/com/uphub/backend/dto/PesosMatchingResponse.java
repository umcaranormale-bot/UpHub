package br.com.uphub.backend.dto;

import java.util.Map;

public record PesosMatchingResponse(
        String trilhaCodigo,
        Map<String, Integer> pesos
) {
}
