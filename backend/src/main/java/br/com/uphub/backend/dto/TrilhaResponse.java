package br.com.uphub.backend.dto;

import br.com.uphub.backend.model.Trilha;

public record TrilhaResponse(String codigo, String nome) {
    public static TrilhaResponse de(Trilha trilha) {
        return new TrilhaResponse(trilha.getCodigo(), trilha.getNome());
    }
}