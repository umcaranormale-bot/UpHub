package br.com.uphub.backend.service;

import br.com.uphub.backend.dto.AvaliacaoEntregaRequest;
import br.com.uphub.backend.dto.EntregaRequest;
import br.com.uphub.backend.dto.SprintRequest;
import br.com.uphub.backend.dto.SprintResponse;
import br.com.uphub.backend.model.Candidatura;
import br.com.uphub.backend.model.Oportunidade;
import br.com.uphub.backend.model.Sprint;
import br.com.uphub.backend.repository.CandidaturaRepository;
import br.com.uphub.backend.repository.OportunidadeRepository;
import br.com.uphub.backend.repository.SprintRepository;
import br.com.uphub.backend.seguranca.Acesso;
import br.com.uphub.backend.seguranca.Permissao;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Service
public class SprintService {

    private static final BigDecimal NOTA_MAXIMA = BigDecimal.TEN;

    private final SprintRepository sprintRepository;
    private final CandidaturaRepository candidaturaRepository;
    private final OportunidadeRepository oportunidadeRepository;
    private final CandidaturaService candidaturaService;
    private final AlocacaoService alocacaoService;
    private final Acesso acesso;

    public SprintService(SprintRepository sprintRepository,
                         CandidaturaRepository candidaturaRepository,
                         OportunidadeRepository oportunidadeRepository,
                         CandidaturaService candidaturaService,
                         AlocacaoService alocacaoService,
                         Acesso acesso) {
        this.sprintRepository = sprintRepository;
        this.candidaturaRepository = candidaturaRepository;
        this.oportunidadeRepository = oportunidadeRepository;
        this.candidaturaService = candidaturaService;
        this.alocacaoService = alocacaoService;
        this.acesso = acesso;
    }

    // o provedor ou o mentor que aceitou planeja a próxima sprint
    @Transactional
    public SprintResponse criar(Long candidaturaId, SprintRequest dados, Long pessoaId) {
        Candidatura candidatura = candidaturaService.paraLeitura(candidaturaId, pessoaId);
        exigirQueAcompanha(candidatura, pessoaId);
        exigirAcompanhamento(candidatura);
        LocalDate prazo = dados == null ? null : dados.prazoEntrega();
        if (prazo != null && prazo.isBefore(LocalDate.now())) {
            throw erro(HttpStatus.BAD_REQUEST, "O prazo de entrega não pode ser no passado");
        }
        short numero = (short) (sprintRepository.findByCandidaturaIdOrderByNumero(candidaturaId).stream()
                .mapToInt(Sprint::getNumero).max().orElse(0) + 1);
        return SprintResponse.de(sprintRepository.save(new Sprint(candidaturaId, numero, prazo)));
    }

    // uma sprint por vez em andamento
    @Transactional
    public SprintResponse iniciar(Long sprintId, Long pessoaId) {
        Sprint sprint = buscar(sprintId);
        Candidatura candidatura = candidaturaService.paraLeitura(sprint.getCandidaturaId(), pessoaId);
        exigirQueAcompanha(candidatura, pessoaId);
        exigirAcompanhamento(candidatura);
        exigirEstado(sprint, "PLANEJADA", "Só a sprint planejada começa");
        if (sprintRepository.existsByCandidaturaIdAndEstado(candidatura.getId(), "EM_ANDAMENTO")) {
            throw erro(HttpStatus.CONFLICT, "Já há uma sprint em andamento: entregue-a antes de começar outra");
        }
        sprint.iniciar();
        return SprintResponse.de(sprintRepository.saveAndFlush(sprint));
    }

    // a organização registra a entrega da sprint em andamento
    @Transactional
    public SprintResponse entregar(Long sprintId, EntregaRequest dados, Long pessoaId) {
        String descricao = dados == null || dados.descricao() == null ? "" : dados.descricao().trim();
        if (descricao.isEmpty()) {
            throw erro(HttpStatus.BAD_REQUEST, "Descreva o que foi entregue");
        }
        Sprint sprint = buscar(sprintId);
        Candidatura candidatura = candidaturaService.paraLeitura(sprint.getCandidaturaId(), pessoaId);
        acesso.exigir(pessoaId, candidatura.getOrganizacaoId(), Permissao.CANDIDATAR);
        exigirAcompanhamento(candidatura);
        exigirEstado(sprint, "EM_ANDAMENTO", "Só a sprint em andamento recebe entrega");
        sprint.entregar(descricao, OffsetDateTime.now());
        return SprintResponse.de(sprintRepository.saveAndFlush(sprint));
    }

    // o mentor que acompanha dá nota (0 a 10) e feedback
    @Transactional
    public SprintResponse avaliar(Long sprintId, AvaliacaoEntregaRequest dados, Long pessoaId) {
        if (dados == null || dados.nota() == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo nota é obrigatório");
        }
        if (dados.nota().signum() < 0 || dados.nota().compareTo(NOTA_MAXIMA) > 0) {
            throw erro(HttpStatus.BAD_REQUEST, "A nota da entrega vai de 0 a 10");
        }
        String feedback = dados.feedback() == null ? "" : dados.feedback().trim();
        if (feedback.isEmpty()) {
            throw erro(HttpStatus.BAD_REQUEST, "Escreva o feedback da entrega");
        }
        Sprint sprint = buscar(sprintId);
        Candidatura candidatura = candidaturaService.paraLeitura(sprint.getCandidaturaId(), pessoaId);
        if (alocacaoService.aceitaDoMentor(candidatura.getId(), pessoaId) == null) {
            throw erro(HttpStatus.FORBIDDEN, "Só o mentor que acompanha a candidatura avalia a entrega");
        }
        exigirEstado(sprint, "ENTREGUE", "Só a sprint entregue é avaliada");
        sprint.avaliar(dados.nota(), feedback, pessoaId, OffsetDateTime.now());
        return SprintResponse.de(sprintRepository.saveAndFlush(sprint));
    }

    @Transactional(readOnly = true)
    public List<SprintResponse> listar(Long candidaturaId, Long pessoaId) {
        candidaturaService.paraLeitura(candidaturaId, pessoaId);
        return sprintRepository.findByCandidaturaIdOrderByNumero(candidaturaId).stream().map(SprintResponse::de).toList();
    }

    // ---------- apoio

    // o provedor da oportunidade ou um mentor que aceitou acompanhar
    private void exigirQueAcompanha(Candidatura candidatura, Long pessoaId) {
        Oportunidade oportunidade = oportunidadeRepository.findById(candidatura.getOportunidadeId()).orElseThrow();
        if (!acesso.tem(pessoaId, oportunidade.getOrganizacaoId(), Permissao.CONDUZIR_SELECAO)
                && alocacaoService.aceitaDoMentor(candidatura.getId(), pessoaId) == null) {
            throw erro(HttpStatus.FORBIDDEN, "Só o provedor ou o mentor que acompanha a candidatura mexe nas sprints");
        }
    }

    private void exigirAcompanhamento(Candidatura candidatura) {
        if (!"EM_ACOMPANHAMENTO".equals(candidatura.getEstado())) {
            throw erro(HttpStatus.CONFLICT, "As sprints só andam com a candidatura em acompanhamento");
        }
        candidaturaService.exigirQueAnda(candidatura);
    }

    private void exigirEstado(Sprint sprint, String estado, String mensagem) {
        if (!estado.equals(sprint.getEstado())) {
            throw erro(HttpStatus.CONFLICT, mensagem);
        }
    }

    private Sprint buscar(Long id) {
        return sprintRepository.findById(id).orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Sprint não encontrada"));
    }

    private ResponseStatusException erro(HttpStatus status, String mensagem) {
        return new ResponseStatusException(status, mensagem);
    }
}
