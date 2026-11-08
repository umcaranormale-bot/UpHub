package br.com.uphub.backend.service;

import br.com.uphub.backend.dto.DocumentoCadastroRequest;
import br.com.uphub.backend.dto.DocumentoResponse;
import br.com.uphub.backend.model.Documento;
import br.com.uphub.backend.model.Organizacao;
import br.com.uphub.backend.model.Pessoa;
import br.com.uphub.backend.repository.DocumentoRepository;
import br.com.uphub.backend.repository.OrganizacaoRepository;
import br.com.uphub.backend.repository.PessoaRepository;
import br.com.uphub.backend.repository.VinculoRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class DocumentoService {

    private final DocumentoRepository documentoRepository;
    private final OrganizacaoRepository organizacaoRepository;
    private final PessoaRepository pessoaRepository;
    private final VinculoRepository vinculoRepository;

    public DocumentoService(DocumentoRepository documentoRepository,
                            OrganizacaoRepository organizacaoRepository,
                            PessoaRepository pessoaRepository,
                            VinculoRepository vinculoRepository) {
        this.documentoRepository = documentoRepository;
        this.organizacaoRepository = organizacaoRepository;
        this.pessoaRepository = pessoaRepository;
        this.vinculoRepository = vinculoRepository;
    }

    @Transactional
    public DocumentoResponse cadastrar(DocumentoCadastroRequest dados) {
        if (dados.organizacaoId() == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo organizacaoId é obrigatório");
        }
        if (dados.enviadoPor() == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo enviadoPor é obrigatório");
        }
        String tipo = obrigatorio(dados.tipo(), "tipo", 60);
        String nomeArquivo = obrigatorio(dados.nomeArquivo(), "nomeArquivo", 255);
        if (dados.tamanhoBytes() == null || dados.tamanhoBytes() <= 0) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo tamanhoBytes é obrigatório e deve ser maior que zero");
        }
        if (dados.armazenamentoRef() == null || dados.armazenamentoRef().isBlank()) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo armazenamentoRef é obrigatório");
        }

        Organizacao organizacao = organizacaoRepository.findById(dados.organizacaoId())
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Organização não encontrada"));
        Pessoa enviadoPor = pessoaRepository.findById(dados.enviadoPor())
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Pessoa não encontrada"));

        if (!vinculoRepository.existsByPessoa_IdAndOrganizacao_Id(enviadoPor.getId(), organizacao.getId())) {
            throw erro(HttpStatus.FORBIDDEN, "Esta pessoa não tem vínculo com esta organização");
        }

        Documento documento = new Documento(
                organizacao,
                enviadoPor,
                tipo,
                nomeArquivo,
                dados.tamanhoBytes(),
                opcional(dados.tipoMime(), "tipoMime", 100),
                dados.armazenamentoRef().trim(),
                dados.validade(),
                dados.textoPesquisavel());

        return DocumentoResponse.de(documentoRepository.save(documento));
    }

    @Transactional(readOnly = true)
    public List<DocumentoResponse> listar(Long organizacaoId) {
        if (organizacaoId == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O parâmetro organizacaoId é obrigatório");
        }
        if (!organizacaoRepository.existsById(organizacaoId)) {
            throw erro(HttpStatus.NOT_FOUND, "Organização não encontrada");
        }
        return documentoRepository.listarPorOrganizacao(organizacaoId)
                .stream().map(DocumentoResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public DocumentoResponse buscarPorId(Long id) {
        return documentoRepository.buscarPorId(id)
                .map(DocumentoResponse::de)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Documento não encontrado"));
    }

    private String obrigatorio(String valor, String campo, int maximo) {
        if (valor == null || valor.isBlank()) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo " + campo + " é obrigatório");
        }
        return opcional(valor, campo, maximo);
    }

    private String opcional(String valor, String campo, int maximo) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        String limpo = valor.trim();
        if (limpo.length() > maximo) {
            throw erro(HttpStatus.BAD_REQUEST,
                    "O campo " + campo + " aceita no máximo " + maximo + " caracteres");
        }
        return limpo;
    }

    private ResponseStatusException erro(HttpStatus status, String mensagem) {
        return new ResponseStatusException(status, mensagem);
    }
}