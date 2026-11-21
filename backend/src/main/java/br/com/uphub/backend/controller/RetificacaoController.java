package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.RetificacaoRequest;
import br.com.uphub.backend.dto.RetificacaoResponse;
import br.com.uphub.backend.seguranca.PessoaLogada;
import br.com.uphub.backend.service.RetificacaoService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/avaliacoes/{avaliacaoId}/retificacoes")
public class RetificacaoController {

    private final RetificacaoService retificacaoService;

    public RetificacaoController(RetificacaoService retificacaoService) {
        this.retificacaoService = retificacaoService;
    }

    @PostMapping
    public ResponseEntity<RetificacaoResponse> retificar(@PathVariable("avaliacaoId") Long avaliacaoId,
                                                         @RequestBody RetificacaoRequest dados,
                                                         @PessoaLogada Long pessoaId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(retificacaoService.retificar(avaliacaoId, dados, pessoaId));
    }

    @GetMapping
    public List<RetificacaoResponse> listar(@PathVariable("avaliacaoId") Long avaliacaoId, @PessoaLogada Long pessoaId) {
        return retificacaoService.listar(avaliacaoId, pessoaId);
    }
}
