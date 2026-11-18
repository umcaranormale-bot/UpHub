package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.ExtratoElegibilidadeResponse;
import br.com.uphub.backend.seguranca.PessoaLogada;
import br.com.uphub.backend.service.ResultadoRequisitoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ResultadoRequisitoController {

    private final ResultadoRequisitoService resultadoService;

    public ResultadoRequisitoController(ResultadoRequisitoService resultadoService) {
        this.resultadoService = resultadoService;
    }

    // o extrato da elegibilidade guardado no envio
    @GetMapping("/api/candidaturas/{id}/elegibilidade")
    public ExtratoElegibilidadeResponse extrato(@PathVariable("id") Long id, @PessoaLogada Long pessoaId) {
        return resultadoService.extrato(id, pessoaId);
    }
}
