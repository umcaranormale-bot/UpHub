package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.AnexoRequest;
import br.com.uphub.backend.dto.AnexoResponse;
import br.com.uphub.backend.seguranca.PessoaLogada;
import br.com.uphub.backend.service.AnexoService;
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
@RequestMapping("/api/candidaturas/{candidaturaId}/anexos")
public class AnexoController {

    private final AnexoService anexoService;

    public AnexoController(AnexoService anexoService) {
        this.anexoService = anexoService;
    }

    @PostMapping
    public ResponseEntity<AnexoResponse> anexar(@PathVariable("candidaturaId") Long candidaturaId,
                                                @RequestBody AnexoRequest dados,
                                                @PessoaLogada Long pessoaId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(anexoService.anexar(candidaturaId, dados, pessoaId));
    }

    @GetMapping
    public List<AnexoResponse> listar(@PathVariable("candidaturaId") Long candidaturaId, @PessoaLogada Long pessoaId) {
        return anexoService.listar(candidaturaId, pessoaId);
    }

    @DeleteMapping("/{documentoId}")
    public ResponseEntity<Void> remover(@PathVariable("candidaturaId") Long candidaturaId,
                                        @PathVariable("documentoId") Long documentoId,
                                        @PessoaLogada Long pessoaId) {
        anexoService.remover(candidaturaId, documentoId, pessoaId);
        return ResponseEntity.noContent().build();
    }
}
