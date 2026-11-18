package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.AlocacaoRequest;
import br.com.uphub.backend.dto.AlocacaoResponse;
import br.com.uphub.backend.dto.MentorResponse;
import br.com.uphub.backend.dto.MentoriaRequest;
import br.com.uphub.backend.seguranca.PessoaLogada;
import br.com.uphub.backend.service.AlocacaoService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AlocacaoController {

    private final AlocacaoService alocacaoService;

    public AlocacaoController(AlocacaoService alocacaoService) {
        this.alocacaoService = alocacaoService;
    }

    @PutMapping("/api/vinculos/{vinculoId}/mentoria")
    public MentorResponse definirMentoria(@PathVariable("vinculoId") Long vinculoId, @RequestBody MentoriaRequest dados,
                                          @PessoaLogada Long pessoaId) {
        return alocacaoService.definirMentoria(vinculoId, dados, pessoaId);
    }

    @GetMapping("/api/organizacoes/{organizacaoId}/mentores")
    public List<MentorResponse> mentores(@PathVariable("organizacaoId") Long organizacaoId,
                                         @RequestParam(name = "area", required = false) String area,
                                         @PessoaLogada Long pessoaId) {
        return alocacaoService.mentores(organizacaoId, area, pessoaId);
    }

    @PostMapping("/api/candidaturas/{candidaturaId}/mentores")
    public ResponseEntity<AlocacaoResponse> convidar(@PathVariable("candidaturaId") Long candidaturaId,
                                                     @RequestBody AlocacaoRequest dados,
                                                     @PessoaLogada Long pessoaId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(alocacaoService.convidar(candidaturaId, dados, pessoaId));
    }

    @GetMapping("/api/candidaturas/{candidaturaId}/mentores")
    public List<AlocacaoResponse> listarDaCandidatura(@PathVariable("candidaturaId") Long candidaturaId,
                                                      @PessoaLogada Long pessoaId) {
        return alocacaoService.listarDaCandidatura(candidaturaId, pessoaId);
    }

    @GetMapping("/api/alocacoes")
    public List<AlocacaoResponse> minhas(@PessoaLogada Long pessoaId) {
        return alocacaoService.minhas(pessoaId);
    }

    @PostMapping("/api/alocacoes/{id}/aceitar")
    public AlocacaoResponse aceitar(@PathVariable("id") Long id, @PessoaLogada Long pessoaId) {
        return alocacaoService.responder(id, true, pessoaId);
    }

    @PostMapping("/api/alocacoes/{id}/recusar")
    public AlocacaoResponse recusar(@PathVariable("id") Long id, @PessoaLogada Long pessoaId) {
        return alocacaoService.responder(id, false, pessoaId);
    }
}
