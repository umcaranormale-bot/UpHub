package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.VisualizacaoRequest;
import br.com.uphub.backend.dto.VisualizacaoResponse;
import br.com.uphub.backend.seguranca.PessoaLogada;
import br.com.uphub.backend.service.VisualizacaoOportunidadeService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/oportunidades/{oportunidadeId}/visualizacoes")
public class VisualizacaoOportunidadeController {

    private final VisualizacaoOportunidadeService visualizacaoService;

    public VisualizacaoOportunidadeController(VisualizacaoOportunidadeService visualizacaoService) {
        this.visualizacaoService = visualizacaoService;
    }

    @PostMapping
    public ResponseEntity<Void> registrar(@PathVariable("oportunidadeId") Long oportunidadeId,
                                          @RequestBody VisualizacaoRequest dados,
                                          @PessoaLogada Long pessoaId) {
        visualizacaoService.registrar(oportunidadeId, dados, pessoaId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public List<VisualizacaoResponse> listar(@PathVariable("oportunidadeId") Long oportunidadeId,
                                             @PessoaLogada Long pessoaId) {
        return visualizacaoService.listar(oportunidadeId, pessoaId);
    }
}
