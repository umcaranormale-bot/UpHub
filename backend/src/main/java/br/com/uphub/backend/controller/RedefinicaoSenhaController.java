package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.RedefinicaoSenhaRequest;
import br.com.uphub.backend.dto.SolicitacaoRedefinicaoRequest;
import br.com.uphub.backend.service.RedefinicaoSenhaService;
import br.com.uphub.backend.seguranca.Publico;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Publico
@RestController
@RequestMapping("/api/redefinicao-senha")
public class RedefinicaoSenhaController {

    private final RedefinicaoSenhaService redefinicaoSenhaService;

    public RedefinicaoSenhaController(RedefinicaoSenhaService redefinicaoSenhaService) {
        this.redefinicaoSenhaService = redefinicaoSenhaService;
    }

    @PostMapping("/solicitar")
    public ResponseEntity<Void> solicitar(@RequestBody SolicitacaoRedefinicaoRequest dados) {
        redefinicaoSenhaService.solicitar(dados.email());
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<Void> redefinir(@RequestBody RedefinicaoSenhaRequest dados) {
        redefinicaoSenhaService.redefinir(dados.token(), dados.senha());
        return ResponseEntity.noContent().build();
    }
}