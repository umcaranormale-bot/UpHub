package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.PainelResponse;
import br.com.uphub.backend.seguranca.PessoaLogada;
import br.com.uphub.backend.service.PainelService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PainelController {

    private final PainelService painelService;

    public PainelController(PainelService painelService) {
        this.painelService = painelService;
    }

    @GetMapping("/api/painel")
    public PainelResponse painel(@PessoaLogada Long pessoaId) {
        return painelService.painel(pessoaId);
    }
}
