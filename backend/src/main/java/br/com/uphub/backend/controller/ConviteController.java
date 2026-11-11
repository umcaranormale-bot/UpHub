package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.ConviteCadastroRequest;
import br.com.uphub.backend.dto.ConviteResponse;
import br.com.uphub.backend.dto.ConviteCriadoResponse;
import br.com.uphub.backend.service.ConviteService;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/convites")
public class ConviteController {

    private final ConviteService conviteService;

    public ConviteController(ConviteService conviteService) {
        this.conviteService = conviteService;
    }

    @PostMapping
    public ResponseEntity<ConviteCriadoResponse> cadastrar(@RequestBody ConviteCadastroRequest dados) {
        ConviteCriadoResponse criado = conviteService.cadastrar(dados);
        return ResponseEntity
                .created(URI.create("/api/convites/" + criado.convite().id()))
                .body(criado);
    }

    @GetMapping
    public List<ConviteResponse> listar(
            @RequestParam(name = "organizacaoId", required = false) Long organizacaoId) {
        return conviteService.listarPorOrganizacao(organizacaoId);
    }
}