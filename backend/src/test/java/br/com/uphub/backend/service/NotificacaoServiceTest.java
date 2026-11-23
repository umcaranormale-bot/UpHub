package br.com.uphub.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.uphub.backend.candidatura.MaquinaDeEstados.Ator;
import br.com.uphub.backend.model.Candidatura;
import br.com.uphub.backend.model.Notificacao;
import br.com.uphub.backend.model.Oportunidade;
import br.com.uphub.backend.repository.NotificacaoRepository;
import br.com.uphub.backend.repository.OportunidadeRepository;
import br.com.uphub.backend.repository.VinculoRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

class NotificacaoServiceTest {

    private final NotificacaoRepository repository = mock(NotificacaoRepository.class);
    private final NotificacaoService service = new NotificacaoService(repository,
            mock(OportunidadeRepository.class), mock(VinculoRepository.class));

    private Candidatura candidatura(String estado) {
        Candidatura c = mock(Candidatura.class);
        when(c.getEstado()).thenReturn(estado);
        when(c.getCriadaPor()).thenReturn(3L);
        when(c.getTituloProposta()).thenReturn("Proposta");
        return c;
    }

    private Oportunidade oportunidade() {
        Oportunidade o = mock(Oportunidade.class);
        when(o.getId()).thenReturn(1L);
        when(o.getTitulo()).thenReturn("Inova PE 2026");
        return o;
    }

    @Test
    void mudancaFeitaPeloProvedorAvisaOCandidato() {
        service.avisarMudancaDeEstado(candidatura("HOMOLOGADA"), oportunidade(), Ator.PROVEDOR);
        verify(repository).save(any(Notificacao.class));
    }

    @Test
    void naoAvisaOQueOProprioCandidatoFezNemOAjuste() {
        service.avisarMudancaDeEstado(candidatura("DESISTENTE"), oportunidade(), Ator.CANDIDATO);
        service.avisarMudancaDeEstado(candidatura("AJUSTE"), oportunidade(), Ator.AVALIADOR);
        verify(repository, never()).save(any());
    }

    @Test
    void tipoInvalidoDaErro() {
        assertThrows(IllegalArgumentException.class, () -> service.criar(1L, null, "t", "m", "URGENTE"));
    }

    @Test
    void marcarLidaDeOutraPessoaDa404() {
        Notificacao n = new Notificacao(9L, null, "t", "m", Notificacao.INFORMATIVA);
        when(repository.findById(5L)).thenReturn(Optional.of(n));
        ResponseStatusException e = assertThrows(ResponseStatusException.class, () -> service.marcarLida(5L, 3L));
        assertEquals(404, e.getStatusCode().value());
    }
}
