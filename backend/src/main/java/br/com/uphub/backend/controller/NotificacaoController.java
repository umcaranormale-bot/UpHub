package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.NotificacaoResponse;
import br.com.uphub.backend.dto.QuantidadeResponse;
import br.com.uphub.backend.seguranca.PessoaLogada;
import br.com.uphub.backend.service.NotificacaoService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class NotificacaoController {

    private final NotificacaoService notificacaoService;

    public NotificacaoController(NotificacaoService notificacaoService) {
        this.notificacaoService = notificacaoService;
    }

    @GetMapping("/api/notificacoes")
    public List<NotificacaoResponse> listar(@RequestParam(name = "naoLidas", required = false) Boolean naoLidas,
                                            @PessoaLogada Long pessoaId) {
        return notificacaoService.listar(pessoaId, Boolean.TRUE.equals(naoLidas));
    }

    @GetMapping("/api/notificacoes/nao-lidas")
    public QuantidadeResponse contarNaoLidas(@PessoaLogada Long pessoaId) {
        return notificacaoService.contarNaoLidas(pessoaId);
    }

    @PostMapping("/api/notificacoes/{id}/lida")
    public NotificacaoResponse marcarLida(@PathVariable("id") Long id, @PessoaLogada Long pessoaId) {
        return notificacaoService.marcarLida(id, pessoaId);
    }

    @PostMapping("/api/notificacoes/lidas")
    public QuantidadeResponse marcarTodasLidas(@PessoaLogada Long pessoaId) {
        return notificacaoService.marcarTodasLidas(pessoaId);
    }
}
