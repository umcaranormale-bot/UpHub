package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.SquadCadastroRequest;
import br.com.uphub.backend.dto.SquadResponse;
import br.com.uphub.backend.seguranca.PessoaLogada;
import br.com.uphub.backend.service.SquadService;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/squads")
public class SquadController {

    private final SquadService squadService;

    public SquadController(SquadService squadService) {
        this.squadService = squadService;
    }

    @PostMapping
    public ResponseEntity<SquadResponse> cadastrar(@RequestBody SquadCadastroRequest dados,
                                                   @PessoaLogada Long pessoaId) {
        SquadResponse criada = squadService.cadastrar(dados, pessoaId);
        return ResponseEntity
                .created(URI.create("/api/squads/" + criada.organizacaoId()))
                .body(criada);
    }

    @GetMapping
    public List<SquadResponse> listar(@PessoaLogada Long pessoaId) {
        return squadService.listar(pessoaId);
    }

    @GetMapping("/{id}")
    public SquadResponse buscar(@PathVariable("id") Long id, @PessoaLogada Long pessoaId) {
        return squadService.buscarPorId(id, pessoaId);
    }
}