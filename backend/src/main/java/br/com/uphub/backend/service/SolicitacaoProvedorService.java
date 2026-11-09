package br.com.uphub.backend.service;

import br.com.uphub.backend.dto.SolicitacaoProvedorCadastroRequest;
import br.com.uphub.backend.dto.SolicitacaoProvedorResponse;
import br.com.uphub.backend.model.Organizacao;
import br.com.uphub.backend.model.Pessoa;
import br.com.uphub.backend.model.SolicitacaoProvedor;
import br.com.uphub.backend.repository.OrganizacaoRepository;
import br.com.uphub.backend.repository.PessoaRepository;
import br.com.uphub.backend.repository.SolicitacaoProvedorRepository;
import br.com.uphub.backend.repository.VinculoRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SolicitacaoProvedorService {

    private final SolicitacaoProvedorRepository solicitacaoRepository;
    private final OrganizacaoRepository organizacaoRepository;
    private final PessoaRepository pessoaRepository;
    private final VinculoRepository vinculoRepository;

    public SolicitacaoProvedorService(SolicitacaoProvedorRepository solicitacaoRepository,
                                      OrganizacaoRepository organizacaoRepository,
                                      PessoaRepository pessoaRepository,
                                      VinculoRepository vinculoRepository) {
        this.solicitacaoRepository = solicitacaoRepository;
        this.organizacaoRepository = organizacaoRepository;
        this.pessoaRepository = pessoaRepository;
        this.vinculoRepository = vinculoRepository;
    }

    @Transactional
    public SolicitacaoProvedorResponse cadastrar(SolicitacaoProvedorCadastroRequest dados) {
        if (dados.organizacaoId() == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo organizacaoId é obrigatório");
        }
        if (dados.solicitanteId() == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo solicitanteId é obrigatório");
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
        Pessoa solicitante = pessoaRepository.findById(dados.solicitanteId())
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Pessoa não encontrada"));

        if (!vinculoRepository.existsByPessoa_IdAndOrganizacao_Id(solicitante.getId(), organizacao.getId())) {
            throw erro(HttpStatus.FORBIDDEN, "Esta pessoa não tem vínculo com esta organização");
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
                        "Informe em solicitacaoAnteriorId o pedido recusado (id " + anterior.getId() + ")");
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
            throw erro(HttpStatus.BAD_REQUEST, "Esta organização não tem pedido recusado para responder");
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
    public List<SolicitacaoProvedorResponse> listar(Long organizacaoId) {
        if (organizacaoId == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O parâmetro organizacaoId é obrigatório");
        }
        if (!organizacaoRepository.existsById(organizacaoId)) {
            throw erro(HttpStatus.NOT_FOUND, "Organização não encontrada");
        }
        return solicitacaoRepository.listarPorOrganizacao(organizacaoId)
                .stream().map(SolicitacaoProvedorResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public SolicitacaoProvedorResponse buscarPorId(Long id) {
        return solicitacaoRepository.buscarPorId(id)
                .map(SolicitacaoProvedorResponse::de)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Solicitação não encontrada"));
    }

    private ResponseStatusException erro(HttpStatus status, String mensagem) {
        return new ResponseStatusException(status, mensagem);
    }
}