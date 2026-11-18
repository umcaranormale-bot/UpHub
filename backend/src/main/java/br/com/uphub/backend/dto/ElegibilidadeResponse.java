package br.com.uphub.backend.dto;

import br.com.uphub.backend.elegibilidade.MotorElegibilidade;
import java.util.List;

public record ElegibilidadeResponse(
        Long organizacaoId,
        Long versaoId,
        String situacao,
        List<MotorElegibilidade.ResultadoRequisito> requisitos,
        List<String> faltou
) {
}
