package br.com.uphub.backend.candidatura;

import java.util.Map;
import java.util.Set;

// Quem se candidata em cada trilha (desafio): Fomento, empresas e startups; Investimento, startups; Formação, squads.
// Usado pela candidatura e pelo matching.
public final class TiposPorTrilha {

    private static final Map<String, Set<String>> TIPOS = Map.of(
            "FOMENTO", Set.of("EMPRESA", "STARTUP"),
            "INVESTIMENTO", Set.of("STARTUP"),
            "FORMACAO", Set.of("SQUAD"));

    private TiposPorTrilha() {
    }

    public static boolean aceita(String trilhaCodigo, String tipo) {
        Set<String> aceitos = TIPOS.get(trilhaCodigo);
        return aceitos == null || aceitos.contains(tipo);
    }

    public static Set<String> tipos(String trilhaCodigo) {
        return TIPOS.getOrDefault(trilhaCodigo, Set.of());
    }

    public static String quem(String trilhaCodigo) {
        return switch (trilhaCodigo) {
            case "FOMENTO" -> "empresas e startups";
            case "INVESTIMENTO" -> "startups";
            case "FORMACAO" -> "squads";
            default -> "organizações candidatas";
        };
    }
}
