package br.com.uphub.backend.seguranca;

import org.junit.jupiter.api.Test;

import java.util.EnumMap;
import java.util.Map;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;

// RBAC: a tabela de quem pode o quê. Se alguém mudar uma permissão, este teste avisa.
class PermissaoTest {

    private static final Map<Permissao, Set<String>> ESPERADO = new EnumMap<>(Map.of(
            Permissao.CRIAR_OPORTUNIDADE, Set.of("PROVEDOR"),
            Permissao.EDITAR_OPORTUNIDADE, Set.of("PROVEDOR"),
            Permissao.CONVIDAR_AVALIADOR_OU_MENTOR, Set.of("PROVEDOR"),
            Permissao.PEDIR_PERMISSAO_DE_PROVEDOR, Set.of("PROVEDOR"),
            Permissao.CONDUZIR_SELECAO, Set.of("PROVEDOR"),
            Permissao.ENVIAR_DOCUMENTO, Set.of("PROVEDOR", "CANDIDATO"),
            Permissao.MONTAR_SQUAD, Set.of("CANDIDATO"),
            Permissao.CANDIDATAR, Set.of("CANDIDATO")));

    @Test
    void cadaPermissaoTemExatamenteOsPapeisCombinados() {
        assertEquals(ESPERADO.keySet(), Set.of(Permissao.values()), "toda permissão nova precisa entrar na tabela");
        for (Permissao p : Permissao.values()) {
            assertEquals(ESPERADO.get(p), p.getPapeis(), p.name());
        }
    }

    @Test
    void avaliadorMentorEGestaoNaoTemPermissaoDeOrganizacao() {
        // eles agem pelo vínculo (designação, alocação) ou pela gestão, nunca por estas permissões
        for (Permissao p : Permissao.values()) {
            for (String papel : Set.of("AVALIADOR", "MENTOR", "GESTAO")) {
                assertEquals(false, p.getPapeis().contains(papel), p.name() + " não pode valer para " + papel);
            }
        }
    }

    @Test
    void quemSeCandidataNuncaConduzASelecao() {
        Set<Permissao> doCandidato = Set.of(Permissao.CANDIDATAR, Permissao.MONTAR_SQUAD);
        for (Permissao p : doCandidato) {
            assertEquals(false, p.getPapeis().contains("PROVEDOR"), p.name());
        }
        assertEquals(false, Permissao.CONDUZIR_SELECAO.getPapeis().contains("CANDIDATO"));
    }
}
