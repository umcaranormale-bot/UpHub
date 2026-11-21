package br.com.uphub.backend.matching;

import br.com.uphub.backend.matching.MotorMatching.Alvo;
import br.com.uphub.backend.matching.MotorMatching.Criterio;
import br.com.uphub.backend.matching.MotorMatching.Perfil;
import br.com.uphub.backend.matching.MotorMatching.Resultado;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MotorMatchingTest {

    private static final Perfil FINTECH = new Perfil("STARTUP", "Fintech", "Seed",
            "Crédito para pequenos negócios, com pagamentos por Pix", List.of());

    private static Alvo investimento(String area, String tese) {
        return new Alvo("INVESTIMENTO", area, tese, null, "ELEGIVEL", List.of(), 0, 0);
    }

    private static int pontos(Resultado r, Criterio c) {
        return r.criterios().stream().filter(p -> p.criterio() == c).findFirst().orElseThrow().pontos();
    }

    @Test
    void osPesosDeCadaTrilhaSomam100() {
        for (Map<Criterio, Integer> pesos : MotorMatching.PESOS.values()) {
            assertEquals(100, pesos.values().stream().mapToInt(Integer::intValue).sum());
        }
    }

    @Test
    void startupQueCombinaComAreaETeseTiraNotaCheia() {
        Resultado r = MotorMatching.avaliar(FINTECH, investimento("Fintech", "Startups seed de crédito e pagamentos"));
        assertFalse(r.inelegivel());
        assertEquals(100, r.compatibilidade());
        // sem requisitos desejáveis, o perfil sai da conta e os pesos se redistribuem
        assertTrue(r.criterios().stream().noneMatch(p -> p.criterio() == Criterio.PERFIL));
        assertTrue(r.criterios().stream().filter(p -> p.criterio() == Criterio.TESE).findFirst().orElseThrow()
                .explicacao().contains("credito"));
    }

    @Test
    void teseQueNaoCombinaDerrubaANota() {
        Resultado combina = MotorMatching.avaliar(FINTECH, investimento("Fintech", "Crédito e pagamentos"));
        Resultado naoCombina = MotorMatching.avaliar(FINTECH, investimento("Fintech", "Agronegócio e irrigação"));
        assertEquals(0, pontos(naoCombina, Criterio.TESE));
        assertTrue(combina.compatibilidade() > naoCombina.compatibilidade());
    }

    @Test
    void inelegivelSaiDaRecomendacaoComOMotivo() {
        Alvo alvo = new Alvo("FOMENTO", "Fintech", null, null, "INELEGIVEL", List.of("porte: não atende (Grande)"), 0, 0);
        Resultado r = MotorMatching.avaliar(FINTECH, alvo);
        assertTrue(r.inelegivel());
        assertEquals(0, r.compatibilidade());
        assertTrue(r.criterios().get(0).explicacao().contains("porte"));
    }

    @Test
    void pendenteValeMetadeDaElegibilidade() {
        Alvo elegivel = new Alvo("FOMENTO", null, null, null, "ELEGIVEL", List.of(), 0, 0);
        Alvo pendente = new Alvo("FOMENTO", null, null, null, "PENDENTE", List.of("UF da sede"), 0, 0);
        assertEquals(100, MotorMatching.avaliar(FINTECH, elegivel).compatibilidade());
        assertEquals(50, MotorMatching.avaliar(FINTECH, pendente).compatibilidade());
    }

    @Test
    void perfilContaOsRequisitosDesejaveisAtendidos() {
        Alvo alvo = new Alvo("FOMENTO", "Saúde", null, null, "ELEGIVEL", List.of(), 4, 2);
        Resultado r = MotorMatching.avaliar(FINTECH, alvo);
        // elegibilidade 40 (cheia) + área 35 (zero, não é saúde) + perfil 25 (metade) = 52.5 → 53
        assertEquals(53, r.compatibilidade());
        assertEquals(13, pontos(r, Criterio.PERFIL));
        assertEquals(0, pontos(r, Criterio.AREA));
    }

    @Test
    void formacaoOlhaAsCompetenciasDaSquad() {
        Perfil squad = new Perfil("SQUAD", null, null, null, List.of("Back-end Java", "Banco de dados PostgreSQL"));
        Perfil semCompetencia = new Perfil("SQUAD", null, null, null, List.of());
        Alvo desafio = new Alvo("FORMACAO", null, null, "API em Java com banco PostgreSQL e testes", "ELEGIVEL", List.of(), 0, 0);
        Resultado r = MotorMatching.avaliar(squad, desafio);
        assertEquals(100, r.compatibilidade());
        assertTrue(MotorMatching.avaliar(semCompetencia, desafio).compatibilidade() < r.compatibilidade());
    }

    @Test
    void palavrasIgnoramAcentoMaiusculasEPalavrasVazias() {
        assertEquals(java.util.Set.of("credito", "inovacao"), MotorMatching.palavras("Crédito e INOVAÇÃO de"));
    }
}
