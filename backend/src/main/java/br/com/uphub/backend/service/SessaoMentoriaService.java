package br.com.uphub.backend.service;

import br.com.uphub.backend.dto.HorasMentoriaResponse;
import br.com.uphub.backend.dto.SessaoMentoriaRequest;
import br.com.uphub.backend.dto.SessaoMentoriaResponse;
import br.com.uphub.backend.model.AlocacaoMentor;
import br.com.uphub.backend.model.Candidatura;
import br.com.uphub.backend.model.Oportunidade;
import br.com.uphub.backend.model.SessaoMentoria;
import br.com.uphub.backend.model.Sprint;
import br.com.uphub.backend.model.Vinculo;
import br.com.uphub.backend.repository.AlocacaoMentorRepository;
import br.com.uphub.backend.repository.CandidaturaRepository;
import br.com.uphub.backend.repository.OportunidadeRepository;
import br.com.uphub.backend.repository.SessaoMentoriaRepository;
import br.com.uphub.backend.repository.SprintRepository;
import br.com.uphub.backend.repository.VinculoRepository;
import br.com.uphub.backend.seguranca.Acesso;
import br.com.uphub.backend.seguranca.Permissao;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.List;

@Service
public class SessaoMentoriaService {

    private final SessaoMentoriaRepository sessaoRepository;
    private final AlocacaoMentorRepository alocacaoRepository;
    private final SprintRepository sprintRepository;
    private final VinculoRepository vinculoRepository;
    private final CandidaturaRepository candidaturaRepository;
    private final OportunidadeRepository oportunidadeRepository;
    private final CandidaturaService candidaturaService;
    private final Acesso acesso;

    public SessaoMentoriaService(SessaoMentoriaRepository sessaoRepository,
                                 AlocacaoMentorRepository alocacaoRepository,
                                 SprintRepository sprintRepository,
                                 VinculoRepository vinculoRepository,
                                 CandidaturaRepository candidaturaRepository,
                                 OportunidadeRepository oportunidadeRepository,
                                 CandidaturaService candidaturaService,
                                 Acesso acesso) {
        this.sessaoRepository = sessaoRepository;
        this.alocacaoRepository = alocacaoRepository;
        this.sprintRepository = sprintRepository;
        this.vinculoRepository = vinculoRepository;
        this.candidaturaRepository = candidaturaRepository;
        this.oportunidadeRepository = oportunidadeRepository;
        this.candidaturaService = candidaturaService;
        this.acesso = acesso;
    }

    // ---------- mentor

    // o mentor registra a sessão que já aconteceu, em rascunho
    @Transactional
    public SessaoMentoriaResponse registrar(Long alocacaoId, SessaoMentoriaRequest dados, Long pessoaId) {
        if (dados == null || dados.dataSessao() == null || dados.duracaoMinutos() == null) {
            throw erro(HttpStatus.BAD_REQUEST, "Os campos dataSessao e duracaoMinutos são obrigatórios");
        }
        AlocacaoMentor alocacao = doMentor(alocacaoId, pessoaId);
        if (!"ACEITA".equals(alocacao.getSituacao())) {
            throw erro(HttpStatus.CONFLICT, "Só a alocação aceita registra sessões");
        }
        Candidatura candidatura = candidaturaRepository.findById(alocacao.getCandidaturaId()).orElseThrow();
        if (!"EM_ACOMPANHAMENTO".equals(candidatura.getEstado())) {
            throw erro(HttpStatus.CONFLICT, "As sessões são registradas com a candidatura em acompanhamento");
        }
        SessaoMentoria sessao = new SessaoMentoria(alocacaoId, OffsetDateTime.now());
        aplicar(sessao, dados, candidatura);
        return resposta(sessaoRepository.save(sessao));
    }

    @Transactional
    public SessaoMentoriaResponse editar(Long sessaoId, SessaoMentoriaRequest dados, Long pessoaId) {
        SessaoMentoria sessao = rascunhoDoMentor(sessaoId, pessoaId);
        AlocacaoMentor alocacao = alocacaoRepository.findById(sessao.getAlocacaoId()).orElseThrow();
        aplicar(sessao, dados == null ? new SessaoMentoriaRequest(null, null, null, null) : dados,
                candidaturaRepository.findById(alocacao.getCandidaturaId()).orElseThrow());
        return resposta(sessaoRepository.saveAndFlush(sessao));
    }

    @Transactional
    public SessaoMentoriaResponse assinar(Long sessaoId, Long pessoaId) {
        SessaoMentoria sessao = rascunhoDoMentor(sessaoId, pessoaId);
        if (sessao.getFeedback() == null || sessao.getFeedback().isBlank()) {
            throw erro(HttpStatus.BAD_REQUEST, "Escreva o feedback antes de assinar a sessão");
        }
        sessao.assinar(OffsetDateTime.now());
        return resposta(sessaoRepository.saveAndFlush(sessao));
    }

    @Transactional
    public void apagar(Long sessaoId, Long pessoaId) {
        sessaoRepository.delete(rascunhoDoMentor(sessaoId, pessoaId));
    }

    // ---------- leitura

    // o provedor, a gestão e os mentores veem tudo; a organização candidata vê as assinadas
    @Transactional(readOnly = true)
    public List<SessaoMentoriaResponse> listarDaCandidatura(Long candidaturaId, Long pessoaId) {
        Candidatura candidatura = candidaturaService.paraLeitura(candidaturaId, pessoaId);
        List<AlocacaoMentor> alocacoes = alocacaoRepository.findByCandidaturaIdOrderByConvidadaEm(candidaturaId);
        boolean veTudo = conduz(candidatura, pessoaId) || alocacoes.stream().anyMatch(a -> ehDoMentor(a, pessoaId));
        return sessaoRepository.findByAlocacaoIdInOrderByDataSessaoAscIdAsc(alocacoes.stream().map(AlocacaoMentor::getId).toList())
                .stream()
                .filter(s -> veTudo || s.assinada())
                .map(this::resposta)
                .toList();
    }

    // horas do mês: previstas na alocação e realizadas nas sessões assinadas
    @Transactional(readOnly = true)
    public HorasMentoriaResponse horas(Long alocacaoId, String mes, Long pessoaId) {
        AlocacaoMentor alocacao = alocacaoRepository.findById(alocacaoId)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Alocação não encontrada"));
        candidaturaService.paraLeitura(alocacao.getCandidaturaId(), pessoaId);
        YearMonth periodo;
        try {
            periodo = mes == null || mes.isBlank() ? YearMonth.now() : YearMonth.parse(mes.trim());
        } catch (DateTimeParseException e) {
            throw erro(HttpStatus.BAD_REQUEST, "O parâmetro mes vai no formato AAAA-MM");
        }
        List<SessaoMentoria> sessoes = sessaoRepository.findByAlocacaoIdAndSituacaoAndDataSessaoBetween(
                alocacaoId, "ASSINADO", periodo.atDay(1), periodo.atEndOfMonth());
        int minutos = sessoes.stream().mapToInt(SessaoMentoria::getDuracaoMinutos).sum();
        return new HorasMentoriaResponse(alocacaoId, periodo.toString(), alocacao.getHorasPrevistasMes(), minutos,
                BigDecimal.valueOf(minutos).divide(BigDecimal.valueOf(60), 1, RoundingMode.HALF_UP), sessoes.size());
    }

    // ---------- apoio

    private void aplicar(SessaoMentoria sessao, SessaoMentoriaRequest dados, Candidatura candidatura) {
        LocalDate data = dados.dataSessao() != null ? dados.dataSessao() : sessao.getDataSessao();
        if (data.isAfter(LocalDate.now())) {
            throw erro(HttpStatus.BAD_REQUEST, "A sessão é registrada depois que acontece: a data não pode ser no futuro");
        }
        Integer duracao = dados.duracaoMinutos() != null ? dados.duracaoMinutos()
                : (sessao.getDuracaoMinutos() == null ? null : sessao.getDuracaoMinutos().intValue());
        if (duracao == null || duracao <= 0 || duracao > 600) {
            throw erro(HttpStatus.BAD_REQUEST, "A duração vai de 1 a 600 minutos");
        }
        Long sprintId = dados.sprintId() != null ? dados.sprintId() : sessao.getSprintId();
        if (sprintId != null) {
            Sprint sprint = sprintRepository.findById(sprintId)
                    .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Sprint não encontrada"));
            if (!sprint.getCandidaturaId().equals(candidatura.getId())) {
                throw erro(HttpStatus.BAD_REQUEST, "Esta sprint é de outra candidatura");
            }
        }
        String feedback = dados.feedback() != null ? dados.feedback().trim() : sessao.getFeedback();
        sessao.preencher(sprintId, data, duracao.shortValue(), feedback == null || feedback.isEmpty() ? null : feedback);
    }

    private AlocacaoMentor doMentor(Long alocacaoId, Long pessoaId) {
        AlocacaoMentor alocacao = alocacaoRepository.findById(alocacaoId)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Alocação não encontrada"));
        if (!ehDoMentor(alocacao, pessoaId)) {
            throw erro(HttpStatus.FORBIDDEN, "Só o mentor desta alocação registra as sessões");
        }
        return alocacao;
    }

    private SessaoMentoria rascunhoDoMentor(Long sessaoId, Long pessoaId) {
        SessaoMentoria sessao = sessaoRepository.findById(sessaoId)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Sessão não encontrada"));
        doMentor(sessao.getAlocacaoId(), pessoaId);
        if (sessao.assinada()) {
            throw erro(HttpStatus.CONFLICT, "Esta sessão já foi assinada e não muda mais");
        }
        return sessao;
    }

    private boolean ehDoMentor(AlocacaoMentor alocacao, Long pessoaId) {
        return vinculoRepository.findById(alocacao.getVinculoId())
                .map(v -> v.getPessoa().getId().equals(pessoaId) && v.getEncerradoEm() == null)
                .orElse(false);
    }

    private boolean conduz(Candidatura candidatura, Long pessoaId) {
        Oportunidade oportunidade = oportunidadeRepository.findById(candidatura.getOportunidadeId()).orElseThrow();
        return acesso.ehGestao(pessoaId) || acesso.tem(pessoaId, oportunidade.getOrganizacaoId(), Permissao.CONDUZIR_SELECAO);
    }

    private SessaoMentoriaResponse resposta(SessaoMentoria s) {
        AlocacaoMentor alocacao = alocacaoRepository.findById(s.getAlocacaoId()).orElseThrow();
        String mentor = vinculoRepository.findById(alocacao.getVinculoId()).map(Vinculo::getPessoa).map(p -> p.getNome()).orElse(null);
        Short numero = s.getSprintId() == null ? null : sprintRepository.findById(s.getSprintId()).map(Sprint::getNumero).orElse(null);
        return new SessaoMentoriaResponse(s.getId(), s.getAlocacaoId(), alocacao.getCandidaturaId(), mentor, s.getSprintId(), numero,
                s.getDataSessao(), s.getDuracaoMinutos(), s.getFeedback(), s.getSituacao(), s.getAssinadoEm(), s.getRegistradaEm());
    }

    private ResponseStatusException erro(HttpStatus status, String mensagem) {
        return new ResponseStatusException(status, mensagem);
    }
}
