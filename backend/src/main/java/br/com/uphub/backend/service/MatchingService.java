package br.com.uphub.backend.service;

import br.com.uphub.backend.candidatura.TiposPorTrilha;
import br.com.uphub.backend.dto.MatchResponse;
import br.com.uphub.backend.dto.PesosMatchingResponse;
import br.com.uphub.backend.elegibilidade.MotorElegibilidade;
import br.com.uphub.backend.matching.MotorMatching;
import br.com.uphub.backend.model.Oportunidade;
import br.com.uphub.backend.model.Organizacao;
import br.com.uphub.backend.model.SquadIntegrante;
import br.com.uphub.backend.model.VersaoOportunidade;
import br.com.uphub.backend.repository.CandidaturaRepository;
import br.com.uphub.backend.repository.OportunidadeRepository;
import br.com.uphub.backend.repository.OrganizacaoRepository;
import br.com.uphub.backend.repository.SquadIntegranteRepository;
import br.com.uphub.backend.repository.VersaoOportunidadeRepository;
import br.com.uphub.backend.seguranca.Acesso;
import br.com.uphub.backend.seguranca.Permissao;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.Year;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class MatchingService {

    private static final int LIMITE_PADRAO = 20;

    private final OportunidadeRepository oportunidadeRepository;
    private final OrganizacaoRepository organizacaoRepository;
    private final VersaoOportunidadeRepository versaoRepository;
    private final CandidaturaRepository candidaturaRepository;
    private final SquadIntegranteRepository integranteRepository;
    private final RequisitoElegibilidadeService requisitoService;
    private final Acesso acesso;

    public MatchingService(OportunidadeRepository oportunidadeRepository,
                           OrganizacaoRepository organizacaoRepository,
                           VersaoOportunidadeRepository versaoRepository,
                           CandidaturaRepository candidaturaRepository,
                           SquadIntegranteRepository integranteRepository,
                           RequisitoElegibilidadeService requisitoService,
                           Acesso acesso) {
        this.oportunidadeRepository = oportunidadeRepository;
        this.organizacaoRepository = organizacaoRepository;
        this.versaoRepository = versaoRepository;
        this.candidaturaRepository = candidaturaRepository;
        this.integranteRepository = integranteRepository;
        this.requisitoService = requisitoService;
        this.acesso = acesso;
    }

    // para quem se candidata: as oportunidades abertas, da trilha certa para o tipo, em ordem de compatibilidade
    @Transactional(readOnly = true)
    public List<MatchResponse> paraOrganizacao(Long organizacaoId, Integer limite, Long pessoaId) {
        if (organizacaoId == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O parâmetro organizacaoId é obrigatório");
        }
        Organizacao organizacao = organizacaoRepository.findById(organizacaoId)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Organização não encontrada"));
        acesso.exigirAcesso(pessoaId, organizacaoId);
        MotorMatching.Perfil perfil = perfil(organizacao);
        return Stream.of("FOMENTO", "INVESTIMENTO", "FORMACAO")
                .filter(t -> TiposPorTrilha.tipos(t).contains(organizacao.getTipo()))
                .flatMap(t -> oportunidadeRepository.findByTrilhaCodigoAndEstado(t, "PUBLICADA").stream())
                .filter(o -> !o.suspensa() && !o.getOrganizacaoId().equals(organizacaoId))
                .map(o -> abertaComVersao(o).map(v -> linha(organizacao, perfil, o, v)).orElse(null))
                .filter(Objects::nonNull)
                .sorted(Comparator.comparingInt(MatchResponse::compatibilidade).reversed())
                .limit(limite(limite))
                .toList();
    }

    // para o provedor: as organizações que mais combinam com a oportunidade dele
    @Transactional(readOnly = true)
    public List<MatchResponse> paraOportunidade(Long oportunidadeId, Integer limite, Long pessoaId) {
        Oportunidade oportunidade = oportunidadeRepository.findById(oportunidadeId)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Oportunidade não encontrada"));
        if (!acesso.ehGestao(pessoaId)) {
            acesso.exigir(pessoaId, oportunidade.getOrganizacaoId(), Permissao.CONDUZIR_SELECAO);
        }
        VersaoOportunidade versao = versaoRepository.findFirstByOportunidadeIdAndPublicadaEmIsNotNull(oportunidadeId)
                .orElseThrow(() -> erro(HttpStatus.CONFLICT, "Publique a oportunidade para ver o matching"));
        List<String> tipos = List.copyOf(TiposPorTrilha.tipos(oportunidade.getTrilhaCodigo()));
        return organizacaoRepository.findByTipoIn(tipos).stream()
                .filter(org -> !org.getId().equals(oportunidade.getOrganizacaoId()))
                .map(org -> linha(org, perfil(org), oportunidade, versao))
                .filter(Objects::nonNull)
                .sorted(Comparator.comparingInt(MatchResponse::compatibilidade).reversed())
                .limit(limite(limite))
                .toList();
    }

    // os pesos de cada trilha, para a tela explicar a nota
    public List<PesosMatchingResponse> pesos() {
        return Stream.of("FOMENTO", "INVESTIMENTO", "FORMACAO")
                .map(t -> new PesosMatchingResponse(t, MotorMatching.PESOS.get(t).entrySet().stream()
                        .collect(Collectors.toMap(e -> e.getKey().name(), Map.Entry::getValue, (a, b) -> a, LinkedHashMap::new))))
                .toList();
    }

    // ---------- apoio

    // null = inelegível (fica fora do ranking)
    private MatchResponse linha(Organizacao organizacao, MotorMatching.Perfil perfil, Oportunidade oportunidade,
                                VersaoOportunidade versao) {
        MotorElegibilidade.Resultado eleg = MotorElegibilidade.avaliar(
                RequisitoElegibilidadeService.perfil(organizacao, Year.now()), requisitoService.regras(versao.getId()));
        int desejaveis = (int) eleg.requisitos().stream().filter(r -> !r.obrigatoria()).count();
        int atendidos = (int) eleg.requisitos().stream()
                .filter(r -> !r.obrigatoria() && MotorElegibilidade.ATENDIDO.equals(r.situacao())).count();
        String textoDoDesafio = String.join(" ", Stream.of(oportunidade.getTitulo(), oportunidade.getResumo(),
                versao.getEscopo(), versao.getEntregaveis()).filter(Objects::nonNull).toList());
        MotorMatching.Alvo alvo = new MotorMatching.Alvo(oportunidade.getTrilhaCodigo(), oportunidade.getArea(),
                oportunidade.getTese(), textoDoDesafio, eleg.situacao(), eleg.faltou(), desejaveis, atendidos);
        MotorMatching.Resultado r = MotorMatching.avaliar(perfil, alvo);
        if (r.inelegivel()) {
            return null;
        }
        return new MatchResponse(oportunidade.getId(), oportunidade.getTitulo(), oportunidade.getTrilhaCodigo(),
                oportunidade.getArea(), versao.getPrazoEnvio(), organizacao.getId(), organizacao.getNome(),
                organizacao.getTipo(), r.compatibilidade(), eleg.situacao(),
                candidaturaRepository.existsByOportunidadeIdAndOrganizacaoId(oportunidade.getId(), organizacao.getId()),
                r.criterios().stream().map(p -> new MatchResponse.Motivo(p.criterio().getNome(), p.peso(), p.pontos(),
                        p.explicacao())).toList());
    }

    private MotorMatching.Perfil perfil(Organizacao org) {
        List<String> competencias = "SQUAD".equals(org.getTipo())
                ? integranteRepository.listarPorSquad(org.getId()).stream().map(SquadIntegrante::getCompetencia)
                        .filter(Objects::nonNull).toList()
                : List.of();
        return new MotorMatching.Perfil(org.getTipo(), org.getSetor(), org.getEstagio(), org.getDescricao(), competencias);
    }

    // publicada e com prazo aberto
    private Optional<VersaoOportunidade> abertaComVersao(Oportunidade o) {
        return versaoRepository.findFirstByOportunidadeIdAndPublicadaEmIsNotNull(o.getId())
                .filter(v -> v.getPrazoEnvio() == null || !v.getPrazoEnvio().isBefore(LocalDate.now()));
    }

    private long limite(Integer limite) {
        if (limite == null) {
            return LIMITE_PADRAO;
        }
        if (limite < 1 || limite > 100) {
            throw erro(HttpStatus.BAD_REQUEST, "O parâmetro limite vai de 1 a 100");
        }
        return limite;
    }

    private ResponseStatusException erro(HttpStatus status, String mensagem) {
        return new ResponseStatusException(status, mensagem);
    }
}
