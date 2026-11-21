package br.com.uphub.backend.matching;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

// Motor de matching: mede o quanto uma organização combina com uma oportunidade, de 0 a 100, com o porquê.
// É um só para as três trilhas; o que muda por trilha são os pesos. Não acessa banco.
public final class MotorMatching {

    public enum Criterio {
        ELEGIBILIDADE("Elegibilidade"),
        AREA("Área"),
        PERFIL("Perfil"),
        TESE("Tese"),
        COMPETENCIAS("Competências");

        private final String nome;

        Criterio(String nome) {
            this.nome = nome;
        }

        public String getNome() {
            return nome;
        }
    }

    // pesos por trilha (somam 100). Critério sem dado dos dois lados sai da conta, e os outros se redistribuem.
    public static final Map<String, Map<Criterio, Integer>> PESOS = Map.of(
            "FOMENTO", pesos(Criterio.ELEGIBILIDADE, 40, Criterio.AREA, 35, Criterio.PERFIL, 25),
            "INVESTIMENTO", pesos(Criterio.TESE, 40, Criterio.AREA, 25, Criterio.PERFIL, 20, Criterio.ELEGIBILIDADE, 15),
            "FORMACAO", pesos(Criterio.COMPETENCIAS, 50, Criterio.ELEGIBILIDADE, 30, Criterio.AREA, 20));

    // palavras que não dizem nada sobre o assunto
    private static final Set<String> VAZIAS = Set.of("de", "da", "do", "das", "dos", "e", "em", "no", "na", "nos", "nas",
            "para", "por", "com", "sem", "um", "uma", "uns", "umas", "o", "a", "os", "as", "ou", "que", "se", "ao", "aos",
            "seu", "sua", "seus", "suas", "the", "and", "for", "mais", "muito", "como", "entre", "sobre");

    // até quantas palavras em comum contam para a nota cheia
    private static final int PALAVRAS_PARA_NOTA_CHEIA = 3;

    private MotorMatching() {
    }

    // o que se sabe da organização candidata
    public record Perfil(String tipo, String setor, String estagio, String descricao, List<String> competencias) {
    }

    // o que se sabe da oportunidade; elegibilidade vem do motor de elegibilidade
    public record Alvo(String trilha, String area, String tese, String textoDoDesafio,
                       String elegibilidade, List<String> faltou, int desejaveis, int desejaveisAtendidos) {
    }

    public record Ponto(Criterio criterio, int peso, int pontos, String explicacao) {
    }

    // inelegivel = true: não entra na recomendação
    public record Resultado(int compatibilidade, boolean inelegivel, List<Ponto> criterios) {
    }

    public static Resultado avaliar(Perfil perfil, Alvo alvo) {
        if ("INELEGIVEL".equals(alvo.elegibilidade())) {
            String motivo = alvo.faltou() == null || alvo.faltou().isEmpty() ? "não atende a um requisito obrigatório"
                    : String.join("; ", alvo.faltou());
            return new Resultado(0, true, List.of(new Ponto(Criterio.ELEGIBILIDADE, 0, 0, "Inelegível: " + motivo)));
        }
        Map<Criterio, Integer> pesos = PESOS.getOrDefault(alvo.trilha(), PESOS.get("FOMENTO"));

        // nota de 0 a 1 de cada critério que tem dado
        Map<Criterio, Nota> notas = new LinkedHashMap<>();
        for (Criterio c : pesos.keySet()) {
            Nota nota = switch (c) {
                case ELEGIBILIDADE -> elegibilidade(alvo);
                case AREA -> area(perfil, alvo);
                case PERFIL -> perfil(alvo);
                case TESE -> tese(perfil, alvo);
                case COMPETENCIAS -> competencias(perfil, alvo);
            };
            if (nota != null) {
                notas.put(c, nota);
            }
        }
        int somaPesos = notas.keySet().stream().mapToInt(pesos::get).sum();
        if (somaPesos == 0) {
            return new Resultado(0, false, List.of());
        }

        // os pesos dos critérios que ficaram são levados para somar 100
        List<Ponto> pontos = new ArrayList<>();
        double total = 0;
        for (Map.Entry<Criterio, Nota> e : notas.entrySet()) {
            int peso = (int) Math.round(pesos.get(e.getKey()) * 100.0 / somaPesos);
            int ganhos = (int) Math.round(peso * e.getValue().valor());
            total += pesos.get(e.getKey()) * 100.0 / somaPesos * e.getValue().valor();
            pontos.add(new Ponto(e.getKey(), peso, ganhos, e.getValue().explicacao()));
        }
        return new Resultado((int) Math.round(total), false, pontos);
    }

    // ---------- critérios

    private record Nota(double valor, String explicacao) {
    }

    private static Nota elegibilidade(Alvo alvo) {
        if ("PENDENTE".equals(alvo.elegibilidade())) {
            String falta = alvo.faltou() == null || alvo.faltou().isEmpty() ? "dados" : String.join("; ", alvo.faltou());
            return new Nota(0.5, "Pendente: " + falta + ". O provedor confere");
        }
        return new Nota(1, "Atende a todos os requisitos obrigatórios");
    }

    private static Nota area(Perfil perfil, Alvo alvo) {
        Set<String> daArea = palavras(alvo.area());
        if (daArea.isEmpty()) {
            return null;
        }
        Set<String> daOrganizacao = palavras(perfil.setor() + " " + perfil.descricao());
        if (daOrganizacao.isEmpty()) {
            // sem setor nem descrição (comum na squad), a área não entra na conta
            return null;
        }
        Set<String> comuns = comuns(daArea, daOrganizacao);
        if (comuns.isEmpty()) {
            String setor = perfil.setor() == null ? "a descrição dela" : perfil.setor();
            return new Nota(0, "A oportunidade é de " + alvo.area() + ", e a organização é de " + setor);
        }
        double valor = Math.min(1.0, (double) comuns.size() / Math.min(daArea.size(), PALAVRAS_PARA_NOTA_CHEIA));
        return new Nota(valor, "A área " + alvo.area() + " combina com a organização (" + String.join(", ", comuns) + ")");
    }

    // perfil: os requisitos desejáveis (não obrigatórios) que a organização atende
    private static Nota perfil(Alvo alvo) {
        if (alvo.desejaveis() == 0) {
            return null;
        }
        double valor = (double) alvo.desejaveisAtendidos() / alvo.desejaveis();
        return new Nota(valor, "Atende " + alvo.desejaveisAtendidos() + " de " + alvo.desejaveis() + " requisitos desejáveis");
    }

    private static Nota tese(Perfil perfil, Alvo alvo) {
        Set<String> daTese = palavras(alvo.tese());
        if (daTese.isEmpty()) {
            return null;
        }
        Set<String> daStartup = palavras(perfil.setor() + " " + perfil.estagio() + " " + perfil.descricao());
        Set<String> comuns = comuns(daTese, daStartup);
        if (comuns.isEmpty()) {
            return new Nota(0, "Nada do perfil da startup aparece na tese");
        }
        double valor = Math.min(1.0, (double) comuns.size() / Math.min(daTese.size(), PALAVRAS_PARA_NOTA_CHEIA));
        return new Nota(valor, "A tese fala de " + String.join(", ", comuns) + ", que está no perfil da startup");
    }

    private static Nota competencias(Perfil perfil, Alvo alvo) {
        Set<String> doDesafio = palavras(alvo.textoDoDesafio());
        if (doDesafio.isEmpty()) {
            return null;
        }
        String todas = perfil.competencias() == null ? "" : String.join(" ", perfil.competencias());
        Set<String> daSquad = palavras(todas);
        if (daSquad.isEmpty()) {
            return new Nota(0, "Os integrantes da squad não informaram as competências");
        }
        Set<String> comuns = comuns(doDesafio, daSquad);
        if (comuns.isEmpty()) {
            return new Nota(0, "As competências da squad não aparecem no escopo do desafio");
        }
        double valor = Math.min(1.0, (double) comuns.size() / Math.min(doDesafio.size(), PALAVRAS_PARA_NOTA_CHEIA));
        return new Nota(valor, "O desafio pede " + String.join(", ", comuns) + ", que a squad tem");
    }

    // ---------- texto

    // palavras sem acento, em minúsculas, sem as vazias e com 3 letras ou mais
    static Set<String> palavras(String texto) {
        if (texto == null || texto.isBlank()) {
            return Set.of();
        }
        String limpo = Normalizer.normalize(texto.toLowerCase(), Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        return Arrays.stream(limpo.split("[^a-z0-9]+"))
                .filter(p -> p.length() >= 3 && !VAZIAS.contains(p) && !"null".equals(p))
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    // em comum: igual, ou uma começa com a outra (fintech/fintechs, pagamento/pagamentos)
    private static Set<String> comuns(Set<String> a, Set<String> b) {
        Set<String> comuns = new LinkedHashSet<>();
        for (String x : a) {
            for (String y : b) {
                if (x.equals(y) || (x.length() >= 4 && y.length() >= 4 && (x.startsWith(y) || y.startsWith(x)))) {
                    comuns.add(x);
                    break;
                }
            }
        }
        return comuns;
    }

    private static Map<Criterio, Integer> pesos(Object... pares) {
        Map<Criterio, Integer> m = new LinkedHashMap<>();
        for (int i = 0; i < pares.length; i += 2) {
            m.put((Criterio) pares[i], (Integer) pares[i + 1]);
        }
        return m;
    }
}
