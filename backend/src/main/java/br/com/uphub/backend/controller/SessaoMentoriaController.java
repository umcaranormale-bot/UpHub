package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.HorasMentoriaResponse;
import br.com.uphub.backend.dto.SessaoMentoriaRequest;
import br.com.uphub.backend.dto.SessaoMentoriaResponse;
import br.com.uphub.backend.seguranca.PessoaLogada;
import br.com.uphub.backend.service.SessaoMentoriaService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SessaoMentoriaController {

    private final SessaoMentoriaService sessaoService;

    public SessaoMentoriaController(SessaoMentoriaService sessaoService) {
        this.sessaoService = sessaoService;
    }

    @PostMapping("/api/alocacoes/{alocacaoId}/sessoes")
    public ResponseEntity<SessaoMentoriaResponse> registrar(@PathVariable("alocacaoId") Long alocacaoId,
                                                    @RequestBody SessaoMentoriaRequest dados,
                                                    @PessoaLogada Long pessoaId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sessaoService.registrar(alocacaoId, dados, pessoaId));
    }

    @GetMapping("/api/alocacoes/{alocacaoId}/horas")
    public HorasMentoriaResponse horas(@PathVariable("alocacaoId") Long alocacaoId,
                                       @RequestParam(name = "mes", required = false) String mes,
                                       @PessoaLogada Long pessoaId) {
        return sessaoService.horas(alocacaoId, mes, pessoaId);
    }

    @GetMapping("/api/candidaturas/{candidaturaId}/sessoes")
    public List<SessaoMentoriaResponse> listarDaCandidatura(@PathVariable("candidaturaId") Long candidaturaId,
                                                    @PessoaLogada Long pessoaId) {
        return sessaoService.listarDaCandidatura(candidaturaId, pessoaId);
    }

    @PutMapping("/api/sessoes/{id}")
    public SessaoMentoriaResponse editar(@PathVariable("id") Long id, @RequestBody SessaoMentoriaRequest dados, @PessoaLogada Long pessoaId) {
        return sessaoService.editar(id, dados, pessoaId);
    }

    @PostMapping("/api/sessoes/{id}/assinar")
    public SessaoMentoriaResponse assinar(@PathVariable("id") Long id, @PessoaLogada Long pessoaId) {
        return sessaoService.assinar(id, pessoaId);
    }

    @DeleteMapping("/api/sessoes/{id}")
    public ResponseEntity<Void> apagar(@PathVariable("id") Long id, @PessoaLogada Long pessoaId) {
        sessaoService.apagar(id, pessoaId);
        return ResponseEntity.noContent().build();
    }
}
