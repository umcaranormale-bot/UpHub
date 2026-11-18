package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.DecisaoSolicitacaoRequest;
import br.com.uphub.backend.dto.SolicitacaoProvedorCadastroRequest;
import br.com.uphub.backend.dto.SolicitacaoProvedorResponse;
import br.com.uphub.backend.seguranca.PessoaLogada;
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
            @RequestBody SolicitacaoProvedorCadastroRequest dados,
            @PessoaLogada Long pessoaId) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(solicitacaoService.cadastrar(dados, pessoaId));
    }

    @GetMapping
    public List<SolicitacaoProvedorResponse> listar(
            @RequestParam(name = "organizacaoId", required = false) Long organizacaoId,
            @RequestParam(name = "situacao", required = false) String situacao,
            @PessoaLogada Long pessoaId) {
        return solicitacaoService.listar(organizacaoId, situacao, pessoaId);
    }

    @GetMapping("/{id}")
    public SolicitacaoProvedorResponse buscar(@PathVariable Long id, @PessoaLogada Long pessoaId) {
        return solicitacaoService.buscarPorId(id, pessoaId);
    }

    @PostMapping("/{id}/aprovar")
    public SolicitacaoProvedorResponse aprovar(@PathVariable Long id, @PessoaLogada Long pessoaId) {
        return solicitacaoService.aprovar(id, pessoaId);
    }

    @PostMapping("/{id}/recusar")
    public SolicitacaoProvedorResponse recusar(@PathVariable Long id,
                                               @RequestBody DecisaoSolicitacaoRequest dados,
                                               @PessoaLogada Long pessoaId) {
        return solicitacaoService.recusar(id, dados, pessoaId);
    }

    @PostMapping("/{id}/revogar")
    public SolicitacaoProvedorResponse revogar(@PathVariable Long id,
                                               @RequestBody DecisaoSolicitacaoRequest dados,
                                               @PessoaLogada Long pessoaId) {
        return solicitacaoService.revogar(id, dados, pessoaId);
    }
}
