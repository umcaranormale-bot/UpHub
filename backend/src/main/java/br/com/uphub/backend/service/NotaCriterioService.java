package br.com.uphub.backend.service;

import br.com.uphub.backend.dto.NotaCriterioRequest;
import br.com.uphub.backend.dto.NotaCriterioResponse;
import br.com.uphub.backend.model.Avaliacao;
import br.com.uphub.backend.model.Candidatura;
import br.com.uphub.backend.model.Criterio;
import br.com.uphub.backend.model.NotaCriterio;
import br.com.uphub.backend.model.NotaCriterioId;
import br.com.uphub.backend.repository.CandidaturaRepository;
import br.com.uphub.backend.repository.CriterioRepository;
import br.com.uphub.backend.repository.NotaCriterioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class NotaCriterioService {

    private final NotaCriterioRepository notaRepository;
    private final CriterioRepository criterioRepository;
    private final CandidaturaRepository candidaturaRepository;
    private final AvaliacaoService avaliacaoService;

    public NotaCriterioService(NotaCriterioRepository notaRepository,
                               CriterioRepository criterioRepository,
                               CandidaturaRepository candidaturaRepository,
                               AvaliacaoService avaliacaoService) {
        this.notaRepository = notaRepository;
        this.criterioRepository = criterioRepository;
        this.candidaturaRepository = candidaturaRepository;
        this.avaliacaoService = avaliacaoService;
    }

    // o avaliador dá (ou troca) a nota de um critério, antes de assinar
    @Transactional
    public NotaCriterioResponse registrar(Long avaliacaoId, Long criterioId, NotaCriterioRequest dados, Long pessoaId) {
        if (dados == null || dados.nota() == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo nota é obrigatório");
        }
        Avaliacao avaliacao = avaliacaoService.paraEscrever(avaliacaoId, pessoaId);
        Long versaoId = versaoDa(avaliacao);
        Criterio criterio = criterioRepository.findByIdAndVersao_Id(criterioId, versaoId)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Este critério não é da versão em que a candidatura foi enviada"));
        BigDecimal min = AvaliacaoService.escalaMin(criterio);
        BigDecimal max = AvaliacaoService.escalaMax(criterio);
        if (dados.nota().compareTo(min) < 0 || dados.nota().compareTo(max) > 0) {
            throw erro(HttpStatus.BAD_REQUEST, "A nota deste critério vai de " + min.stripTrailingZeros().toPlainString()
                    + " a " + max.stripTrailingZeros().toPlainString());
        }
        OffsetDateTime agora = OffsetDateTime.now();
        NotaCriterio nota = notaRepository.findById(new NotaCriterioId(avaliacaoId, criterioId))
                .map(n -> { n.trocar(dados.nota(), agora); return n; })
                .orElseGet(() -> new NotaCriterio(avaliacaoId, criterioId, dados.nota(), agora));
        return resposta(avaliacaoId, criterio, notaRepository.saveAndFlush(nota));
    }

    // todos os critérios da versão, com a nota dada (ou vazia)
    @Transactional(readOnly = true)
    public List<NotaCriterioResponse> listar(Long avaliacaoId, Long pessoaId) {
        Avaliacao avaliacao = avaliacaoService.paraLer(avaliacaoId, pessoaId);
        Map<Long, NotaCriterio> notas = notaRepository.findById_AvaliacaoId(avaliacaoId).stream()
                .collect(Collectors.toMap(n -> n.getId().getCriterioId(), Function.identity()));
        return criterioRepository.listarPorVersao(versaoDa(avaliacao)).stream()
                .map(c -> resposta(avaliacaoId, c, notas.get(c.getId())))
                .toList();
    }

    private Long versaoDa(Avaliacao avaliacao) {
        Candidatura candidatura = candidaturaRepository.findById(avaliacao.getCandidaturaId()).orElseThrow();
        return candidatura.getVersaoId();
    }

    private NotaCriterioResponse resposta(Long avaliacaoId, Criterio c, NotaCriterio n) {
        return new NotaCriterioResponse(avaliacaoId, c.getId(), c.getOrdem(), c.getDescricao(), AvaliacaoService.peso(c),
                AvaliacaoService.escalaMin(c), AvaliacaoService.escalaMax(c), c.getEvidenciaEsperada(),
                n == null ? null : n.getNota(), n == null ? null : n.getRegistradaEm());
    }

    private ResponseStatusException erro(HttpStatus status, String mensagem) {
        return new ResponseStatusException(status, mensagem);
    }
}
