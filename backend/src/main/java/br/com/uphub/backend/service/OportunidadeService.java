package br.com.uphub.backend.service;

import br.com.uphub.backend.dto.OportunidadeCadastroRequest;
import br.com.uphub.backend.dto.OportunidadeResponse;
import br.com.uphub.backend.model.Oportunidade;
import br.com.uphub.backend.repository.OportunidadeRepository;
import br.com.uphub.backend.repository.OrganizacaoRepository;
import br.com.uphub.backend.repository.PessoaRepository;
import br.com.uphub.backend.repository.TrilhaRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class OportunidadeService {

    private final OportunidadeRepository oportunidadeRepository;
    private final OrganizacaoRepository organizacaoRepository;
    private final PessoaRepository pessoaRepository;
    private final TrilhaRepository trilhaRepository;

    public OportunidadeService(OportunidadeRepository oportunidadeRepository,
                               OrganizacaoRepository organizacaoRepository,
                               PessoaRepository pessoaRepository,
                               TrilhaRepository trilhaRepository) {
        this.oportunidadeRepository = oportunidadeRepository;
        this.organizacaoRepository = organizacaoRepository;
        this.pessoaRepository = pessoaRepository;
        this.trilhaRepository = trilhaRepository;
    }

    @Transactional
    public OportunidadeResponse cadastrar(OportunidadeCadastroRequest dados) {
        String titulo = obrigatorio(dados.titulo(), "titulo", 200);
        String trilhaCodigo = obrigatorio(dados.trilhaCodigo(), "trilhaCodigo", 20);
        if (!trilhaRepository.existsById(trilhaCodigo)) {
            throw erro(HttpStatus.NOT_FOUND, "Trilha não encontrada");
        }

        Long organizacaoId = dados.organizacaoId();
        if (organizacaoId == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo organizacaoId é obrigatório");
        }
        if (!organizacaoRepository.existsById(organizacaoId)) {
            throw erro(HttpStatus.NOT_FOUND, "Organização não encontrada");
        }

        Long criadaPor = dados.criadaPor();
        if (criadaPor == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo criadaPor é obrigatório");
        }
        if (!pessoaRepository.existsById(criadaPor)) {
            throw erro(HttpStatus.NOT_FOUND, "Pessoa que está criando não encontrada");
        }

        String resumo = (dados.resumo() == null || dados.resumo().isBlank())
                ? null
                : dados.resumo().trim();

        Oportunidade oportunidade = new Oportunidade();
        oportunidade.setOrganizacaoId(organizacaoId);
        oportunidade.setTrilhaCodigo(trilhaCodigo);
        oportunidade.setTitulo(titulo);
        oportunidade.setResumo(resumo);
        oportunidade.setCriadaPor(criadaPor);

        return OportunidadeResponse.de(oportunidadeRepository.save(oportunidade));
    }

    @Transactional(readOnly = true)
    public List<OportunidadeResponse> listarPorOrganizacao(Long organizacaoId) {
        return oportunidadeRepository.findByOrganizacaoId(organizacaoId).stream()
                .map(OportunidadeResponse::de)
                .toList();
    }

    @Transactional(readOnly = true)
    public OportunidadeResponse buscarPorId(Long id) {
        return oportunidadeRepository.findById(id)
                .map(OportunidadeResponse::de)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Oportunidade não encontrada"));
    }

    private String obrigatorio(String valor, String campo, int maximo) {
        if (valor == null || valor.isBlank()) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo " + campo + " é obrigatório");
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