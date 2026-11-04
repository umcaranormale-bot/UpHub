package br.com.uphub.backend.service;

import br.com.uphub.backend.dto.SquadCadastroRequest;
import br.com.uphub.backend.dto.SquadResponse;
import br.com.uphub.backend.model.Organizacao;
import br.com.uphub.backend.model.Squad;
import br.com.uphub.backend.repository.OrganizacaoRepository;
import br.com.uphub.backend.repository.SquadRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SquadService {

    private final SquadRepository squadRepository;
    private final OrganizacaoRepository organizacaoRepository;

    public SquadService(SquadRepository squadRepository,
                        OrganizacaoRepository organizacaoRepository) {
        this.squadRepository = squadRepository;
        this.organizacaoRepository = organizacaoRepository;
    }

    @Transactional
    public SquadResponse cadastrar(SquadCadastroRequest dados) {
        if (dados.organizacaoId() == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo organizacaoId é obrigatório");
        }

        Organizacao organizacao = organizacaoRepository.findById(dados.organizacaoId())
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Organização não encontrada"));

        if (!"SQUAD".equals(organizacao.getTipo())) {
            throw erro(HttpStatus.BAD_REQUEST,
                    "Só uma organização do tipo SQUAD pode ser cadastrada como squad");
        }

        if (squadRepository.existsById(organizacao.getId())) {
            throw erro(HttpStatus.CONFLICT, "Esta organização já está cadastrada como squad");
        }

        Squad squad = new Squad(
                organizacao,
                opcional(dados.descricao(), "descricao", Integer.MAX_VALUE),
                opcional(dados.codigoCoordenacao(), "codigoCoordenacao", 40));

        return SquadResponse.de(squadRepository.save(squad));
    }

    @Transactional(readOnly = true)
    public List<SquadResponse> listar() {
        return squadRepository.listarTodas().stream()
                .map(SquadResponse::de)
                .toList();
    }

    @Transactional(readOnly = true)
    public SquadResponse buscarPorId(Long id) {
        return squadRepository.buscarComOrganizacao(id)
                .map(SquadResponse::de)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Squad não encontrada"));
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