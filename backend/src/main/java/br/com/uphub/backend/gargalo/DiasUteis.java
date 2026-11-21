package br.com.uphub.backend.gargalo;

import java.time.DayOfWeek;
import java.time.LocalDate;

// Conta os dias úteis (segunda a sexta) que passaram desde uma data, sem contar o próprio dia.
// Não considera feriados. Não acessa banco: por isso é testável sozinha.
public final class DiasUteis {

    private DiasUteis() {
    }

    // dias úteis em (desde, ate]: parado desde sexta e hoje é segunda conta 1
    public static int entre(LocalDate desde, LocalDate ate) {
        if (desde == null || ate == null || !ate.isAfter(desde)) {
            return 0;
        }
        int dias = 0;
        for (LocalDate d = desde.plusDays(1); !d.isAfter(ate); d = d.plusDays(1)) {
            if (d.getDayOfWeek() != DayOfWeek.SATURDAY && d.getDayOfWeek() != DayOfWeek.SUNDAY) {
                dias++;
            }
        }
        return dias;
    }

    // parado além do limite: só conta quem passou do número de dias úteis da etapa
    public static boolean passouDoLimite(int diasUteis, int limite) {
        return diasUteis > limite;
    }
}
