package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.NotaCriterioRequest;
import br.com.uphub.backend.dto.NotaCriterioResponse;
import br.com.uphub.backend.seguranca.PessoaLogada;
import br.com.uphub.backend.service.NotaCriterioService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/avaliacoes/{avaliacaoId}/notas")
public class NotaCriterioController {

    private final NotaCriterioService notaService;

    public NotaCriterioController(NotaCriterioService notaService) {
        this.notaService = notaService;
    }

    @GetMapping
    public List<NotaCriterioResponse> listar(@PathVariable("avaliacaoId") Long avaliacaoId, @PessoaLogada Long pessoaId) {
        return notaService.listar(avaliacaoId, pessoaId);
    }

    @PutMapping("/{criterioId}")
    public NotaCriterioResponse registrar(@PathVariable("avaliacaoId") Long avaliacaoId,
                                          @PathVariable("criterioId") Long criterioId,
                                          @RequestBody NotaCriterioRequest dados,
                                          @PessoaLogada Long pessoaId) {
        return notaService.registrar(avaliacaoId, criterioId, dados, pessoaId);
    }
}
