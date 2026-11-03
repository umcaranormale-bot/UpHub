package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.OrganizacaoCadastroRequest;
import br.com.uphub.backend.dto.OrganizacaoResponse;
import br.com.uphub.backend.service.OrganizacaoService;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/organizacoes")
public class OrganizacaoController {

    private final OrganizacaoService organizacaoService;

    public OrganizacaoController(OrganizacaoService organizacaoService) {
        this.organizacaoService = organizacaoService;
    }

    @PostMapping
    public ResponseEntity<OrganizacaoResponse> cadastrar(@RequestBody OrganizacaoCadastroRequest dados) {
        OrganizacaoResponse criada = organizacaoService.cadastrar(dados);
        return ResponseEntity
                .created(URI.create("/api/organizacoes/" + criada.id()))
                .body(criada);
    }

    @GetMapping
    public List<OrganizacaoResponse> listar(@RequestParam(name = "nome", required = false) String nome) {
        return organizacaoService.listar(nome);
    }

    @GetMapping("/{id}")
    public OrganizacaoResponse buscar(@PathVariable("id") Long id) {
        return organizacaoService.buscarPorId(id);
    }
}