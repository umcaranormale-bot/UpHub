package br.com.uphub.backend.candidatura;

import br.com.uphub.backend.candidatura.MaquinaDeEstados.Ator;
import br.com.uphub.backend.candidatura.MaquinaDeEstados.Resultado;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MaquinaDeEstadosTest {

    @Test
    void caminhoCompletoDoDesafio() {
        // rascunho → submetida/elegível → em análise → aprovada → homologada → em acompanhamento → concluída
        List<String[]> caminho = List.of(
                new String[]{"RASCUNHO", "ELEGIVEL", "CANDIDATO"},
                new String[]{"ELEGIVEL", "EM_ANALISE", "PROVEDOR"},
                new String[]{"EM_ANALISE", "APROVADA", "AVALIADOR"},
                new String[]{"APROVADA", "HOMOLOGADA", "PROVEDOR"},
                new String[]{"HOMOLOGADA", "EM_ACOMPANHAMENTO", "PROVEDOR"},
                new String[]{"EM_ACOMPANHAMENTO", "CONCLUIDA", "PROVEDOR"});
        for (String[] passo : caminho) {
            assertEquals(Resultado.PERMITIDA, MaquinaDeEstados.verificar(passo[0], passo[1], Ator.valueOf(passo[2])),
                    passo[0] + " → " + passo[1]);
        }
    }

    @Test
    void transicaoQueNaoExisteEhRecusada() {
        assertEquals(Resultado.TRANSICAO_INVALIDA, MaquinaDeEstados.verificar("RASCUNHO", "APROVADA", Ator.AVALIADOR));
        assertEquals(Resultado.TRANSICAO_INVALIDA, MaquinaDeEstados.verificar("ELEGIVEL", "HOMOLOGADA", Ator.PROVEDOR));
        assertEquals(Resultado.TRANSICAO_INVALIDA, MaquinaDeEstados.verificar("APROVADA", "RASCUNHO", Ator.CANDIDATO));
    }

    @Test
    void papelErradoNaoFazATransicao() {
        // quem submete é o candidato; quem aprova é o avaliador
        assertEquals(Resultado.ATOR_SEM_PERMISSAO, MaquinaDeEstados.verificar("RASCUNHO", "ELEGIVEL", Ator.PROVEDOR));
        assertEquals(Resultado.ATOR_SEM_PERMISSAO, MaquinaDeEstados.verificar("EM_ANALISE", "APROVADA", Ator.PROVEDOR));
        assertEquals(Resultado.ATOR_SEM_PERMISSAO, MaquinaDeEstados.verificar("EM_ANALISE", "APROVADA", Ator.CANDIDATO));
        assertEquals(Resultado.ATOR_SEM_PERMISSAO, MaquinaDeEstados.verificar("HOMOLOGADA", "DESISTENTE", Ator.PROVEDOR));
    }

    @Test
    void estadosFinaisNaoTemSaida() {
        for (String fim : MaquinaDeEstados.FINAIS) {
            assertTrue(MaquinaDeEstados.proximos(fim).isEmpty(), fim + " não deveria ter saída");
        }
    }

    @Test
    void pendenteVaiParaOProvedorDecidir() {
        assertEquals(Resultado.PERMITIDA, MaquinaDeEstados.verificar("RASCUNHO", "ENVIADA", Ator.CANDIDATO));
        assertEquals(Set.of("ELEGIVEL", "NAO_ELEGIVEL"), MaquinaDeEstados.proximos("ENVIADA"));
        assertEquals(Resultado.PERMITIDA, MaquinaDeEstados.verificar("ENVIADA", "NAO_ELEGIVEL", Ator.PROVEDOR));
    }

    @Test
    void ajusteVaiEVoltaEPodeSerReaberto() {
        assertEquals(Resultado.PERMITIDA, MaquinaDeEstados.verificar("EM_ANALISE", "AJUSTE", Ator.AVALIADOR));
        assertEquals(Resultado.PERMITIDA, MaquinaDeEstados.verificar("AJUSTE", "EM_ANALISE", Ator.CANDIDATO));
        assertEquals(Resultado.PERMITIDA, MaquinaDeEstados.verificar("AJUSTE", "PERDA_DE_PRAZO", Ator.SISTEMA));
        assertEquals(Resultado.PERMITIDA, MaquinaDeEstados.verificar("PERDA_DE_PRAZO", "AJUSTE", Ator.PROVEDOR));
    }

    @Test
    void todoEstadoDasTransicoesExiste() {
        for (MaquinaDeEstados.Transicao t : MaquinaDeEstados.todas()) {
            assertTrue(MaquinaDeEstados.ESTADOS.contains(t.de()), t.de());
            assertTrue(MaquinaDeEstados.ESTADOS.contains(t.para()), t.para());
        }
    }
}
