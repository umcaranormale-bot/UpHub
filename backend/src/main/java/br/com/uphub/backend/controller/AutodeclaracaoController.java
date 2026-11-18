package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.AutodeclaracaoRequest;
import br.com.uphub.backend.dto.AutodeclaracaoResponse;
import br.com.uphub.backend.dto.ConferenciaAutodeclaracaoRequest;
import br.com.uphub.backend.seguranca.PessoaLogada;
import br.com.uphub.backend.service.AutodeclaracaoService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/candidaturas/{candidaturaId}/autodeclaracoes")
public class AutodeclaracaoController {

    private final AutodeclaracaoService autodeclaracaoService;

    public AutodeclaracaoController(AutodeclaracaoService autodeclaracaoService) {
        this.autodeclaracaoService = autodeclaracaoService;
    }

    @PostMapping
    public ResponseEntity<AutodeclaracaoResponse> declarar(@PathVariable("candidaturaId") Long candidaturaId,
                                                           @RequestBody AutodeclaracaoRequest dados,
                                                           @PessoaLogada Long pessoaId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(autodeclaracaoService.declarar(candidaturaId, dados, pessoaId));
    }

    @GetMapping
    public List<AutodeclaracaoResponse> listar(@PathVariable("candidaturaId") Long candidaturaId,
                                               @PessoaLogada Long pessoaId) {
        return autodeclaracaoService.listar(candidaturaId, pessoaId);
    }

    @DeleteMapping("/{criterio}")
    public ResponseEntity<Void> retirar(@PathVariable("candidaturaId") Long candidaturaId,
                                        @PathVariable("criterio") String criterio,
                                        @PessoaLogada Long pessoaId) {
        autodeclaracaoService.retirar(candidaturaId, criterio, pessoaId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{criterio}/conferencia")
    public AutodeclaracaoResponse conferir(@PathVariable("candidaturaId") Long candidaturaId,
                                           @PathVariable("criterio") String criterio,
                                           @RequestBody ConferenciaAutodeclaracaoRequest dados,
                                           @PessoaLogada Long pessoaId) {
        return autodeclaracaoService.conferir(candidaturaId, criterio, dados, pessoaId);
    }
}
