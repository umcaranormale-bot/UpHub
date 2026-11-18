package br.com.uphub.backend.elegibilidade;

import tools.jackson.databind.JsonNode;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

// Motor de elegibilidade: confere o perfil de uma organização contra os requisitos de uma versão.
// Não acessa banco nem rede: recebe tudo pronto e devolve o resultado. Por isso é testável sozinho.
public final class MotorElegibilidade {

    public static final String ATENDIDO = "ATENDIDO";
    public static final String NAO_ATENDIDO = "NAO_ATENDIDO";
    public static final String PENDENTE = "PENDENTE";

    public static final String ELEGIVEL = "ELEGIVEL";
    public static final String INELEGIVEL = "INELEGIVEL";

    private MotorElegibilidade() {
    }

    public record Regra(Long requisitoId, CampoElegibilidade campo, OperadorElegibilidade operador,
                        JsonNode valor, boolean obrigatoria) {
    }

    public record ResultadoRequisito(Long requisitoId, String campo, String operador, JsonNode valorExigido,
                                     Object valorInformado, boolean obrigatoria, String situacao, String explicacao) {
    }

    public record Resultado(String situacao, List<ResultadoRequisito> requisitos, List<String> faltou) {
    }

    // perfil: o valor de cada campo na organização (ausente ou null = não informado)
    public static Resultado avaliar(Map<CampoElegibilidade, Object> perfil, List<Regra> regras) {
        List<ResultadoRequisito> resultados = new ArrayList<>();
        List<String> faltou = new ArrayList<>();
        boolean algumaObrigatoriaNaoAtendida = false;
        boolean algumaObrigatoriaPendente = false;

        for (Regra regra : regras) {
            Object informado = perfil.get(regra.campo());
            String situacao;
            String explicacao;
            if (informado == null || (informado instanceof String texto && texto.isBlank())) {
                situacao = PENDENTE;
                explicacao = "A organização não informou " + regra.campo().getDescricao();
            } else if (confere(informado, regra)) {
                situacao = ATENDIDO;
                explicacao = descrever(regra) + ": atende (" + informado + ")";
            } else {
                situacao = NAO_ATENDIDO;
                explicacao = descrever(regra) + ": não atende (" + informado + ")";
            }

            if (regra.obrigatoria() && NAO_ATENDIDO.equals(situacao)) {
                algumaObrigatoriaNaoAtendida = true;
                faltou.add(explicacao);
            } else if (regra.obrigatoria() && PENDENTE.equals(situacao)) {
                algumaObrigatoriaPendente = true;
                faltou.add(explicacao);
            }
            resultados.add(new ResultadoRequisito(regra.requisitoId(), regra.campo().name(), regra.operador().name(),
                    regra.valor(), informado, regra.obrigatoria(), situacao, explicacao));
        }

        // uma obrigatória não atendida já torna inelegível; senão, uma obrigatória sem dado deixa pendente
        String geral = algumaObrigatoriaNaoAtendida ? INELEGIVEL
                : algumaObrigatoriaPendente ? PENDENTE
                : ELEGIVEL;
        return new Resultado(geral, resultados, faltou);
    }

    private static boolean confere(Object informado, Regra regra) {
        JsonNode valor = regra.valor();
        return switch (regra.operador()) {
            case IGUAL -> igual(informado, valor);
            case DIFERENTE -> !igual(informado, valor);
            case EM -> contem(informado, valor);
            case FORA_DE -> !contem(informado, valor);
            case MAIOR_OU_IGUAL -> numero(informado).compareTo(valor.decimalValue()) >= 0;
            case MENOR_OU_IGUAL -> numero(informado).compareTo(valor.decimalValue()) <= 0;
        };
    }

    private static boolean contem(Object informado, JsonNode lista) {
        for (JsonNode item : lista) {
            if (igual(informado, item)) {
                return true;
            }
        }
        return false;
    }

    // texto: sem diferença de maiúsculas e espaços nas pontas; número: pelo valor
    private static boolean igual(Object informado, JsonNode valor) {
        if (valor.isNumber()) {
            return informado instanceof Number && numero(informado).compareTo(valor.decimalValue()) == 0;
        }
        return normalizar(String.valueOf(informado)).equals(normalizar(valor.asString()));
    }

    private static BigDecimal numero(Object valor) {
        return new BigDecimal(String.valueOf(valor));
    }

    private static String normalizar(String texto) {
        return texto.trim().toLowerCase(Locale.ROOT);
    }

    private static String descrever(Regra regra) {
        String exigido = regra.valor().isArray() ? regra.valor().toString() : regra.valor().asString();
        return regra.campo().getDescricao() + " " + regra.operador().getDescricao() + " " + exigido;
    }
}
