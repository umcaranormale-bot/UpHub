package br.com.uphub.backend.dto;

import br.com.uphub.backend.model.ReservaVagas;

public record ReservaVagasResponse(
        Long id,
        Long versaoId,
        String criterio,
        int quantidade
) {

    public static ReservaVagasResponse de(ReservaVagas reserva) {
        return new ReservaVagasResponse(
                reserva.getId(),
                reserva.getVersao().getId(),
                reserva.getCriterio(),
                reserva.getQuantidade()
        );
    }
}
