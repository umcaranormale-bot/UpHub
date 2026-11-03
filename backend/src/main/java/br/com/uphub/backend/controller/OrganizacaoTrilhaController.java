package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.OrganizacaoTrilhaCadastroRequest;
import br.com.uphub.backend.dto.OrganizacaoTrilhaResponse;
import br.com.uphub.backend.service.OrganizacaoTrilhaService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/organizacao-trilhas")
public class OrganizacaoTrilhaController {

    private final OrganizacaoTrilhaService organizacaoTrilhaService;

    public OrganizacaoTrilhaController(OrganizacaoTrilhaService organizacaoTrilhaService) {
        this.organizacaoTrilhaService = organizacaoTrilhaService;
    }

    @PostMapping
    public ResponseEntity<OrganizacaoTrilhaResponse> cadastrar(@RequestBody OrganizacaoTrilhaCadastroRequest dados) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(organizacaoTrilhaService.cadastrar(dados));
    }

    @GetMapping
    public List<OrganizacaoTrilhaResponse> listar() {
        return organizacaoTrilhaService.listar();
    }
}
