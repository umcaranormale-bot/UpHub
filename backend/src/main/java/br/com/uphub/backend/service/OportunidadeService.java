package br.com.uphub.backend.service;

import br.com.uphub.backend.dto.OportunidadeCadastroRequest;
import br.com.uphub.backend.dto.OportunidadeResponse;
import br.com.uphub.backend.model.Oportunidade;
import br.com.uphub.backend.model.OrganizacaoTrilhaId;
import br.com.uphub.backend.repository.OportunidadeRepository;
import br.com.uphub.backend.repository.OrganizacaoRepository;
import br.com.uphub.backend.repository.OrganizacaoTrilhaRepository;
import br.com.uphub.backend.repository.PessoaRepository;
import br.com.uphub.backend.repository.TrilhaRepository;
import br.com.uphub.backend.repository.VinculoRepository;
import java.util.List;
import java.util.Locale;
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
    private final VinculoRepository vinculoRepository;
    private final OrganizacaoTrilhaRepository organizacaoTrilhaRepository;

    public OportunidadeService(OportunidadeRepository oportunidadeRepository,
                               OrganizacaoRepository organizacaoRepository,
                               PessoaRepository pessoaRepository,
                               TrilhaRepository trilhaRepository,
                               VinculoRepository vinculoRepository,
                               OrganizacaoTrilhaRepository organizacaoTrilhaRepository) {
        this.oportunidadeRepository = oportunidadeRepository;
        this.organizacaoRepository = organizacaoRepository;
        this.pessoaRepository = pessoaRepository;
        this.trilhaRepository = trilhaRepository;
        this.vinculoRepository = vinculoRepository;
        this.organizacaoTrilhaRepository = organizacaoTrilhaRepository;
    }

    @Transactional
    public OportunidadeResponse cadastrar(OportunidadeCadastroRequest dados) {
        // 1. campos obrigatórios (400)
        String titulo = obrigatorio(dados.titulo(), "titulo", 200);
        String trilhaCodigo = obrigatorio(dados.trilhaCodigo(), "trilhaCodigo", 20).toUpperCase(Locale.ROOT);
        Long organizacaoId = dados.organizacaoId();
        if (organizacaoId == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo organizacaoId é obrigatório");
        }
        Long criadaPor = dados.criadaPor();
        if (criadaPor == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo criadaPor é obrigatório");
        }
        String resumo = (dados.resumo() == null || dados.resumo().isBlank())
                ? null
                : dados.resumo().trim();

        // 2. o que precisa existir (404)
        if (!trilhaRepository.existsById(trilhaCodigo)) {
            throw erro(HttpStatus.NOT_FOUND, "Trilha não encontrada");
        }
        if (!organizacaoRepository.existsById(organizacaoId)) {
            throw erro(HttpStatus.NOT_FOUND, "Organização não encontrada");
        }
        if (!pessoaRepository.existsById(criadaPor)) {
            throw erro(HttpStatus.NOT_FOUND, "Pessoa que está criando não encontrada");
        }

        // 3. permissão (403)
        if (!vinculoRepository.existsByPessoa_IdAndOrganizacao_IdAndPapel(criadaPor, organizacaoId, "PROVEDOR")) {
            throw erro(HttpStatus.FORBIDDEN, "Só o provedor da organização pode criar oportunidades");
        }
        if (!organizacaoTrilhaRepository.existsById(new OrganizacaoTrilhaId(organizacaoId, trilhaCodigo))) {
            throw erro(HttpStatus.FORBIDDEN, "Esta organização não atua na trilha " + trilhaCodigo);
        }

        Oportunidade oportunidade = new Oportunidade(organizacaoId, trilhaCodigo, titulo, resumo, criadaPor);

        return OportunidadeResponse.de(oportunidadeRepository.save(oportunidade));
    }

    @Transactional(readOnly = true)
    public List<OportunidadeResponse> listarPorOrganizacao(Long organizacaoId) {
        if (organizacaoId == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O parâmetro organizacaoId é obrigatório");
        }
        if (!organizacaoRepository.existsById(organizacaoId)) {
            throw erro(HttpStatus.NOT_FOUND, "Organização não encontrada");
        }
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