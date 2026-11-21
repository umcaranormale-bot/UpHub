package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.AvaliacaoEntregaRequest;
import br.com.uphub.backend.dto.EntregaRequest;
import br.com.uphub.backend.dto.SprintRequest;
import br.com.uphub.backend.dto.SprintResponse;
import br.com.uphub.backend.seguranca.PessoaLogada;
import br.com.uphub.backend.service.SprintService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SprintController {

    private final SprintService sprintService;

    public SprintController(SprintService sprintService) {
        this.sprintService = sprintService;
    }

    @PostMapping("/api/candidaturas/{candidaturaId}/sprints")
    public ResponseEntity<SprintResponse> criar(@PathVariable("candidaturaId") Long candidaturaId,
                                                @RequestBody(required = false) SprintRequest dados,
                                                @PessoaLogada Long pessoaId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sprintService.criar(candidaturaId, dados, pessoaId));
    }

    @GetMapping("/api/candidaturas/{candidaturaId}/sprints")
    public List<SprintResponse> listar(@PathVariable("candidaturaId") Long candidaturaId, @PessoaLogada Long pessoaId) {
        return sprintService.listar(candidaturaId, pessoaId);
    }

    @PostMapping("/api/sprints/{id}/iniciar")
    public SprintResponse iniciar(@PathVariable("id") Long id, @PessoaLogada Long pessoaId) {
        return sprintService.iniciar(id, pessoaId);
    }

    @PostMapping("/api/sprints/{id}/entrega")
    public SprintResponse entregar(@PathVariable("id") Long id, @RequestBody EntregaRequest dados, @PessoaLogada Long pessoaId) {
        return sprintService.entregar(id, dados, pessoaId);
    }

    @PostMapping("/api/sprints/{id}/avaliacao")
    public SprintResponse avaliar(@PathVariable("id") Long id, @RequestBody AvaliacaoEntregaRequest dados,
                                  @PessoaLogada Long pessoaId) {
        return sprintService.avaliar(id, dados, pessoaId);
    }
}
