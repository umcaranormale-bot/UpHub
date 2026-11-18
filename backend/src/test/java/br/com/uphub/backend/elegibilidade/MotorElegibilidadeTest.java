package br.com.uphub.backend.elegibilidade;

import br.com.uphub.backend.elegibilidade.MotorElegibilidade.Regra;
import br.com.uphub.backend.elegibilidade.MotorElegibilidade.Resultado;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

import static br.com.uphub.backend.elegibilidade.CampoElegibilidade.PORTE;
import static br.com.uphub.backend.elegibilidade.CampoElegibilidade.SEDE_UF;
import static br.com.uphub.backend.elegibilidade.CampoElegibilidade.SETOR;
import static br.com.uphub.backend.elegibilidade.CampoElegibilidade.TEMPO_DE_MERCADO_ANOS;
import static br.com.uphub.backend.elegibilidade.OperadorElegibilidade.DIFERENTE;
import static br.com.uphub.backend.elegibilidade.OperadorElegibilidade.EM;
import static br.com.uphub.backend.elegibilidade.OperadorElegibilidade.FORA_DE;
import static br.com.uphub.backend.elegibilidade.OperadorElegibilidade.IGUAL;
import static br.com.uphub.backend.elegibilidade.OperadorElegibilidade.MAIOR_OU_IGUAL;
import static br.com.uphub.backend.elegibilidade.OperadorElegibilidade.MENOR_OU_IGUAL;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MotorElegibilidadeTest {

    private static final JsonMapper JSON = JsonMapper.builder().build();

    private static JsonNode json(String texto) {
        return JSON.readTree(texto);
    }

    private static Map<CampoElegibilidade, Object> perfil(String porte, String setor, String uf, Integer anos) {
        Map<CampoElegibilidade, Object> perfil = new EnumMap<>(CampoElegibilidade.class);
        perfil.put(PORTE, porte);
        perfil.put(SETOR, setor);
        perfil.put(SEDE_UF, uf);
        perfil.put(TEMPO_DE_MERCADO_ANOS, anos);
        return perfil;
    }

    private static Regra regra(long id, CampoElegibilidade campo, OperadorElegibilidade operador, String valor, boolean obrigatoria) {
        return new Regra(id, campo, operador, json(valor), obrigatoria);
    }

    @Test
    void semRequisitosEhElegivel() {
        Resultado r = MotorElegibilidade.avaliar(perfil("ME", "TI", "PE", 3), List.of());
        assertEquals(MotorElegibilidade.ELEGIVEL, r.situacao());
        assertTrue(r.faltou().isEmpty());
    }

    @Test
    void atendeTodasAsObrigatorias() {
        Resultado r = MotorElegibilidade.avaliar(perfil("ME", "Tecnologia", "PE", 3), List.of(
                regra(1, PORTE, EM, "[\"ME\", \"EPP\"]", true),
                regra(2, SEDE_UF, IGUAL, "\"pe\"", true),
                regra(3, TEMPO_DE_MERCADO_ANOS, MAIOR_OU_IGUAL, "2", true),
                regra(4, SETOR, DIFERENTE, "\"Varejo\"", true)));
        assertEquals(MotorElegibilidade.ELEGIVEL, r.situacao());
        r.requisitos().forEach(req -> assertEquals(MotorElegibilidade.ATENDIDO, req.situacao()));
    }

    @Test
    void obrigatoriaNaoAtendidaDeixaInelegivelEApontaQualFaltou() {
        Resultado r = MotorElegibilidade.avaliar(perfil("Grande", "TI", "PE", 10), List.of(
                regra(1, PORTE, EM, "[\"ME\", \"EPP\"]", true),
                regra(2, TEMPO_DE_MERCADO_ANOS, MENOR_OU_IGUAL, "5", true)));
        assertEquals(MotorElegibilidade.INELEGIVEL, r.situacao());
        assertEquals(2, r.faltou().size());
        assertTrue(r.faltou().get(0).startsWith("porte"));
        assertTrue(r.faltou().get(1).startsWith("tempo de mercado"));
    }

    @Test
    void dadoFaltandoNumaObrigatoriaDeixaPendente() {
        Resultado r = MotorElegibilidade.avaliar(perfil("ME", null, "PE", null), List.of(
                regra(1, PORTE, IGUAL, "\"ME\"", true),
                regra(2, TEMPO_DE_MERCADO_ANOS, MAIOR_OU_IGUAL, "1", true)));
        assertEquals(MotorElegibilidade.PENDENTE, r.situacao());
        assertEquals(MotorElegibilidade.PENDENTE, r.requisitos().get(1).situacao());
        assertTrue(r.faltou().get(0).contains("não informou"));
    }

    @Test
    void inelegivelVenceDePendente() {
        Resultado r = MotorElegibilidade.avaliar(perfil("Grande", null, "PE", 1), List.of(
                regra(1, SETOR, IGUAL, "\"TI\"", true),
                regra(2, PORTE, IGUAL, "\"ME\"", true)));
        assertEquals(MotorElegibilidade.INELEGIVEL, r.situacao());
    }

    @Test
    void opcionalNaoAtendidaNaoTiraAElegibilidade() {
        Resultado r = MotorElegibilidade.avaliar(perfil("ME", "TI", "SP", 1), List.of(
                regra(1, PORTE, IGUAL, "\"ME\"", true),
                regra(2, SEDE_UF, IGUAL, "\"PE\"", false)));
        assertEquals(MotorElegibilidade.ELEGIVEL, r.situacao());
        assertEquals(MotorElegibilidade.NAO_ATENDIDO, r.requisitos().get(1).situacao());
        assertTrue(r.faltou().isEmpty());
    }

    @Test
    void foraDeEIgualdadeSemMaiusculas() {
        Resultado r = MotorElegibilidade.avaliar(perfil("  epp ", "TI", "PE", 1), List.of(
                regra(1, PORTE, FORA_DE, "[\"Grande\", \"Média\"]", true),
                regra(2, PORTE, IGUAL, "\"EPP\"", true)));
        assertEquals(MotorElegibilidade.ELEGIVEL, r.situacao());
    }

    @Test
    void limitesDosNumerosContam() {
        Resultado r = MotorElegibilidade.avaliar(perfil("ME", "TI", "PE", 2), List.of(
                regra(1, TEMPO_DE_MERCADO_ANOS, MAIOR_OU_IGUAL, "2", true),
                regra(2, TEMPO_DE_MERCADO_ANOS, MENOR_OU_IGUAL, "2", true),
                regra(3, TEMPO_DE_MERCADO_ANOS, EM, "[1, 2, 3]", true)));
        assertEquals(MotorElegibilidade.ELEGIVEL, r.situacao());
    }
}
