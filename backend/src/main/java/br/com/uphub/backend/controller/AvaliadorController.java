package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.AvaliadorRequest;
import br.com.uphub.backend.dto.AvaliadorResponse;
import br.com.uphub.backend.seguranca.PessoaLogada;
import br.com.uphub.backend.service.AvaliadorService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AvaliadorController {

    private final AvaliadorService avaliadorService;

    public AvaliadorController(AvaliadorService avaliadorService) {
        this.avaliadorService = avaliadorService;
    }

    @PostMapping("/api/oportunidades/{oportunidadeId}/avaliadores")
    public ResponseEntity<AvaliadorResponse> designar(@PathVariable("oportunidadeId") Long oportunidadeId,
                                                      @RequestBody AvaliadorRequest dados,
                                                      @PessoaLogada Long pessoaId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(avaliadorService.designar(oportunidadeId, dados, pessoaId));
    }

    @GetMapping("/api/oportunidades/{oportunidadeId}/avaliadores")
    public List<AvaliadorResponse> listar(@PathVariable("oportunidadeId") Long oportunidadeId, @PessoaLogada Long pessoaId) {
        return avaliadorService.listar(oportunidadeId, pessoaId);
    }

    @DeleteMapping("/api/oportunidades/{oportunidadeId}/avaliadores/{vinculoId}")
    public ResponseEntity<Void> remover(@PathVariable("oportunidadeId") Long oportunidadeId,
                                        @PathVariable("vinculoId") Long vinculoId,
                                        @PessoaLogada Long pessoaId) {
        avaliadorService.remover(oportunidadeId, vinculoId, pessoaId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/avaliadores/designacoes")
    public List<AvaliadorResponse> minhasDesignacoes(@PessoaLogada Long pessoaId) {
        return avaliadorService.minhasDesignacoes(pessoaId);
    }
}
