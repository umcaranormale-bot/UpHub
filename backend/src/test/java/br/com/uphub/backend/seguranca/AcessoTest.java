package br.com.uphub.backend.seguranca;

import br.com.uphub.backend.repository.VinculoRepository;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

// RBAC e multi-tenant: as conferências que os services usam, com o banco simulado.
class AcessoTest {

    private static final long ANA = 1, BRUNO = 2, CARLA = 3;
    private static final long FOMENTO = 10, STARTUP = 20;

    private final VinculoRepository vinculos = mock(VinculoRepository.class);
    private final Acesso acesso = new Acesso(vinculos);

    // a Ana é PROVEDOR no fomento; o Bruno é CANDIDATO na startup; a Carla é da gestão
    {
        when(vinculos.existsByPessoa_IdAndOrganizacao_IdAndEncerradoEmIsNull(anyLong(), anyLong())).thenReturn(false);
        when(vinculos.existsByPessoa_IdAndOrganizacao_IdAndEncerradoEmIsNull(ANA, FOMENTO)).thenReturn(true);
        when(vinculos.existsByPessoa_IdAndOrganizacao_IdAndEncerradoEmIsNull(BRUNO, STARTUP)).thenReturn(true);
        when(vinculos.existsByPessoa_IdAndPapelAndEncerradoEmIsNull(anyLong(), any())).thenReturn(false);
        when(vinculos.existsByPessoa_IdAndPapelAndEncerradoEmIsNull(CARLA, "GESTAO")).thenReturn(true);
        when(vinculos.existsByPessoa_IdAndOrganizacao_IdAndPapelInAndEncerradoEmIsNull(anyLong(), anyLong(), any())).thenReturn(false);
        when(vinculos.existsByPessoa_IdAndOrganizacao_IdAndPapelInAndEncerradoEmIsNull(eq(ANA), eq(FOMENTO),
                argThat(papeis -> papeis.contains("PROVEDOR")))).thenReturn(true);
        when(vinculos.existsByPessoa_IdAndOrganizacao_IdAndPapelInAndEncerradoEmIsNull(eq(BRUNO), eq(STARTUP),
                argThat(papeis -> papeis.contains("CANDIDATO")))).thenReturn(true);
    }

    @Test
    void cadaUmVeSoAPropriaOrganizacaoEAGestaoVeTodas() {
        assertTrue(acesso.podeVer(ANA, FOMENTO));
        assertFalse(acesso.podeVer(ANA, STARTUP));
        assertFalse(acesso.podeVer(BRUNO, FOMENTO));
        assertTrue(acesso.podeVer(CARLA, FOMENTO));
        assertTrue(acesso.podeVer(CARLA, STARTUP));
    }

    @Test
    void deForaRecebe403ComAMensagem() {
        ResponseStatusException e = assertThrows(ResponseStatusException.class, () -> acesso.exigirAcesso(BRUNO, FOMENTO));
        assertEquals(403, e.getStatusCode().value());
        assertEquals("Você não tem acesso aos dados desta organização", e.getReason());
    }

    @Test
    void oPapelDecideQuemFazOQue() {
        assertDoesNotThrow(() -> acesso.exigir(ANA, FOMENTO, Permissao.CRIAR_OPORTUNIDADE));
        assertDoesNotThrow(() -> acesso.exigir(BRUNO, STARTUP, Permissao.CANDIDATAR));
        ResponseStatusException e = assertThrows(ResponseStatusException.class,
                () -> acesso.exigir(BRUNO, STARTUP, Permissao.CRIAR_OPORTUNIDADE));
        assertEquals(403, e.getStatusCode().value());
        assertEquals("Seu papel nesta organização não permite criar oportunidades", e.getReason());
        // a gestão vê tudo, mas não ganha os papéis das organizações
        assertThrows(ResponseStatusException.class, () -> acesso.exigir(CARLA, FOMENTO, Permissao.CRIAR_OPORTUNIDADE));
        assertFalse(acesso.tem(ANA, STARTUP, Permissao.CANDIDATAR));
    }

    @Test
    void soAGestaoPassaNaConferenciaDaGestao() {
        assertDoesNotThrow(() -> acesso.exigirGestao(CARLA, "ver o painel do ecossistema"));
        ResponseStatusException e = assertThrows(ResponseStatusException.class,
                () -> acesso.exigirGestao(ANA, "ver o painel do ecossistema"));
        assertEquals("Só a gestão do Porto Digital pode ver o painel do ecossistema", e.getReason());
    }
}
