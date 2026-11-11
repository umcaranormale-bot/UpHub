package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.OportunidadeCadastroRequest;
import br.com.uphub.backend.dto.OportunidadeResponse;
import br.com.uphub.backend.service.OportunidadeService;
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
@RequestMapping("/api/oportunidades")
public class OportunidadeController {

    private final OportunidadeService oportunidadeService;

    public OportunidadeController(OportunidadeService oportunidadeService) {
        this.oportunidadeService = oportunidadeService;
    }

    @PostMapping
    public ResponseEntity<OportunidadeResponse> cadastrar(@RequestBody OportunidadeCadastroRequest dados) {
        OportunidadeResponse criada = oportunidadeService.cadastrar(dados);
        return ResponseEntity
                .created(URI.create("/api/oportunidades/" + criada.id()))
                .body(criada);
    }

    @GetMapping
    public List<OportunidadeResponse> listar(
            @RequestParam(name = "organizacaoId", required = false) Long organizacaoId) {
        return oportunidadeService.listarPorOrganizacao(organizacaoId);
    }

    @GetMapping("/{id}")
    public OportunidadeResponse buscar(@PathVariable("id") Long id) {
        return oportunidadeService.buscarPorId(id);
    }
}