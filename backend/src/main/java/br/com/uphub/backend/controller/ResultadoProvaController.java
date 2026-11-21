package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.ResultadoProvaRequest;
import br.com.uphub.backend.dto.ResultadoProvaResponse;
import br.com.uphub.backend.seguranca.PessoaLogada;
import br.com.uphub.backend.service.ResultadoProvaService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/provas")
public class ResultadoProvaController {

    private final ResultadoProvaService provaService;

    public ResultadoProvaController(ResultadoProvaService provaService) {
        this.provaService = provaService;
    }

    @PostMapping
    public ResponseEntity<ResultadoProvaResponse> registrar(@RequestBody ResultadoProvaRequest dados,
                                                            @PessoaLogada Long pessoaId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(provaService.registrar(dados, pessoaId));
    }

    @GetMapping
    public List<ResultadoProvaResponse> listarMinhas(@PessoaLogada Long pessoaId) {
        return provaService.listarMinhas(pessoaId);
    }
}
