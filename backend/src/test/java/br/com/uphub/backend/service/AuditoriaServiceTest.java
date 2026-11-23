package br.com.uphub.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import br.com.uphub.backend.repository.EventoAuditoriaRepository;
import org.junit.jupiter.api.Test;

class AuditoriaServiceTest {

    private final EventoAuditoriaRepository repository = mock(EventoAuditoriaRepository.class);
    private final AuditoriaService service = new AuditoriaService(repository);

    @Test
    void nomesDasTransicoesSeguemOContrato() {
        assertEquals("CANDIDATURA_ENVIADA", AuditoriaService.acaoDaTransicao("RASCUNHO", "ENVIADA"));
        assertEquals("CANDIDATURA_ENVIADA", AuditoriaService.acaoDaTransicao("RASCUNHO", "NAO_ELEGIVEL"));
        assertEquals("AJUSTE_PEDIDO", AuditoriaService.acaoDaTransicao("EM_ANALISE", "AJUSTE"));
        assertEquals("PRAZO_REABERTO", AuditoriaService.acaoDaTransicao("PERDA_DE_PRAZO", "AJUSTE"));
        assertEquals("RESULTADO_HOMOLOGADO", AuditoriaService.acaoDaTransicao("APROVADA", "HOMOLOGADA"));
        assertEquals("ESTADO_ALTERADO", AuditoriaService.acaoDaTransicao("EM_ANALISE", "APROVADA"));
        assertTrue(AuditoriaService.ACOES.contains(AuditoriaService.acaoDaTransicao("AJUSTE", "PERDA_DE_PRAZO")));
    }

    @Test
    void sistemaGravaSemPapel() {
        service.registrar(null, AuditoriaService.AGENDADOR, null, "CONVITE_EXPIRADO", "ALOCACAO_MENTOR", 1L,
                null, null, null, "PENDENTE", "EXPIRADA", null);
        verify(repository).save(any());
    }

    @Test
    void recusaAcaoForaDoContratoPapelErradoESemAutor() {
        assertThrows(IllegalArgumentException.class, () -> service.registrar(1L, null, "PROVEDOR",
                "CANDIDATURA_APROVADA", "CANDIDATURA", 1L, null, null, null, null, null, null));
        assertThrows(IllegalArgumentException.class, () -> service.registrar(null, AuditoriaService.AGENDADOR, "SISTEMA",
                "CONVITE_EXPIRADO", "ALOCACAO_MENTOR", 1L, null, null, null, null, null, null));
        assertThrows(IllegalArgumentException.class, () -> service.registrar(null, null, null,
                "ESTADO_ALTERADO", "CANDIDATURA", 1L, null, null, null, null, null, null));
        verify(repository, never()).save(any());
    }
}
