package br.com.uphub.backend.dto;

import java.util.Set;

public record TransicaoResponse(
        String de,
        String para,
        Set<String> quemPode
) {
}
