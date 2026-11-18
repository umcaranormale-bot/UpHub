package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.CriterioCadastroRequest;
import br.com.uphub.backend.dto.CriterioEdicaoRequest;
import br.com.uphub.backend.dto.CriterioResponse;
import br.com.uphub.backend.seguranca.PessoaLogada;
import br.com.uphub.backend.service.CriterioService;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/oportunidades/{oportunidadeId}/versoes/{versaoId}/criterios")
public class CriterioController {

    private final CriterioService criterioService;

    public CriterioController(CriterioService criterioService) {
        this.criterioService = criterioService;
    }

    @PostMapping
    public ResponseEntity<CriterioResponse> cadastrar(@PathVariable("oportunidadeId") Long oportunidadeId,
                                                      @PathVariable("versaoId") Long versaoId,
                                                      @RequestBody CriterioCadastroRequest dados,
                                                      @PessoaLogada Long pessoaId) {
        CriterioResponse criado = criterioService.cadastrar(oportunidadeId, versaoId, dados, pessoaId);
        return ResponseEntity
                .created(URI.create("/api/oportunidades/" + oportunidadeId + "/versoes/" + versaoId
                        + "/criterios/" + criado.id()))
                .body(criado);
    }

    @GetMapping
    public List<CriterioResponse> listar(@PathVariable("oportunidadeId") Long oportunidadeId,
                                         @PathVariable("versaoId") Long versaoId,
                                         @PessoaLogada Long pessoaId) {
        return criterioService.listar(oportunidadeId, versaoId, pessoaId);
    }

    @PutMapping("/{criterioId}")
    public CriterioResponse editar(@PathVariable("oportunidadeId") Long oportunidadeId,
                                   @PathVariable("versaoId") Long versaoId,
                                   @PathVariable("criterioId") Long criterioId,
                                   @RequestBody CriterioEdicaoRequest dados,
                                   @PessoaLogada Long pessoaId) {
        return criterioService.editar(oportunidadeId, versaoId, criterioId, dados, pessoaId);
    }

    @DeleteMapping("/{criterioId}")
    public ResponseEntity<Void> remover(@PathVariable("oportunidadeId") Long oportunidadeId,
                                        @PathVariable("versaoId") Long versaoId,
                                        @PathVariable("criterioId") Long criterioId,
                                        @PessoaLogada Long pessoaId) {
        criterioService.remover(oportunidadeId, versaoId, criterioId, pessoaId);
        return ResponseEntity.noContent().build();
    }
}
