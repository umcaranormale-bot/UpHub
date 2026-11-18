package br.com.uphub.backend.dto;

import br.com.uphub.backend.model.RetificacaoParecer;
import java.time.OffsetDateTime;

public record RetificacaoResponse(
        Long id,
        Long avaliacaoId,
        String parecerRetificado,
        String justificativa,
        OffsetDateTime retificadaEm
) {
    public static RetificacaoResponse de(RetificacaoParecer r) {
        return new RetificacaoResponse(r.getId(), r.getAvaliacaoId(), r.getParecerRetificado(), r.getJustificativa(),
                r.getRetificadaEm());
    }
}
