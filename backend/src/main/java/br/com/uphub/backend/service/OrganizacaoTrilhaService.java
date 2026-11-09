package br.com.uphub.backend.service;

import br.com.uphub.backend.model.Organizacao;
import br.com.uphub.backend.model.Trilha;
import br.com.uphub.backend.dto.OrganizacaoTrilhaCadastroRequest;
import br.com.uphub.backend.dto.OrganizacaoTrilhaResponse;
import br.com.uphub.backend.model.OrganizacaoTrilha;
import br.com.uphub.backend.model.OrganizacaoTrilhaId;
import br.com.uphub.backend.repository.OrganizacaoTrilhaRepository;
import br.com.uphub.backend.repository.OrganizacaoRepository;
import br.com.uphub.backend.repository.TrilhaRepository;
import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class OrganizacaoTrilhaService {

    private final OrganizacaoTrilhaRepository organizacaoTrilhaRepository;
    private final OrganizacaoRepository organizacaoRepository;
    private final TrilhaRepository trilhaRepository;

    public OrganizacaoTrilhaService(OrganizacaoTrilhaRepository organizacaoTrilhaRepository,
                                    OrganizacaoRepository organizacaoRepository,
                                    TrilhaRepository trilhaRepository) {
        this.organizacaoTrilhaRepository = organizacaoTrilhaRepository;
        this.organizacaoRepository = organizacaoRepository;
        this.trilhaRepository = trilhaRepository;
    }

    @Transactional
    public OrganizacaoTrilhaResponse cadastrar(OrganizacaoTrilhaCadastroRequest dados) {
        if (dados.organizacaoId() == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo organizacaoId é obrigatório");
        }
        String trilhaCodigo = obrigatorio(dados.trilhaCodigo(), "trilhaCodigo", 20)
                .toUpperCase(Locale.ROOT);

        Organizacao organizacao = organizacaoRepository.findById(dados.organizacaoId())
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Organização não encontrada"));
        Trilha trilha = trilhaRepository.findById(trilhaCodigo)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Trilha não encontrada"));

        if (organizacaoTrilhaRepository.existsById(new OrganizacaoTrilhaId(organizacao.getId(), trilha.getCodigo()))) {
            throw erro(HttpStatus.CONFLICT, "Esta organização já está associada a esta trilha");
        }

        return OrganizacaoTrilhaResponse.de(
                organizacaoTrilhaRepository.save(new OrganizacaoTrilha(organizacao, trilha)));
    }

    @Transactional(readOnly = true)
    public List<OrganizacaoTrilhaResponse> listar() {
        return organizacaoTrilhaRepository.listarTodas().stream()
                .map(OrganizacaoTrilhaResponse::de)
                .toList();
    }

    private String obrigatorio(String valor, String campo, int maximo) {
        if (valor == null || valor.isBlank()) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo " + campo + " é obrigatório");
        }
        return limite(valor.trim(), campo, maximo);
    }

    private String limite(String valor, String campo, int maximo) {
        if (valor.length() > maximo) {
            throw erro(HttpStatus.BAD_REQUEST,
                    "O campo " + campo + " aceita no máximo " + maximo + " caracteres");
        }
        return valor;
    }

    private ResponseStatusException erro(HttpStatus status, String mensagem) {
        return new ResponseStatusException(status, mensagem);
    }
}
