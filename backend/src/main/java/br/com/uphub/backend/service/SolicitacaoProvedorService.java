package br.com.uphub.backend.service;

import br.com.uphub.backend.dto.SolicitacaoProvedorCadastroRequest;
import br.com.uphub.backend.dto.SolicitacaoProvedorResponse;
import br.com.uphub.backend.model.Organizacao;
import br.com.uphub.backend.model.Pessoa;
import br.com.uphub.backend.model.SolicitacaoProvedor;
import br.com.uphub.backend.repository.OrganizacaoRepository;
import br.com.uphub.backend.repository.PessoaRepository;
import br.com.uphub.backend.repository.SolicitacaoProvedorRepository;
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

    public SolicitacaoProvedorService(SolicitacaoProvedorRepository solicitacaoRepository,
                                      OrganizacaoRepository organizacaoRepository,
                                      PessoaRepository pessoaRepository) {
        this.solicitacaoRepository = solicitacaoRepository;
        this.organizacaoRepository = organizacaoRepository;
        this.pessoaRepository = pessoaRepository;
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
        String email = dados.emailInstitucional().trim();
        if (email.length() > 254) {
            throw erro(HttpStatus.BAD_REQUEST,
                    "O campo emailInstitucional aceita no máximo 254 caracteres");
        }

        Organizacao organizacao = organizacaoRepository.findById(dados.organizacaoId())
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Organização não encontrada"));
        Pessoa solicitante = pessoaRepository.findById(dados.solicitanteId())
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Pessoa não encontrada"));

        if (solicitacaoRepository.existsByOrganizacao_IdAndSituacao(organizacao.getId(), "AGUARDANDO")) {
            throw erro(HttpStatus.CONFLICT,
                    "Esta organização já tem uma solicitação aguardando decisão");
        }

        SolicitacaoProvedor solicitacao = new SolicitacaoProvedor(
                organizacao,
                solicitante,
                email,
                dados.documentoId());

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