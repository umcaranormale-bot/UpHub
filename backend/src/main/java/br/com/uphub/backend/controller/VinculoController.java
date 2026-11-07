package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.VinculoCadastroRequest;
import br.com.uphub.backend.dto.VinculoResponse;
import br.com.uphub.backend.service.VinculoService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/vinculos")
public class VinculoController {

    private final VinculoService vinculoService;

    public VinculoController(VinculoService vinculoService) {
        this.vinculoService = vinculoService;
    }

    @PostMapping
    public ResponseEntity<VinculoResponse> cadastrar(@RequestBody VinculoCadastroRequest dados) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(vinculoService.cadastrar(dados));
    }

    @GetMapping
    public List<VinculoResponse> listar(
            @RequestParam(name = "pessoaId", required = false) Long pessoaId,
            @RequestParam(name = "organizacaoId", required = false) Long organizacaoId) {
        return vinculoService.listar(pessoaId, organizacaoId);
    }
}