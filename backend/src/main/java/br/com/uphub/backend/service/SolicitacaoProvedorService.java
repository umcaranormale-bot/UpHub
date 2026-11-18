package br.com.uphub.backend.service;

import br.com.uphub.backend.dto.DecisaoSolicitacaoRequest;
import br.com.uphub.backend.dto.SolicitacaoProvedorCadastroRequest;
import br.com.uphub.backend.dto.SolicitacaoProvedorResponse;
import br.com.uphub.backend.model.Documento;
import br.com.uphub.backend.model.Oportunidade;
import br.com.uphub.backend.model.Organizacao;
import br.com.uphub.backend.model.Pessoa;
import br.com.uphub.backend.model.SolicitacaoProvedor;
import br.com.uphub.backend.repository.DocumentoRepository;
import br.com.uphub.backend.repository.OportunidadeRepository;
import br.com.uphub.backend.repository.OrganizacaoRepository;
import br.com.uphub.backend.repository.PessoaRepository;
import br.com.uphub.backend.repository.SolicitacaoProvedorRepository;
import java.time.OffsetDateTime;
import java.util.List;
import br.com.uphub.backend.seguranca.Acesso;
import br.com.uphub.backend.seguranca.Permissao;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SolicitacaoProvedorService {

    private final SolicitacaoProvedorRepository solicitacaoRepository;
    private final OrganizacaoRepository organizacaoRepository;
    private final PessoaRepository pessoaRepository;
    private final DocumentoRepository documentoRepository;
    private final OportunidadeRepository oportunidadeRepository;
    private final Acesso acesso;

    public SolicitacaoProvedorService(SolicitacaoProvedorRepository solicitacaoRepository,
                                      OrganizacaoRepository organizacaoRepository,
                                      PessoaRepository pessoaRepository,
                                      DocumentoRepository documentoRepository,
                                      OportunidadeRepository oportunidadeRepository,
                                      Acesso acesso) {
        this.solicitacaoRepository = solicitacaoRepository;
        this.organizacaoRepository = organizacaoRepository;
        this.pessoaRepository = pessoaRepository;
        this.documentoRepository = documentoRepository;
        this.oportunidadeRepository = oportunidadeRepository;
        this.acesso = acesso;
    }

    @Transactional
    public SolicitacaoProvedorResponse cadastrar(SolicitacaoProvedorCadastroRequest dados, Long pessoaId) {
        if (dados.organizacaoId() == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo organizacaoId é obrigatório");
        }
        if (dados.emailInstitucional() == null || dados.emailInstitucional().isBlank()) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo emailInstitucional é obrigatório");
        }
        String email = dados.emailInstitucional().trim().toLowerCase();
        if (email.length() > 254) {
            throw erro(HttpStatus.BAD_REQUEST,
                    "O campo emailInstitucional aceita no máximo 254 caracteres");
        }

        Organizacao organizacao = organizacaoRepository.findById(dados.organizacaoId())
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Organização não encontrada"));
        acesso.exigir(pessoaId, organizacao.getId(), Permissao.PEDIR_PERMISSAO_DE_PROVEDOR);
        Pessoa solicitante = pessoaRepository.findById(pessoaId)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Pessoa não encontrada"));

        if (dados.documentoId() != null) {
            Documento documento = documentoRepository.findById(dados.documentoId())
                    .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Documento não encontrado"));
            if (!documento.getOrganizacao().getId().equals(organizacao.getId())) {
                throw erro(HttpStatus.BAD_REQUEST, "O documento não pertence a esta organização");
            }
        }

        if (solicitacaoRepository.existsByOrganizacao_IdAndSituacao(organizacao.getId(), "AGUARDANDO")) {
            throw erro(HttpStatus.CONFLICT,
                    "Esta organização já tem uma solicitação aguardando decisão");
        }
        if (solicitacaoRepository.existsByOrganizacao_IdAndSituacao(organizacao.getId(), "APROVADA")) {
            throw erro(HttpStatus.CONFLICT, "Esta organização já tem permissão para publicar");
        }

        SolicitacaoProvedor anterior = solicitacaoRepository
                .findFirstByOrganizacao_IdOrderByPedidaEmDesc(organizacao.getId())
                .orElse(null);

        Long anteriorId = null;
        String respostaRecusa = null;
        if (anterior != null) {
            if (!anterior.getId().equals(dados.solicitacaoAnteriorId())) {
                throw erro(HttpStatus.BAD_REQUEST,
                        "Informe em solicitacaoAnteriorId o pedido recusado ou revogado (id " + anterior.getId() + ")");
            }
            if (dados.respostaRecusa() == null || dados.respostaRecusa().isBlank()) {
                throw erro(HttpStatus.BAD_REQUEST, "O campo respostaRecusa é obrigatório no novo pedido");
            }
            if (anterior.isRecusaPorDocumento()
                    && (dados.documentoId() == null || dados.documentoId().equals(anterior.getDocumentoId()))) {
                throw erro(HttpStatus.BAD_REQUEST,
                        "O pedido anterior foi recusado pelo documento. Envie um documento diferente");
            }
            anteriorId = anterior.getId();
            respostaRecusa = dados.respostaRecusa().trim();
        } else if (dados.solicitacaoAnteriorId() != null) {
            throw erro(HttpStatus.BAD_REQUEST, "Esta organização não tem pedido recusado ou revogado para responder");
        }

        SolicitacaoProvedor solicitacao = new SolicitacaoProvedor(
                organizacao,
                solicitante,
                email,
                dados.documentoId(),
                anteriorId,
                respostaRecusa);

        return SolicitacaoProvedorResponse.de(solicitacaoRepository.save(solicitacao));
    }

    @Transactional(readOnly = true)
    public List<SolicitacaoProvedorResponse> listar(Long organizacaoId, String situacao, Long pessoaId) {
        // sem organização: a fila da gestão, com todas as organizações (filtrável pela situação)
        if (organizacaoId == null) {
            if (!acesso.ehGestao(pessoaId)) {
                throw erro(HttpStatus.BAD_REQUEST, "O parâmetro organizacaoId é obrigatório");
            }
            String filtro = null;
            if (situacao != null && !situacao.isBlank()) {
                filtro = situacao.trim().toUpperCase();
                if (!List.of("AGUARDANDO", "APROVADA", "RECUSADA", "REVOGADA").contains(filtro)) {
                    throw erro(HttpStatus.BAD_REQUEST, "Situação inválida. Use: AGUARDANDO, APROVADA, RECUSADA ou REVOGADA");
                }
            }
            return solicitacaoRepository.listarTodas(filtro)
                    .stream().map(SolicitacaoProvedorResponse::de).toList();
        }
        if (!organizacaoRepository.existsById(organizacaoId)) {
            throw erro(HttpStatus.NOT_FOUND, "Organização não encontrada");
        }
        acesso.exigirAcesso(pessoaId, organizacaoId);
        return solicitacaoRepository.listarPorOrganizacao(organizacaoId)
                .stream().map(SolicitacaoProvedorResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public SolicitacaoProvedorResponse buscarPorId(Long id, Long pessoaId) {
        SolicitacaoProvedor solicitacao = solicitacaoRepository.buscarPorId(id)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Solicitação não encontrada"));
        acesso.exigirAcesso(pessoaId, solicitacao.getOrganizacao().getId());
        return SolicitacaoProvedorResponse.de(solicitacao);
    }

    @Transactional
    public SolicitacaoProvedorResponse aprovar(Long id, Long pessoaId) {
        acesso.exigirGestao(pessoaId, "aprovar o pedido de provedor");
        SolicitacaoProvedor solicitacao = buscar(id);
        if (!solicitacao.aguardando()) {
            throw erro(HttpStatus.CONFLICT, "Só dá para decidir um pedido que está aguardando");
        }
        OffsetDateTime agora = OffsetDateTime.now();
        solicitacao.aprovar(gestao(pessoaId), agora);

        // aprovação depois de uma revogação: as oportunidades pausadas voltam a andar
        for (Oportunidade oportunidade : oportunidadeRepository
                .findByOrganizacaoIdAndSuspensaEmIsNotNull(solicitacao.getOrganizacao().getId())) {
            oportunidade.retomar();
        }
        return SolicitacaoProvedorResponse.de(solicitacao);
    }

    @Transactional
    public SolicitacaoProvedorResponse recusar(Long id, DecisaoSolicitacaoRequest dados, Long pessoaId) {
        acesso.exigirGestao(pessoaId, "recusar o pedido de provedor");
        String motivo = motivo(dados, "motivo");
        SolicitacaoProvedor solicitacao = buscar(id);
        if (!solicitacao.aguardando()) {
            throw erro(HttpStatus.CONFLICT, "Só dá para decidir um pedido que está aguardando");
        }
        boolean porDocumento = Boolean.TRUE.equals(dados.recusaPorDocumento());
        solicitacao.recusar(gestao(pessoaId), OffsetDateTime.now(), motivo, porDocumento);
        return SolicitacaoProvedorResponse.de(solicitacao);
    }

    @Transactional
    public SolicitacaoProvedorResponse revogar(Long id, DecisaoSolicitacaoRequest dados, Long pessoaId) {
        acesso.exigirGestao(pessoaId, "revogar a permissão de provedor");
        String motivo = motivo(dados, "motivo");
        SolicitacaoProvedor solicitacao = buscar(id);
        if (!solicitacao.aprovada()) {
            throw erro(HttpStatus.CONFLICT, "Só dá para revogar uma permissão aprovada");
        }
        OffsetDateTime agora = OffsetDateTime.now();
        solicitacao.revogar(gestao(pessoaId), agora, motivo);

        // as oportunidades publicadas da organização ficam pausadas até uma nova aprovação
        for (Oportunidade oportunidade : oportunidadeRepository.findByOrganizacaoIdAndEstadoIn(
                solicitacao.getOrganizacao().getId(), List.of("PUBLICADA", "EM_AVALIACAO"))) {
            oportunidade.suspender(agora);
        }
        return SolicitacaoProvedorResponse.de(solicitacao);
    }

    private SolicitacaoProvedor buscar(Long id) {
        return solicitacaoRepository.buscarPorId(id)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Solicitação não encontrada"));
    }

    private Pessoa gestao(Long pessoaId) {
        return pessoaRepository.findById(pessoaId)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Pessoa não encontrada"));
    }

    private String motivo(DecisaoSolicitacaoRequest dados, String campo) {
        if (dados == null || dados.motivo() == null || dados.motivo().isBlank()) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo " + campo + " é obrigatório");
        }
        return dados.motivo().trim();
    }

    private ResponseStatusException erro(HttpStatus status, String mensagem) {
        return new ResponseStatusException(status, mensagem);
    }
}