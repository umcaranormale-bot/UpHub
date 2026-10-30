package br.com.uphub.backend.controller;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.uphub.backend.dto.PessoaCadastroRequest;
import br.com.uphub.backend.dto.PessoaResponse;
import br.com.uphub.backend.service.PessoaService;

@RestController
@RequestMapping("/api/pessoas")
public class PessoaController {

    private final PessoaService pessoaService;

    public PessoaController(PessoaService pessoaService) {
        this.pessoaService = pessoaService;
    }

    @PostMapping
    public ResponseEntity<PessoaResponse> cadastrar(@RequestBody PessoaCadastroRequest dados) {
        PessoaResponse criada = pessoaService.cadastrar(dados);
        return ResponseEntity
                .created(URI.create("/api/pessoas/" + criada.id()))
                .body(criada);
    }

    @GetMapping("/{id}")
    public PessoaResponse buscar(@PathVariable Long id) {
        return pessoaService.buscarPorId(id);
    }
}