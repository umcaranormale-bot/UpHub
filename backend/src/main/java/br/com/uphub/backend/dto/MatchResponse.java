package br.com.uphub.backend.dto;

import java.time.LocalDate;
import java.util.List;

// Uma linha do ranking: a oportunidade (para quem se candidata) ou a organização (para o provedor), com a nota e o porquê.
public record MatchResponse(
        Long oportunidadeId,
        String oportunidadeTitulo,
        String trilhaCodigo,
        String area,
        LocalDate prazoEnvio,
        Long organizacaoId,
        String organizacaoNome,
        String organizacaoTipo,
        int compatibilidade,
        String elegibilidade,
        boolean jaSeCandidatou,
        List<Motivo> motivos
) {
    public record Motivo(String criterio, int peso, int pontos, String explicacao) {
    }
}
