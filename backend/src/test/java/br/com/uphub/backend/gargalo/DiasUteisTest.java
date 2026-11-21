package br.com.uphub.backend.gargalo;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DiasUteisTest {

    // 16/11/2026 é uma segunda-feira
    private static final LocalDate SEGUNDA = LocalDate.of(2026, 11, 16);

    @Test
    void noMesmoDiaNaoContaNada() {
        assertEquals(0, DiasUteis.entre(SEGUNDA, SEGUNDA));
    }

    @Test
    void deSegundaASextaSaoQuatroDiasUteis() {
        assertEquals(4, DiasUteis.entre(SEGUNDA, SEGUNDA.plusDays(4)));
    }

    @Test
    void sabadoEDomingoNaoContam() {
        LocalDate sexta = SEGUNDA.plusDays(4);
        assertEquals(1, DiasUteis.entre(sexta, sexta.plusDays(3)));   // sexta → segunda
        assertEquals(0, DiasUteis.entre(sexta, sexta.plusDays(2)));   // sexta → domingo
    }

    @Test
    void duasSemanasInteirasSaoDezDiasUteis() {
        assertEquals(10, DiasUteis.entre(SEGUNDA, SEGUNDA.plusDays(14)));
    }

    @Test
    void dataNoFuturoOuVaziaNaoConta() {
        assertEquals(0, DiasUteis.entre(SEGUNDA.plusDays(3), SEGUNDA));
        assertEquals(0, DiasUteis.entre(null, SEGUNDA));
    }

    @Test
    void soPassaDoLimiteQuemTemMaisDiasQueOLimite() {
        assertFalse(DiasUteis.passouDoLimite(5, 5));
        assertTrue(DiasUteis.passouDoLimite(6, 5));
    }
}
