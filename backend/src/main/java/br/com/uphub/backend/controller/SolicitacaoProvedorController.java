package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.SolicitacaoProvedorCadastroRequest;
import br.com.uphub.backend.dto.SolicitacaoProvedorResponse;
import br.com.uphub.backend.service.SolicitacaoProvedorService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/solicitacoes-provedor")
public class SolicitacaoProvedorController {

    private final SolicitacaoProvedorService solicitacaoService;

    public SolicitacaoProvedorController(SolicitacaoProvedorService solicitacaoService) {
        this.solicitacaoService = solicitacaoService;
    }

    @PostMapping
    public ResponseEntity<SolicitacaoProvedorResponse> cadastrar(
            @RequestBody SolicitacaoProvedorCadastroRequest dados) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(solicitacaoService.cadastrar(dados));
    }

    @GetMapping
    public List<SolicitacaoProvedorResponse> listar(
            @RequestParam(name = "organizacaoId", required = false) Long organizacaoId) {
        return solicitacaoService.listar(organizacaoId);
    }

    @GetMapping("/{id}")
    public SolicitacaoProvedorResponse buscar(@PathVariable Long id) {
        return solicitacaoService.buscarPorId(id);
    }
}