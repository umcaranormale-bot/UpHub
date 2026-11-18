package br.com.uphub.backend.service;

import br.com.uphub.backend.candidatura.EstagioFunil;
import br.com.uphub.backend.candidatura.EtapaDoEnvio;
import br.com.uphub.backend.candidatura.MaquinaDeEstados;
import br.com.uphub.backend.candidatura.MaquinaDeEstados.Ator;
import br.com.uphub.backend.candidatura.TiposPorTrilha;
import br.com.uphub.backend.dto.CandidaturaEnvioResponse;
import br.com.uphub.backend.dto.CandidaturaRequest;
import br.com.uphub.backend.dto.CandidaturaResponse;
import br.com.uphub.backend.dto.DecisaoElegibilidadeRequest;
import br.com.uphub.backend.dto.ElegibilidadeResponse;
import br.com.uphub.backend.dto.FunilRequest;
import br.com.uphub.backend.dto.TransicaoResponse;
import br.com.uphub.backend.elegibilidade.MotorElegibilidade;
import br.com.uphub.backend.model.Candidatura;
import br.com.uphub.backend.model.CandidaturaParticipanteId;
import br.com.uphub.backend.model.Oportunidade;
import br.com.uphub.backend.model.Organizacao;
import br.com.uphub.backend.model.VersaoOportunidade;
import br.com.uphub.backend.repository.AlocacaoMentorRepository;
import br.com.uphub.backend.repository.AvaliacaoRepository;
import br.com.uphub.backend.repository.CandidaturaParticipanteRepository;
import br.com.uphub.backend.repository.CandidaturaRepository;
import br.com.uphub.backend.repository.OportunidadeRepository;
import br.com.uphub.backend.repository.OrganizacaoRepository;
import br.com.uphub.backend.repository.VersaoOportunidadeRepository;
import br.com.uphub.backend.seguranca.Acesso;
import br.com.uphub.backend.seguranca.Permissao;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.json.JsonMapper;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.Year;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

@Service
public class CandidaturaService {

    private static final JsonMapper JSON = JsonMapper.builder().build();
    private static final Set<String> FORA_DA_LISTA_DO_PROVEDOR = Set.of("RASCUNHO", "DESCARTADA");
    private static final BigDecimal LIMITE_VALOR = new BigDecimal("999999999999.99"); // numeric(14,2)

    private final CandidaturaRepository candidaturaRepository;
    private final CandidaturaParticipanteRepository participanteRepository;
    private final AvaliacaoRepository avaliacaoRepository;
    private final AlocacaoMentorRepository alocacaoRepository;
    private final OportunidadeRepository oportunidadeRepository;
    private final VersaoOportunidadeRepository versaoRepository;
    private final OrganizacaoRepository organizacaoRepository;
    private final RequisitoElegibilidadeService requisitoService;
    private final Acesso acesso;
    private final ObjectProvider<EtapaDoEnvio> etapasDoEnvio;

    public CandidaturaService(CandidaturaRepository candidaturaRepository,
                              CandidaturaParticipanteRepository participanteRepository,
                              AvaliacaoRepository avaliacaoRepository,
                              AlocacaoMentorRepository alocacaoRepository,
                              OportunidadeRepository oportunidadeRepository,
                              VersaoOportunidadeRepository versaoRepository,
                              OrganizacaoRepository organizacaoRepository,
                              RequisitoElegibilidadeService requisitoService,
                              Acesso acesso,
                              ObjectProvider<EtapaDoEnvio> etapasDoEnvio) {
        this.candidaturaRepository = candidaturaRepository;
        this.participanteRepository = participanteRepository;
        this.avaliacaoRepository = avaliacaoRepository;
        this.alocacaoRepository = alocacaoRepository;
        this.oportunidadeRepository = oportunidadeRepository;
        this.versaoRepository = versaoRepository;
        this.organizacaoRepository = organizacaoRepository;
        this.requisitoService = requisitoService;
        this.acesso = acesso;
        this.etapasDoEnvio = etapasDoEnvio;
    }

    // ---------- candidato

    @Transactional
    public CandidaturaResponse cadastrar(Long oportunidadeId, CandidaturaRequest dados, Long pessoaId) {
        if (dados.organizacaoId() == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo organizacaoId é obrigatório");
        }
        Oportunidade oportunidade = buscarOportunidade(oportunidadeId);
        Organizacao organizacao = organizacaoRepository.findById(dados.organizacaoId())
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Organização não encontrada"));
        acesso.exigir(pessoaId, organizacao.getId(), Permissao.CANDIDATAR);

        if (organizacao.getId().equals(oportunidade.getOrganizacaoId())) {
            throw erro(HttpStatus.BAD_REQUEST, "A organização não pode se candidatar à própria oportunidade");
        }
        exigirAberta(oportunidade);
        exigirTipoDaTrilha(oportunidade.getTrilhaCodigo(), organizacao.getTipo());
        if (candidaturaRepository.existsByOportunidadeIdAndOrganizacaoId(oportunidadeId, organizacao.getId())) {
            throw erro(HttpStatus.CONFLICT, "Esta organização já tem uma candidatura nesta oportunidade");
        }

        Candidatura candidatura = new Candidatura(oportunidadeId, organizacao.getId(), pessoaId);
        preencher(candidatura, dados);
        candidatura.marcarSalva(OffsetDateTime.now());
        return CandidaturaResponse.de(candidaturaRepository.saveAndFlush(candidatura));
    }

    @Transactional
    public CandidaturaResponse editar(Long id, CandidaturaRequest dados, Long pessoaId) {
        Candidatura candidatura = buscarVisivel(id, pessoaId);
        acesso.exigir(pessoaId, candidatura.getOrganizacaoId(), Permissao.CANDIDATAR);
        if (!"RASCUNHO".equals(candidatura.getEstado())) {
            throw erro(HttpStatus.CONFLICT, "Só dá para editar a candidatura enquanto ela é rascunho");
        }
        preencher(candidatura, dados);
        candidatura.marcarSalva(OffsetDateTime.now());
        return CandidaturaResponse.de(candidaturaRepository.saveAndFlush(candidatura));
    }

    // envio: congela o perfil, roda o motor de elegibilidade e a candidatura sai do rascunho
    @Transactional
    public CandidaturaEnvioResponse enviar(Long id, Long pessoaId) {
        Candidatura candidatura = buscarVisivel(id, pessoaId);
        acesso.exigir(pessoaId, candidatura.getOrganizacaoId(), Permissao.CANDIDATAR);
        if (!"RASCUNHO".equals(candidatura.getEstado())) {
            throw erro(HttpStatus.CONFLICT, "Esta candidatura já foi enviada");
        }
        Oportunidade oportunidade = buscarOportunidade(candidatura.getOportunidadeId());
        VersaoOportunidade versao = exigirAberta(oportunidade);
        if (candidatura.getTituloProposta() == null) {
            throw erro(HttpStatus.BAD_REQUEST, "Preencha o título da proposta antes de enviar");
        }
        // cada parte da candidatura confere o que é dela (participantes, notas, anexos...)
        etapasDoEnvio.orderedStream().forEach(etapa -> etapa.conferir(candidatura, versao));

        Organizacao organizacao = organizacaoRepository.findById(candidatura.getOrganizacaoId())
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Organização não encontrada"));
        MotorElegibilidade.Resultado resultado = MotorElegibilidade.avaliar(
                RequisitoElegibilidadeService.perfil(organizacao, Year.now()), requisitoService.regras(versao.getId()));

        String estadoDepois = switch (resultado.situacao()) {
            case MotorElegibilidade.ELEGIVEL -> "ELEGIVEL";
            case MotorElegibilidade.INELEGIVEL -> "NAO_ELEGIVEL";
            default -> "ENVIADA"; // pendente: o provedor confere
        };
        exigirTransicao(candidatura.getEstado(), estadoDepois, Ator.CANDIDATO);

        OffsetDateTime agora = OffsetDateTime.now();
        candidatura.enviar(versao.getId(), agora, perfilCongelado(organizacao, agora), estadoDepois);
        if ("INVESTIMENTO".equals(oportunidade.getTrilhaCodigo()) && !"NAO_ELEGIVEL".equals(estadoDepois)) {
            candidatura.moverNoFunil(EstagioFunil.INSCRITA.name());
        }
        candidaturaRepository.saveAndFlush(candidatura);
        etapasDoEnvio.orderedStream().forEach(etapa -> etapa.depoisDoEnvio(candidatura, versao, resultado));

        ElegibilidadeResponse elegibilidade = new ElegibilidadeResponse(organizacao.getId(), versao.getId(),
                resultado.situacao(), resultado.requisitos(), resultado.faltou());
        return new CandidaturaEnvioResponse(CandidaturaResponse.de(candidatura), elegibilidade);
    }

    @Transactional(readOnly = true)
    public CandidaturaResponse buscarPorId(Long id, Long pessoaId) {
        return CandidaturaResponse.de(buscarVisivel(id, pessoaId));
    }

    @Transactional(readOnly = true)
    public List<CandidaturaResponse> listarDaOrganizacao(Long organizacaoId, Long pessoaId) {
        if (organizacaoId == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O parâmetro organizacaoId é obrigatório");
        }
        if (!organizacaoRepository.existsById(organizacaoId)) {
            throw erro(HttpStatus.NOT_FOUND, "Organização não encontrada");
        }
        acesso.exigirAcesso(pessoaId, organizacaoId);
        return candidaturaRepository.findByOrganizacaoIdOrderByCriadaEmDesc(organizacaoId).stream()
                .map(CandidaturaResponse::de)
                .toList();
    }

    // ---------- provedor

    // o provedor vê as candidaturas da oportunidade dele, menos os rascunhos
    @Transactional(readOnly = true)
    public List<CandidaturaResponse> listarDaOportunidade(Long oportunidadeId, String estado, Long pessoaId) {
        Oportunidade oportunidade = buscarOportunidade(oportunidadeId);
        // o avaliador não vê a lista inteira: ele trabalha pela fila dele (GET /api/avaliacoes)
        if (!acesso.ehGestao(pessoaId)) {
            acesso.exigir(pessoaId, oportunidade.getOrganizacaoId(), Permissao.CONDUZIR_SELECAO);
        }
        List<Candidatura> lista;
        if (estado == null || estado.isBlank()) {
            lista = candidaturaRepository.findByOportunidadeIdAndEstadoNotInOrderByEnviadaEm(oportunidadeId, FORA_DA_LISTA_DO_PROVEDOR);
        } else {
            String filtro = estado.trim().toUpperCase();
            if (!MaquinaDeEstados.ESTADOS.contains(filtro) || FORA_DA_LISTA_DO_PROVEDOR.contains(filtro)) {
                throw erro(HttpStatus.BAD_REQUEST, "Estado inválido para esta lista");
            }
            lista = candidaturaRepository.findByOportunidadeIdAndEstadoOrderByEnviadaEm(oportunidadeId, filtro);
        }
        return lista.stream().map(CandidaturaResponse::de).toList();
    }

    // candidatura pendente (faltou um dado da organização): o provedor confere e decide
    @Transactional
    public CandidaturaResponse decidirElegibilidade(Long id, DecisaoElegibilidadeRequest dados, Long pessoaId) {
        if (dados == null || dados.elegivel() == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo elegivel é obrigatório");
        }
        Candidatura candidatura = buscarComoProvedor(id, pessoaId);
        mover(candidatura, dados.elegivel() ? "ELEGIVEL" : "NAO_ELEGIVEL", Ator.PROVEDOR);
        if (!dados.elegivel()) {
            candidatura.moverNoFunil(null);
        }
        return CandidaturaResponse.de(candidaturaRepository.saveAndFlush(candidatura));
    }

    @Transactional
    public CandidaturaResponse iniciarAnalise(Long id, Long pessoaId) {
        Candidatura candidatura = buscarComoProvedor(id, pessoaId);
        mover(candidatura, "EM_ANALISE", Ator.PROVEDOR);
        return CandidaturaResponse.de(candidaturaRepository.saveAndFlush(candidatura));
    }

    // funil da trilha Investimento: só para a frente, enquanto a candidatura está na seleção
    @Transactional
    public CandidaturaResponse moverNoFunil(Long id, FunilRequest dados, Long pessoaId) {
        EstagioFunil novo = EstagioFunil.de(dados == null ? null : dados.estagio());
        if (novo == null) {
            throw erro(HttpStatus.BAD_REQUEST, "Estágio inválido. Use: INSCRITA, TRIADA, EM_DILIGENCIA ou SELECIONADA");
        }
        Candidatura candidatura = buscarComoProvedor(id, pessoaId);
        Oportunidade oportunidade = buscarOportunidade(candidatura.getOportunidadeId());
        if (!"INVESTIMENTO".equals(oportunidade.getTrilhaCodigo())) {
            throw erro(HttpStatus.BAD_REQUEST, "O funil só existe na trilha Investimento");
        }
        exigirNaoPausada(oportunidade);
        if (!Set.of("ENVIADA", "ELEGIVEL", "EM_ANALISE").contains(candidatura.getEstado())) {
            throw erro(HttpStatus.CONFLICT, "A candidatura não está mais na seleção");
        }
        EstagioFunil atual = EstagioFunil.de(candidatura.getEstagioFunil());
        if (atual != null && novo.ordinal() <= atual.ordinal()) {
            throw erro(HttpStatus.CONFLICT, "O funil só anda para a frente: a candidatura já está em " + atual.name());
        }
        candidatura.moverNoFunil(novo.name());
        return CandidaturaResponse.de(candidaturaRepository.saveAndFlush(candidatura));
    }

    // ---------- máquina de estados, para a tela e para a documentação

    public List<TransicaoResponse> transicoes() {
        return MaquinaDeEstados.todas().stream()
                .map(t -> new TransicaoResponse(t.de(), t.para(),
                        new TreeSet<>(t.atores().stream().map(Enum::name).toList())))
                .toList();
    }

    // ---------- para as partes da candidatura (participantes, notas, anexos, autodeclaração)

    // quem pode ver a candidatura (organização candidata, gestão e, depois do envio, o provedor)
    @Transactional(readOnly = true)
    public Candidatura paraLeitura(Long id, Long pessoaId) {
        return buscarVisivel(id, pessoaId);
    }

    // o candidato mexendo na candidatura enquanto ela é rascunho
    @Transactional(readOnly = true)
    public Candidatura rascunhoDoCandidato(Long id, Long pessoaId) {
        Candidatura candidatura = buscarVisivel(id, pessoaId);
        acesso.exigir(pessoaId, candidatura.getOrganizacaoId(), Permissao.CANDIDATAR);
        if (!"RASCUNHO".equals(candidatura.getEstado())) {
            throw erro(HttpStatus.CONFLICT, "Só dá para mudar isso enquanto a candidatura é rascunho");
        }
        return candidatura;
    }

    // a versão publicada da oportunidade da candidatura (é ela que vale no envio)
    @Transactional(readOnly = true)
    public VersaoOportunidade versaoPublicada(Candidatura candidatura) {
        return versaoRepository.findFirstByOportunidadeIdAndPublicadaEmIsNotNull(candidatura.getOportunidadeId())
                .orElseThrow(() -> erro(HttpStatus.CONFLICT, "Esta oportunidade não está recebendo candidaturas"));
    }

    // o provedor da oportunidade da candidatura
    @Transactional(readOnly = true)
    public Candidatura comoProvedor(Long id, Long pessoaId) {
        return buscarComoProvedor(id, pessoaId);
    }

    // o provedor leva a candidatura a outro estado por causa de uma parte dela (ex.: autodeclaração recusada)
    @Transactional
    public Candidatura moverComoProvedor(Candidatura candidatura, String para) {
        mover(candidatura, para, Ator.PROVEDOR);
        return candidaturaRepository.saveAndFlush(candidatura);
    }

    // o avaliador leva a candidatura ao resultado da rodada (aprovada, reprovada ou ajuste)
    @Transactional
    public Candidatura moverComoAvaliador(Candidatura candidatura, String para) {
        mover(candidatura, para, Ator.AVALIADOR);
        return candidaturaRepository.saveAndFlush(candidatura);
    }

    // uma parte da candidatura (ajuste, prazos) leva o estado adiante pela máquina, com o ator certo
    @Transactional
    public Candidatura moverPor(Candidatura candidatura, String para, Ator ator) {
        mover(candidatura, para, ator);
        return candidaturaRepository.saveAndFlush(candidatura);
    }

    // a seleção só anda com a oportunidade ativa
    public void exigirQueAnda(Candidatura candidatura) {
        exigirNaoPausada(buscarOportunidade(candidatura.getOportunidadeId()));
    }

    // vê a candidatura só por ser avaliador dela (não é da organização, não participa, não conduz a seleção)
    @Transactional(readOnly = true)
    public boolean soComoAvaliador(Candidatura candidatura, Long pessoaId) {
        Oportunidade oportunidade = buscarOportunidade(candidatura.getOportunidadeId());
        return !acesso.podeVer(pessoaId, candidatura.getOrganizacaoId())
                && !participanteRepository.existsById(new CandidaturaParticipanteId(candidatura.getId(), pessoaId))
                && !acesso.tem(pessoaId, oportunidade.getOrganizacaoId(), Permissao.CONDUZIR_SELECAO);
    }

    // ---------- apoio

    private void exigirTipoDaTrilha(String trilhaCodigo, String tipo) {
        if (!TiposPorTrilha.aceita(trilhaCodigo, tipo)) {
            throw erro(HttpStatus.BAD_REQUEST, "Nesta trilha, só " + TiposPorTrilha.quem(trilhaCodigo) + " se candidatam");
        }
    }

    private void mover(Candidatura candidatura, String para, Ator ator) {
        exigirNaoPausada(buscarOportunidade(candidatura.getOportunidadeId()));
        exigirTransicao(candidatura.getEstado(), para, ator);
        candidatura.mudarEstado(para);
    }

    private void exigirTransicao(String de, String para, Ator ator) {
        switch (MaquinaDeEstados.verificar(de, para, ator)) {
            case TRANSICAO_INVALIDA -> throw erro(HttpStatus.CONFLICT,
                    "A candidatura não pode ir de " + de + " para " + para);
            case ATOR_SEM_PERMISSAO -> throw erro(HttpStatus.FORBIDDEN,
                    "Quem é " + ator.name() + " não pode levar a candidatura de " + de + " para " + para);
            default -> { }
        }
    }

    // a oportunidade recebe candidaturas: publicada, não pausada, com versão publicada e no prazo
    private VersaoOportunidade exigirAberta(Oportunidade oportunidade) {
        if (!"PUBLICADA".equals(oportunidade.getEstado())) {
            throw erro(HttpStatus.CONFLICT, "Esta oportunidade não está recebendo candidaturas");
        }
        exigirNaoPausada(oportunidade);
        VersaoOportunidade versao = versaoRepository.findFirstByOportunidadeIdAndPublicadaEmIsNotNull(oportunidade.getId())
                .orElseThrow(() -> erro(HttpStatus.CONFLICT, "Esta oportunidade não está recebendo candidaturas"));
        if (versao.getPrazoEnvio().isBefore(LocalDate.now())) {
            throw erro(HttpStatus.CONFLICT, "O prazo de envio desta oportunidade já passou");
        }
        return versao;
    }

    private void exigirNaoPausada(Oportunidade oportunidade) {
        if (oportunidade.suspensa()) {
            throw erro(HttpStatus.CONFLICT, "Esta oportunidade está pausada: a permissão do provedor foi revogada");
        }
    }

    private void preencher(Candidatura candidatura, CandidaturaRequest dados) {
        if (dados.tituloProposta() != null) {
            String titulo = dados.tituloProposta().trim();
            if (titulo.length() > 200) {
                throw erro(HttpStatus.BAD_REQUEST, "O campo tituloProposta aceita no máximo 200 caracteres");
            }
            candidatura.setTituloProposta(titulo.isEmpty() ? null : titulo);
        }
        if (dados.resumoExecutivo() != null) {
            candidatura.setResumoExecutivo(dados.resumoExecutivo().isBlank() ? null : dados.resumoExecutivo().trim());
        }
        if (dados.valorSolicitado() != null) {
            if (dados.valorSolicitado().signum() < 0 || dados.valorSolicitado().compareTo(LIMITE_VALOR) > 0) {
                throw erro(HttpStatus.BAD_REQUEST, "O campo valorSolicitado não pode ser negativo");
            }
            candidatura.setValorSolicitado(dados.valorSolicitado().setScale(2, RoundingMode.HALF_UP));
        }
    }

    private String perfilCongelado(Organizacao o, OffsetDateTime quando) {
        Map<String, Object> perfil = new LinkedHashMap<>();
        perfil.put("organizacaoId", o.getId());
        perfil.put("nome", o.getNome());
        perfil.put("tipo", o.getTipo());
        perfil.put("cnpj", o.getCnpj());
        perfil.put("porte", o.getPorte());
        perfil.put("setor", o.getSetor());
        perfil.put("estagio", o.getEstagio());
        perfil.put("anoFundacao", o.getAnoFundacao());
        perfil.put("sedeCidade", o.getSedeCidade());
        perfil.put("sedeUf", o.getSedeUf());
        perfil.put("congeladoEm", quando.toString());
        return JSON.writeValueAsString(perfil);
    }

    // quem vê: a organização candidata e a gestão sempre; o provedor, depois do envio
    private Candidatura buscarVisivel(Long id, Long pessoaId) {
        Candidatura candidatura = candidaturaRepository.findById(id)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Candidatura não encontrada"));
        if (acesso.podeVer(pessoaId, candidatura.getOrganizacaoId())) {
            return candidatura;
        }
        // quem participa da candidatura (integrante da squad sem vínculo com a organização) também vê
        if (participanteRepository.existsById(new CandidaturaParticipanteId(candidatura.getId(), pessoaId))) {
            return candidatura;
        }
        Oportunidade oportunidade = buscarOportunidade(candidatura.getOportunidadeId());
        if (acesso.tem(pessoaId, oportunidade.getOrganizacaoId(), Permissao.CONDUZIR_SELECAO)
                && !FORA_DA_LISTA_DO_PROVEDOR.contains(candidatura.getEstado())) {
            return candidatura;
        }
        // o avaliador vê só as candidaturas que recebeu para avaliar
        if (avaliacaoRepository.contarDoAvaliador(candidatura.getId(), pessoaId) > 0) {
            return candidatura;
        }
        // o mentor convidado (para decidir) ou que aceitou acompanhar
        if (alocacaoRepository.contarDoMentor(candidatura.getId(), pessoaId, Set.of("PENDENTE", "ACEITA")) > 0) {
            return candidatura;
        }
        throw erro(HttpStatus.NOT_FOUND, "Candidatura não encontrada");
    }

    private Candidatura buscarComoProvedor(Long id, Long pessoaId) {
        Candidatura candidatura = candidaturaRepository.findById(id)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Candidatura não encontrada"));
        Oportunidade oportunidade = buscarOportunidade(candidatura.getOportunidadeId());
        if (FORA_DA_LISTA_DO_PROVEDOR.contains(candidatura.getEstado())
                && !acesso.podeVer(pessoaId, candidatura.getOrganizacaoId())) {
            throw erro(HttpStatus.NOT_FOUND, "Candidatura não encontrada");
        }
        acesso.exigir(pessoaId, oportunidade.getOrganizacaoId(), Permissao.CONDUZIR_SELECAO);
        return candidatura;
    }

    private Oportunidade buscarOportunidade(Long oportunidadeId) {
        return oportunidadeRepository.findById(oportunidadeId)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Oportunidade não encontrada"));
    }

    private ResponseStatusException erro(HttpStatus status, String mensagem) {
        return new ResponseStatusException(status, mensagem);
    }
}
