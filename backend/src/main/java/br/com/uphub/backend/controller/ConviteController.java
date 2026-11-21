package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.AceiteConviteRequest;
import br.com.uphub.backend.dto.ConviteCadastroRequest;
import br.com.uphub.backend.dto.ConviteResponse;
import br.com.uphub.backend.dto.ConviteValidacaoResponse;
import br.com.uphub.backend.dto.LoginResponse;
import br.com.uphub.backend.dto.RecusaConviteRequest;
import br.com.uphub.backend.seguranca.PessoaLogada;
import br.com.uphub.backend.seguranca.Publico;
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
    public ResponseEntity<ConviteResponse> cadastrar(@RequestBody ConviteCadastroRequest dados,
                                                     @PessoaLogada Long pessoaId) {
        ConviteResponse criado = conviteService.cadastrar(dados, pessoaId);
        return ResponseEntity
                .created(URI.create("/api/convites/" + criado.id()))
                .body(criado);
    }

    @GetMapping
    public List<ConviteResponse> listar(
            @RequestParam(name = "organizacaoId", required = false) Long organizacaoId,
            @PessoaLogada Long pessoaId) {
        return conviteService.listarPorOrganizacao(organizacaoId, pessoaId);
    }

    @Publico
    @GetMapping("/validar")
    public ConviteValidacaoResponse validar(
            @RequestParam(name = "codigo", required = false) String codigo) {
        return conviteService.validar(codigo);
    }

    @Publico
    @PostMapping("/aceitar")
    public LoginResponse aceitar(@RequestBody AceiteConviteRequest dados) {
        return conviteService.aceitar(dados);
    }

    @Publico
    @PostMapping("/recusar")
    public ResponseEntity<Void> recusar(@RequestBody RecusaConviteRequest dados) {
        conviteService.recusar(dados);
        return ResponseEntity.noContent().build();
    }
}