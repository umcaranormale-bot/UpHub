package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.AssinaturaRequest;
import br.com.uphub.backend.dto.AtribuicaoRequest;
import br.com.uphub.backend.dto.AvaliacaoRascunhoRequest;
import br.com.uphub.backend.dto.AvaliacaoResponse;
import br.com.uphub.backend.seguranca.PessoaLogada;
import br.com.uphub.backend.service.AvaliacaoService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AvaliacaoController {

    private final AvaliacaoService avaliacaoService;

    public AvaliacaoController(AvaliacaoService avaliacaoService) {
        this.avaliacaoService = avaliacaoService;
    }

    @PostMapping("/api/candidaturas/{candidaturaId}/avaliacoes")
    public ResponseEntity<AvaliacaoResponse> atribuir(@PathVariable("candidaturaId") Long candidaturaId,
                                                      @RequestBody AtribuicaoRequest dados,
                                                      @PessoaLogada Long pessoaId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(avaliacaoService.atribuir(candidaturaId, dados, pessoaId));
    }

    @GetMapping("/api/candidaturas/{candidaturaId}/avaliacoes")
    public List<AvaliacaoResponse> listarDaCandidatura(@PathVariable("candidaturaId") Long candidaturaId,
                                                       @PessoaLogada Long pessoaId) {
        return avaliacaoService.listarDaCandidatura(candidaturaId, pessoaId);
    }

    @GetMapping("/api/avaliacoes")
    public List<AvaliacaoResponse> fila(@PessoaLogada Long pessoaId) {
        return avaliacaoService.fila(pessoaId);
    }

    @GetMapping("/api/avaliacoes/{id}")
    public AvaliacaoResponse buscar(@PathVariable("id") Long id, @PessoaLogada Long pessoaId) {
        return avaliacaoService.buscarPorId(id, pessoaId);
    }

    @PutMapping("/api/avaliacoes/{id}")
    public AvaliacaoResponse salvarRascunho(@PathVariable("id") Long id, @RequestBody AvaliacaoRascunhoRequest dados,
                                            @PessoaLogada Long pessoaId) {
        return avaliacaoService.salvarRascunho(id, dados, pessoaId);
    }

    @PostMapping("/api/avaliacoes/{id}/assinar")
    public AvaliacaoResponse assinar(@PathVariable("id") Long id,
                                     @RequestBody(required = false) AssinaturaRequest dados,
                                     @PessoaLogada Long pessoaId) {
        return avaliacaoService.assinar(id, dados, pessoaId);
    }

    @DeleteMapping("/api/avaliacoes/{id}")
    public ResponseEntity<Void> remover(@PathVariable("id") Long id, @PessoaLogada Long pessoaId) {
        avaliacaoService.remover(id, pessoaId);
        return ResponseEntity.noContent().build();
    }
}
