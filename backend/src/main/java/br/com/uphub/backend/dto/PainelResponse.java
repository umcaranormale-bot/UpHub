package br.com.uphub.backend.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

// O painel do ecossistema, para a gestão do Porto Digital: as três trilhas numa tela só.
public record PainelResponse(
        OffsetDateTime geradoEm,
        Trilha total,
        List<Trilha> trilhas,
        Map<String, Long> candidaturasPorEstado,
        Map<String, Long> funilInvestimento,
        Map<String, Long> organizacoesPorTipo,
        Residencias residencias,
        Avaliacao avaliacao,
        Mentoria mentoria,
        List<ResumoGargalo> gargalos
) {
    // taxaDeConexao: das candidaturas enviadas, quantas chegaram à aprovação (em %)
    public record Trilha(String trilhaCodigo, long oportunidadesAtivas, long oportunidadesPausadas,
                         long candidaturasEnviadas, long aprovadas, BigDecimal taxaDeConexao,
                         long emAcompanhamento, long concluidas) {
    }

    public record Residencias(long abertas, long encerradas, long squadsNasAbertas, long desafiosNasAbertas) {
    }

    public record Avaliacao(long aguardandoAssinatura, long assinadas, long pedidosDeAjusteAbertos) {
    }

    // o resumo de cada etapa; os itens parados vêm de GET /api/gargalos
    public record ResumoGargalo(String etapa, int limiteDiasUteis, int acimaDoLimite, Integer maisAntigoDiasUteis) {
    }

    public record Mentoria(long alocacoesAceitas, BigDecimal horasPrevistasMes, BigDecimal horasRealizadasMes,
                           long sessoesAssinadasMes) {
    }
}
