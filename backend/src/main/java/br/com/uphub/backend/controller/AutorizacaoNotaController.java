package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.AutorizacaoNotaRequest;
import br.com.uphub.backend.dto.AutorizacaoNotaResponse;
import br.com.uphub.backend.seguranca.PessoaLogada;
import br.com.uphub.backend.service.AutorizacaoNotaService;
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
@RequestMapping("/api/candidaturas/{candidaturaId}/notas")
public class AutorizacaoNotaController {

    private final AutorizacaoNotaService autorizacaoService;

    public AutorizacaoNotaController(AutorizacaoNotaService autorizacaoService) {
        this.autorizacaoService = autorizacaoService;
    }

    @PostMapping
    public ResponseEntity<AutorizacaoNotaResponse> autorizar(@PathVariable("candidaturaId") Long candidaturaId,
                                                             @RequestBody AutorizacaoNotaRequest dados,
                                                             @PessoaLogada Long pessoaId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(autorizacaoService.autorizar(candidaturaId, dados, pessoaId));
    }

    @GetMapping
    public List<AutorizacaoNotaResponse> listar(@PathVariable("candidaturaId") Long candidaturaId,
                                                @PessoaLogada Long pessoaId) {
        return autorizacaoService.listar(candidaturaId, pessoaId);
    }

    @DeleteMapping("/{autorizacaoId}")
    public ResponseEntity<Void> revogar(@PathVariable("candidaturaId") Long candidaturaId,
                                        @PathVariable("autorizacaoId") Long autorizacaoId,
                                        @PessoaLogada Long pessoaId) {
        autorizacaoService.revogar(candidaturaId, autorizacaoId, pessoaId);
        return ResponseEntity.noContent().build();
    }
}
