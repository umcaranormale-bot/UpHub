package br.com.uphub.backend.service;

import br.com.uphub.backend.dto.AlocacaoRequest;
import br.com.uphub.backend.dto.AlocacaoResponse;
import br.com.uphub.backend.dto.MentorResponse;
import br.com.uphub.backend.dto.MentoriaRequest;
import br.com.uphub.backend.model.AlocacaoMentor;
import br.com.uphub.backend.model.Candidatura;
import br.com.uphub.backend.model.Notificacao;
import br.com.uphub.backend.model.Oportunidade;
import br.com.uphub.backend.model.Vinculo;
import br.com.uphub.backend.repository.AlocacaoMentorRepository;
import br.com.uphub.backend.repository.CandidaturaRepository;
import br.com.uphub.backend.repository.OportunidadeRepository;
import br.com.uphub.backend.repository.OrganizacaoRepository;
import br.com.uphub.backend.repository.VinculoRepository;
import br.com.uphub.backend.seguranca.Acesso;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Set;

@Service
public class AlocacaoService {

    private static final Set<String> RECEBEM_MENTOR = Set.of("HOMOLOGADA", "EM_ACOMPANHAMENTO");
    private static final BigDecimal LIMITE_HORAS = new BigDecimal("9999.9"); // numeric(5,1)

    private final AlocacaoMentorRepository alocacaoRepository;
    private final VinculoRepository vinculoRepository;
    private final CandidaturaRepository candidaturaRepository;
    private final OportunidadeRepository oportunidadeRepository;
    private final OrganizacaoRepository organizacaoRepository;
    private final CandidaturaService candidaturaService;
    private final Acesso acesso;
    private final AuditoriaService auditoria;
    private final NotificacaoService notificacaoService;

    public AlocacaoService(AlocacaoMentorRepository alocacaoRepository,
                           VinculoRepository vinculoRepository,
                           CandidaturaRepository candidaturaRepository,
                           OportunidadeRepository oportunidadeRepository,
                           OrganizacaoRepository organizacaoRepository,
                           CandidaturaService candidaturaService,
                           Acesso acesso,
                           AuditoriaService auditoria,
                           NotificacaoService notificacaoService) {
        this.alocacaoRepository = alocacaoRepository;
        this.vinculoRepository = vinculoRepository;
        this.candidaturaRepository = candidaturaRepository;
        this.oportunidadeRepository = oportunidadeRepository;
        this.organizacaoRepository = organizacaoRepository;
        this.candidaturaService = candidaturaService;
        this.acesso = acesso;
        this.auditoria = auditoria;
        this.notificacaoService = notificacaoService;
    }

    // ---------- área e disponibilidade do mentor

    // o próprio mentor, ou o representante da organização, informa a área e as horas livres por mês
    @Transactional
    public MentorResponse definirMentoria(Long vinculoId, MentoriaRequest dados, Long pessoaId) {
        Vinculo vinculo = vinculoRepository.findById(vinculoId)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Vínculo não encontrado"));
        if (!vinculo.getPessoa().getId().equals(pessoaId)) {
            acesso.exigirRepresentante(pessoaId, vinculo.getOrganizacao().getId(), "mudar a mentoria de outra pessoa");
        }
        if (!"MENTOR".equals(vinculo.getPapel())) {
            throw erro(HttpStatus.BAD_REQUEST, "Área e disponibilidade são só do papel MENTOR");
        }
        String area = dados == null || dados.areaAtuacao() == null || dados.areaAtuacao().isBlank() ? null : dados.areaAtuacao().trim();
        if (area != null && area.length() > 80) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo areaAtuacao aceita no máximo 80 caracteres");
        }
        BigDecimal horas = dados == null ? null : dados.horasDisponiveisMes();
        if (horas != null && (horas.signum() <= 0 || horas.compareTo(LIMITE_HORAS) > 0)) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo horasDisponiveisMes deve ser maior que zero");
        }
        vinculo.definirMentoria(area, horas);
        return mentor(vinculoRepository.saveAndFlush(vinculo));
    }

    // os mentores da organização, com as horas livres; com ?area=, só os daquela área. Mais horas livres primeiro.
    @Transactional(readOnly = true)
    public List<MentorResponse> mentores(Long organizacaoId, String area, Long pessoaId) {
        if (!organizacaoRepository.existsById(organizacaoId)) {
            throw erro(HttpStatus.NOT_FOUND, "Organização não encontrada");
        }
        acesso.exigirAcesso(pessoaId, organizacaoId);
        String filtro = area == null || area.isBlank() ? null : area.trim().toLowerCase();
        return vinculoRepository.listarPorOrganizacao(organizacaoId).stream()
                .filter(v -> "MENTOR".equals(v.getPapel()) && v.getEncerradoEm() == null)
                .filter(v -> filtro == null || (v.getAreaAtuacao() != null && v.getAreaAtuacao().toLowerCase().contains(filtro)))
                .map(this::mentor)
                .sorted(Comparator.comparing(MentorResponse::horasLivresMes, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    // ---------- provedor

    @Transactional
    public AlocacaoResponse convidar(Long candidaturaId, AlocacaoRequest dados, Long pessoaId) {
        if (dados == null || dados.vinculoId() == null || dados.horasPrevistasMes() == null || dados.prazoResposta() == null) {
            throw erro(HttpStatus.BAD_REQUEST, "Os campos vinculoId, horasPrevistasMes e prazoResposta são obrigatórios");
        }
        Candidatura candidatura = candidaturaService.comoProvedor(candidaturaId, pessoaId);
        candidaturaService.exigirQueAnda(candidatura);
        if (!RECEBEM_MENTOR.contains(candidatura.getEstado())) {
            throw erro(HttpStatus.CONFLICT, "Só a candidatura homologada ou em acompanhamento recebe mentor");
        }
        Oportunidade oportunidade = oportunidadeRepository.findById(candidatura.getOportunidadeId()).orElseThrow();
        Vinculo vinculo = vinculoRepository.findById(dados.vinculoId())
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Vínculo não encontrado"));
        if (!"MENTOR".equals(vinculo.getPapel()) || vinculo.getEncerradoEm() != null
                || !vinculo.getOrganizacao().getId().equals(oportunidade.getOrganizacaoId())) {
            throw erro(HttpStatus.BAD_REQUEST, "O mentor precisa ter vínculo ativo, com papel MENTOR, na organização da oportunidade");
        }
        if (acesso.ehMembro(vinculo.getPessoa().getId(), candidatura.getOrganizacaoId())) {
            throw erro(HttpStatus.CONFLICT, "Conflito de interesse: o mentor faz parte da organização candidata");
        }
        BigDecimal horas = dados.horasPrevistasMes();
        if (horas.signum() <= 0 || horas.compareTo(LIMITE_HORAS) > 0) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo horasPrevistasMes deve ser maior que zero");
        }
        if (dados.prazoResposta().isBefore(LocalDate.now())) {
            throw erro(HttpStatus.BAD_REQUEST, "O prazo de resposta não pode ser no passado");
        }
        exigirDisponibilidade(vinculo, horas);
        if (alocacaoRepository.existsByVinculoIdAndCandidaturaId(vinculo.getId(), candidaturaId)) {
            throw erro(HttpStatus.CONFLICT, "Este mentor já foi convidado para esta candidatura");
        }
        AlocacaoMentor alocacao = alocacaoRepository.save(new AlocacaoMentor(vinculo.getId(), candidaturaId, horas,
                dados.prazoResposta(), pessoaId, OffsetDateTime.now()));
        // convite de mentor: pede ação do mentor
        notificacaoService.criar(vinculo.getPessoa().getId(), candidatura.getOportunidadeId(),
                "Convite para ser mentor",
                "Você foi convidado(a) para mentorar a candidatura \"" + candidatura.getTituloProposta()
                        + "\" (" + horas.stripTrailingZeros().toPlainString() + " h/mês). Responda até "
                        + dados.prazoResposta() + ".",
                Notificacao.PEDE_ACAO);
        return resposta(alocacao, candidatura, vinculo);
    }

    // ---------- mentor

    @Transactional
    public AlocacaoResponse responder(Long alocacaoId, boolean aceita, Long pessoaId) {
        AlocacaoMentor alocacao = alocacaoRepository.findById(alocacaoId)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Alocação não encontrada"));
        Vinculo vinculo = vinculoRepository.findById(alocacao.getVinculoId()).orElseThrow();
        if (!vinculo.getPessoa().getId().equals(pessoaId) || vinculo.getEncerradoEm() != null) {
            throw erro(HttpStatus.FORBIDDEN, "Só o mentor convidado responde ao convite");
        }
        if (!"PENDENTE".equals(alocacao.getSituacao())) {
            throw erro(HttpStatus.CONFLICT, "Este convite já foi respondido");
        }
        if (alocacao.getPrazoResposta().isBefore(LocalDate.now())) {
            throw erro(HttpStatus.CONFLICT, "O prazo para responder este convite já passou");
        }
        alocacao.responder(aceita, OffsetDateTime.now());
        Candidatura candidatura = candidaturaRepository.findById(alocacao.getCandidaturaId()).orElseThrow();
        return resposta(alocacaoRepository.saveAndFlush(alocacao), candidatura, vinculo);
    }

    @Transactional(readOnly = true)
    public List<AlocacaoResponse> minhas(Long pessoaId) {
        return alocacaoRepository.doMentor(pessoaId).stream()
                .map(a -> resposta(a, candidaturaRepository.findById(a.getCandidaturaId()).orElseThrow(),
                        vinculoRepository.findById(a.getVinculoId()).orElseThrow()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AlocacaoResponse> listarDaCandidatura(Long candidaturaId, Long pessoaId) {
        Candidatura candidatura = candidaturaService.paraLeitura(candidaturaId, pessoaId);
        return alocacaoRepository.findByCandidaturaIdOrderByConvidadaEm(candidaturaId).stream()
                .map(a -> resposta(a, candidatura, vinculoRepository.findById(a.getVinculoId()).orElseThrow()))
                .toList();
    }

    // ---------- para as sprints e as sessões

    // a alocação aceita do mentor logado nesta candidatura
    @Transactional(readOnly = true)
    public AlocacaoMentor aceitaDoMentor(Long candidaturaId, Long pessoaId) {
        return alocacaoRepository.findByCandidaturaIdOrderByConvidadaEm(candidaturaId).stream()
                .filter(a -> "ACEITA".equals(a.getSituacao()))
                .filter(a -> vinculoRepository.findById(a.getVinculoId())
                        .map(v -> v.getPessoa().getId().equals(pessoaId) && v.getEncerradoEm() == null).orElse(false))
                .findFirst()
                .orElse(null);
    }

    // ---------- sistema: convite sem resposta no prazo expira

    @Scheduled(fixedDelayString = "${uphub.ajuste.intervalo-ms:600000}", initialDelayString = "${uphub.ajuste.intervalo-ms:600000}")
    @Transactional
    public void expirarConvites() {
        for (AlocacaoMentor a : alocacaoRepository.findBySituacaoAndPrazoRespostaBefore("PENDENTE", LocalDate.now())) {
            a.expirar();
            alocacaoRepository.save(a);
            Long oportunidadeId = candidaturaRepository.findById(a.getCandidaturaId())
                    .map(Candidatura::getOportunidadeId).orElse(null);
            auditoria.registrar(null, AuditoriaService.AGENDADOR, null,
                    "CONVITE_EXPIRADO", "ALOCACAO_MENTOR", a.getId(),
                    oportunidadeId, a.getCandidaturaId(), null,
                    "PENDENTE", "EXPIRADA", null);
        }
    }

    // ---------- apoio

    private void exigirDisponibilidade(Vinculo vinculo, BigDecimal horas) {
        if (vinculo.getHorasDisponiveisMes() == null) {
            return;
        }
        BigDecimal livres = vinculo.getHorasDisponiveisMes().subtract(alocacaoRepository.horasComprometidas(vinculo.getId()));
        if (horas.compareTo(livres) > 0) {
            throw erro(HttpStatus.CONFLICT, "O mentor tem só " + livres.max(BigDecimal.ZERO).stripTrailingZeros().toPlainString()
                    + " horas livres por mês");
        }
    }

    private MentorResponse mentor(Vinculo v) {
        BigDecimal comprometidas = alocacaoRepository.horasComprometidas(v.getId());
        BigDecimal livres = v.getHorasDisponiveisMes() == null ? null : v.getHorasDisponiveisMes().subtract(comprometidas).max(BigDecimal.ZERO);
        return new MentorResponse(v.getId(), v.getPessoa().getId(), v.getPessoa().getNome(), v.getOrganizacao().getId(),
                v.getAreaAtuacao(), v.getHorasDisponiveisMes(), comprometidas, livres);
    }

    private AlocacaoResponse resposta(AlocacaoMentor a, Candidatura c, Vinculo v) {
        return new AlocacaoResponse(a.getId(), c.getId(), c.getTituloProposta(), c.getEstado(), v.getId(),
                v.getPessoa().getNome(), v.getAreaAtuacao(), a.getHorasPrevistasMes(), a.getPrazoResposta(),
                a.getSituacao(), a.getConvidadaEm(), a.getRespondidaEm());
    }

    private ResponseStatusException erro(HttpStatus status, String mensagem) {
        return new ResponseStatusException(status, mensagem);
    }
}