package br.com.uphub.backend.dto;

import br.com.uphub.backend.model.ParametroGargalo;

public record ParametroGargaloResponse(
        String etapa,
        int limiteDiasUteis
) {
    public static ParametroGargaloResponse de(ParametroGargalo p) {
        return new ParametroGargaloResponse(p.getEtapa(), p.getLimiteDiasUteis());
    }
}
