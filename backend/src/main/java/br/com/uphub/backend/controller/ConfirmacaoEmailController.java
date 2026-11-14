package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.ConfirmacaoEmailRequest;
import br.com.uphub.backend.dto.ReenvioCodigoRequest;
import br.com.uphub.backend.service.ConfirmacaoEmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/confirmacao-email")
public class ConfirmacaoEmailController {

    private final ConfirmacaoEmailService confirmacaoEmailService;

    public ConfirmacaoEmailController(ConfirmacaoEmailService confirmacaoEmailService) {
        this.confirmacaoEmailService = confirmacaoEmailService;
    }

    @PostMapping
    public ResponseEntity<Void> confirmar(@RequestBody ConfirmacaoEmailRequest dados) {
        confirmacaoEmailService.confirmar(dados.email(), dados.codigo());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reenviar")
    public ResponseEntity<Void> reenviar(@RequestBody ReenvioCodigoRequest dados) {
        confirmacaoEmailService.reenviar(dados.email());
        return ResponseEntity.noContent().build();
    }
}