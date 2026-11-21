package br.com.uphub.backend.service;

import br.com.uphub.backend.dto.AutodeclaracaoRequest;
import br.com.uphub.backend.dto.AutodeclaracaoResponse;
import br.com.uphub.backend.dto.ConferenciaAutodeclaracaoRequest;
import br.com.uphub.backend.model.AutodeclaracaoReserva;
import br.com.uphub.backend.model.AutodeclaracaoReservaId;
import br.com.uphub.backend.model.Candidatura;
import br.com.uphub.backend.model.ReservaVagas;
import br.com.uphub.backend.model.VersaoOportunidade;
import br.com.uphub.backend.repository.AutodeclaracaoReservaRepository;
import br.com.uphub.backend.repository.ReservaVagasRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;

@Service
public class AutodeclaracaoService {

    private final AutodeclaracaoReservaRepository autodeclaracaoRepository;
    private final ReservaVagasRepository reservaRepository;
    private final CandidaturaService candidaturaService;
    private final AuditoriaService auditoria;

    public AutodeclaracaoService(AutodeclaracaoReservaRepository autodeclaracaoRepository,
                                 ReservaVagasRepository reservaRepository,
                                 CandidaturaService candidaturaService,
                                 AuditoriaService auditoria) {
        this.autodeclaracaoRepository = autodeclaracaoRepository;
        this.reservaRepository = reservaRepository;
        this.candidaturaService = candidaturaService;
        this.auditoria = auditoria;
    }

    // a candidata se declara num critério de reserva da versão publicada
    @Transactional
    public AutodeclaracaoResponse declarar(Long candidaturaId, AutodeclaracaoRequest dados, Long pessoaId) {
        if (dados == null || dados.criterio() == null || dados.criterio().isBlank()) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo criterio é obrigatório");
        }
        Candidatura candidatura = candidaturaService.rascunhoDoCandidato(candidaturaId, pessoaId);
        VersaoOportunidade versao = candidaturaService.versaoPublicada(candidatura);
        String criterio = reservaRepository.findByVersao_IdOrderById(versao.getId()).stream()
                .map(ReservaVagas::getCriterio)
                .filter(c -> c.equalsIgnoreCase(dados.criterio().trim()))
                .findFirst()
                .orElseThrow(() -> erro(HttpStatus.BAD_REQUEST, "Esta oportunidade não reserva vagas para este critério"));
        if (autodeclaracaoRepository.existsById(new AutodeclaracaoReservaId(candidaturaId, criterio))) {
            throw erro(HttpStatus.CONFLICT, "A candidatura já se declarou neste critério");
        }
        AutodeclaracaoReserva autodeclaracao = autodeclaracaoRepository.save(
                new AutodeclaracaoReserva(candidaturaId, criterio, OffsetDateTime.now()));
        return AutodeclaracaoResponse.de(autodeclaracao, candidatura.getEstado());
    }

    @Transactional
    public void retirar(Long candidaturaId, String criterio, Long pessoaId) {
        candidaturaService.rascunhoDoCandidato(candidaturaId, pessoaId);
        autodeclaracaoRepository.delete(buscar(candidaturaId, criterio));
    }

    @Transactional(readOnly = true)
    public List<AutodeclaracaoResponse> listar(Long candidaturaId, Long pessoaId) {
        Candidatura candidatura = candidaturaService.paraLeitura(candidaturaId, pessoaId);
        // a autodeclaração não aparece para o avaliador, para não pesar na nota
        if (candidaturaService.soComoAvaliador(candidatura, pessoaId)) {
            throw erro(HttpStatus.FORBIDDEN, "A autodeclaração não aparece para o avaliador");
        }
        return autodeclaracaoRepository.findById_CandidaturaIdOrderByDeclaradaEm(candidaturaId).stream()
                .map(a -> AutodeclaracaoResponse.de(a, candidatura.getEstado()))
                .toList();
    }

    // o provedor confere depois da homologação; recusar desclassifica a candidatura
    @Transactional
    public AutodeclaracaoResponse conferir(Long candidaturaId, String criterio, ConferenciaAutodeclaracaoRequest dados,
                                           Long pessoaId) {
        if (dados == null || dados.confirmada() == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo confirmada é obrigatório");
        }
        String motivo = dados.motivo() == null ? null : dados.motivo().trim();
        if (!dados.confirmada() && (motivo == null || motivo.isEmpty())) {
            throw erro(HttpStatus.BAD_REQUEST, "Para recusar, informe o motivo");
        }
        Candidatura candidatura = candidaturaService.comoProvedor(candidaturaId, pessoaId);
        AutodeclaracaoReserva autodeclaracao = buscar(candidaturaId, criterio);
        if (!"HOMOLOGADA".equals(candidatura.getEstado())) {
            throw erro(HttpStatus.CONFLICT, "A autodeclaração é conferida depois que a candidatura é homologada");
        }
        if (!"DECLARADA".equals(autodeclaracao.getSituacao())) {
            throw erro(HttpStatus.CONFLICT, "Esta autodeclaração já foi conferida");
        }
        OffsetDateTime agora = OffsetDateTime.now();
        if (dados.confirmada()) {
            autodeclaracao.confirmar(pessoaId, agora);
        } else {
            autodeclaracao.recusar(pessoaId, agora, motivo);
            String estadoAntes = candidatura.getEstado();
            candidatura = candidaturaService.moverComoProvedor(candidatura, "DESCLASSIFICADA");
            auditoria.registrarTransicaoCandidatura(candidatura, pessoaId, null, "PROVEDOR",
                    estadoAntes, "DESCLASSIFICADA", motivo);
        }
        autodeclaracaoRepository.saveAndFlush(autodeclaracao);
        return AutodeclaracaoResponse.de(autodeclaracao, candidatura.getEstado());
    }

    private AutodeclaracaoReserva buscar(Long candidaturaId, String criterio) {
        return autodeclaracaoRepository.findById_CandidaturaIdOrderByDeclaradaEm(candidaturaId).stream()
                .filter(a -> a.getId().getCriterio().equalsIgnoreCase(criterio == null ? "" : criterio.trim()))
                .findFirst()
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Autodeclaração não encontrada"));
    }

    private ResponseStatusException erro(HttpStatus status, String mensagem) {
        return new ResponseStatusException(status, mensagem);
    }
}