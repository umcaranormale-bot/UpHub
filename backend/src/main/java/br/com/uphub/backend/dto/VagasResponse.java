package br.com.uphub.backend.dto;

import java.util.List;

// total vazio = a oportunidade não limita vagas
public record VagasResponse(
        Long oportunidadeId,
        Integer total,
        int ocupadas,
        Integer livres,
        List<Reserva> reservas,
        List<NaLista> listaDeEspera
) {
    public record Reserva(String criterio, int quantidade, int ocupadas) {
    }

    public record NaLista(Long candidaturaId, String tituloProposta, Short posicao) {
    }
}
