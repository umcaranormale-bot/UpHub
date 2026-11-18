package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.ParticipanteRequest;
import br.com.uphub.backend.dto.ParticipanteResponse;
import br.com.uphub.backend.seguranca.PessoaLogada;
import br.com.uphub.backend.service.ParticipanteService;
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
@RequestMapping("/api/candidaturas/{candidaturaId}/participantes")
public class ParticipanteController {

    private final ParticipanteService participanteService;

    public ParticipanteController(ParticipanteService participanteService) {
        this.participanteService = participanteService;
    }

    @PostMapping
    public ResponseEntity<ParticipanteResponse> adicionar(@PathVariable("candidaturaId") Long candidaturaId,
                                                          @RequestBody ParticipanteRequest dados,
                                                          @PessoaLogada Long pessoaId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(participanteService.adicionar(candidaturaId, dados, pessoaId));
    }

    @GetMapping
    public List<ParticipanteResponse> listar(@PathVariable("candidaturaId") Long candidaturaId,
                                             @PessoaLogada Long pessoaId) {
        return participanteService.listar(candidaturaId, pessoaId);
    }

    @PostMapping("/confirmar")
    public ParticipanteResponse confirmar(@PathVariable("candidaturaId") Long candidaturaId,
                                          @PessoaLogada Long pessoaId) {
        return participanteService.confirmar(candidaturaId, pessoaId);
    }

    @DeleteMapping("/{pessoaId}")
    public ResponseEntity<Void> remover(@PathVariable("candidaturaId") Long candidaturaId,
                                        @PathVariable("pessoaId") Long pessoaId,
                                        @PessoaLogada Long pessoaLogadaId) {
        participanteService.remover(candidaturaId, pessoaId, pessoaLogadaId);
        return ResponseEntity.noContent().build();
    }
}
