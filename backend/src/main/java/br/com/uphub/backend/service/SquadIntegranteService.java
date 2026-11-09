package br.com.uphub.backend.service;

import br.com.uphub.backend.dto.SquadIntegranteCadastroRequest;
import br.com.uphub.backend.dto.SquadIntegranteResponse;
import br.com.uphub.backend.model.Pessoa;
import br.com.uphub.backend.model.Squad;
import br.com.uphub.backend.model.SquadIntegrante;
import br.com.uphub.backend.model.SquadIntegranteId;
import br.com.uphub.backend.repository.PessoaRepository;
import br.com.uphub.backend.repository.SquadIntegranteRepository;
import br.com.uphub.backend.repository.SquadRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SquadIntegranteService {

    private final SquadIntegranteRepository squadIntegranteRepository;
    private final SquadRepository squadRepository;
    private final PessoaRepository pessoaRepository;

    public SquadIntegranteService(SquadIntegranteRepository squadIntegranteRepository,
                                  SquadRepository squadRepository,
                                  PessoaRepository pessoaRepository) {
        this.squadIntegranteRepository = squadIntegranteRepository;
        this.squadRepository = squadRepository;
        this.pessoaRepository = pessoaRepository;
    }

    @Transactional
    public SquadIntegranteResponse adicionar(Long squadId, SquadIntegranteCadastroRequest dados) {
        Squad squad = squadRepository.findById(squadId)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Squad não encontrada"));

        if (dados.pessoaId() == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo pessoaId é obrigatório");
        }

        Pessoa pessoa = pessoaRepository.findById(dados.pessoaId())
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Pessoa não encontrada"));

        if (squadIntegranteRepository.existsById(new SquadIntegranteId(squadId, pessoa.getId()))) {
            throw erro(HttpStatus.CONFLICT, "Esta pessoa já faz parte desta squad");
        }

        SquadIntegrante integrante = new SquadIntegrante(
                squad, pessoa, opcional(dados.competencia(), "competencia", 120));

        return SquadIntegranteResponse.de(squadIntegranteRepository.save(integrante));
    }

    @Transactional(readOnly = true)
    public List<SquadIntegranteResponse> listar(Long squadId) {
        if (!squadRepository.existsById(squadId)) {
            throw erro(HttpStatus.NOT_FOUND, "Squad não encontrada");
        }
        return squadIntegranteRepository.listarPorSquad(squadId).stream()
                .map(SquadIntegranteResponse::de)
                .toList();
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