package br.com.uphub.backend.candidatura;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

// Máquina de estados da candidatura: quais transições existem e quem pode fazer cada uma.
// Não acessa banco: recebe o estado atual, o estado desejado e quem está agindo. Por isso é testável sozinha.
public final class MaquinaDeEstados {

    public enum Ator { CANDIDATO, PROVEDOR, AVALIADOR, SISTEMA }

    public enum Resultado { PERMITIDA, ATOR_SEM_PERMISSAO, TRANSICAO_INVALIDA }

    public record Transicao(String de, String para, Set<Ator> atores) {
    }

    public static final List<String> ESTADOS = List.of(
            "RASCUNHO", "ENVIADA", "ELEGIVEL", "NAO_ELEGIVEL", "EM_ANALISE", "AJUSTE", "PERDA_DE_PRAZO",
            "APROVADA", "REPROVADA", "HOMOLOGADA", "LISTA_DE_ESPERA", "EM_ACOMPANHAMENTO",
            "DESISTENTE", "NAO_CONVOCADA", "DESCLASSIFICADA", "DESCARTADA", "CONCLUIDA");

    // estados de onde não se sai
    public static final Set<String> FINAIS = Set.of(
            "NAO_ELEGIVEL", "REPROVADA", "DESISTENTE", "NAO_CONVOCADA", "DESCLASSIFICADA", "DESCARTADA", "CONCLUIDA");

    private static final Map<String, Map<String, Set<Ator>>> TRANSICOES = new LinkedHashMap<>();

    static {
        // envio: o motor de elegibilidade decide para onde vai (pendente fica ENVIADA)
        de("RASCUNHO", "ENVIADA", Ator.CANDIDATO);
        de("RASCUNHO", "ELEGIVEL", Ator.CANDIDATO);
        de("RASCUNHO", "NAO_ELEGIVEL", Ator.CANDIDATO);
        de("RASCUNHO", "DESCARTADA", Ator.SISTEMA);
        // pendente: o provedor confere e decide
        de("ENVIADA", "ELEGIVEL", Ator.PROVEDOR);
        de("ENVIADA", "NAO_ELEGIVEL", Ator.PROVEDOR);
        // avaliação
        de("ELEGIVEL", "EM_ANALISE", Ator.PROVEDOR, Ator.AVALIADOR);
        de("EM_ANALISE", "APROVADA", Ator.AVALIADOR);
        de("EM_ANALISE", "REPROVADA", Ator.AVALIADOR);
        de("EM_ANALISE", "AJUSTE", Ator.AVALIADOR);
        // ajuste
        de("AJUSTE", "EM_ANALISE", Ator.CANDIDATO);
        de("AJUSTE", "PERDA_DE_PRAZO", Ator.SISTEMA);
        de("PERDA_DE_PRAZO", "AJUSTE", Ator.PROVEDOR);
        // resultado
        de("APROVADA", "HOMOLOGADA", Ator.PROVEDOR);
        de("APROVADA", "LISTA_DE_ESPERA", Ator.PROVEDOR);
        de("LISTA_DE_ESPERA", "HOMOLOGADA", Ator.PROVEDOR);
        de("LISTA_DE_ESPERA", "NAO_CONVOCADA", Ator.PROVEDOR, Ator.SISTEMA);
        de("HOMOLOGADA", "DESCLASSIFICADA", Ator.PROVEDOR);
        // acompanhamento
        de("HOMOLOGADA", "EM_ACOMPANHAMENTO", Ator.PROVEDOR);
        de("HOMOLOGADA", "DESISTENTE", Ator.CANDIDATO);
        de("EM_ACOMPANHAMENTO", "DESISTENTE", Ator.CANDIDATO);
        de("EM_ACOMPANHAMENTO", "CONCLUIDA", Ator.PROVEDOR);
    }

    private MaquinaDeEstados() {
    }

    private static void de(String de, String para, Ator... atores) {
        TRANSICOES.computeIfAbsent(de, k -> new LinkedHashMap<>()).put(para, Set.of(atores));
    }

    public static Resultado verificar(String de, String para, Ator ator) {
        Set<Ator> atores = TRANSICOES.getOrDefault(de, Map.of()).get(para);
        if (atores == null) {
            return Resultado.TRANSICAO_INVALIDA;
        }
        return atores.contains(ator) ? Resultado.PERMITIDA : Resultado.ATOR_SEM_PERMISSAO;
    }

    // para onde a candidatura pode ir a partir de um estado (a tela usa para mostrar os botões)
    public static Set<String> proximos(String de) {
        return TRANSICOES.getOrDefault(de, Map.of()).keySet();
    }

    public static List<Transicao> todas() {
        return TRANSICOES.entrySet().stream()
                .flatMap(e -> e.getValue().entrySet().stream()
                        .map(t -> new Transicao(e.getKey(), t.getKey(), t.getValue())))
                .toList();
    }
}
