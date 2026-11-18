package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.CampoElegibilidadeResponse;
import br.com.uphub.backend.dto.ElegibilidadeResponse;
import br.com.uphub.backend.dto.RequisitoCadastroRequest;
import br.com.uphub.backend.dto.RequisitoEdicaoRequest;
import br.com.uphub.backend.dto.RequisitoResponse;
import br.com.uphub.backend.seguranca.PessoaLogada;
import br.com.uphub.backend.service.RequisitoElegibilidadeService;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RequisitoElegibilidadeController {

    private static final String BASE = "/api/oportunidades/{oportunidadeId}/versoes/{versaoId}";

    private final RequisitoElegibilidadeService requisitoService;

    public RequisitoElegibilidadeController(RequisitoElegibilidadeService requisitoService) {
        this.requisitoService = requisitoService;
    }

    @GetMapping("/api/requisitos/campos")
    public List<CampoElegibilidadeResponse> campos() {
        return requisitoService.campos();
    }

    @PostMapping(BASE + "/requisitos")
    public ResponseEntity<RequisitoResponse> cadastrar(@PathVariable("oportunidadeId") Long oportunidadeId,
                                                       @PathVariable("versaoId") Long versaoId,
                                                       @RequestBody RequisitoCadastroRequest dados,
                                                       @PessoaLogada Long pessoaId) {
        RequisitoResponse criado = requisitoService.cadastrar(oportunidadeId, versaoId, dados, pessoaId);
        return ResponseEntity
                .created(URI.create("/api/oportunidades/" + oportunidadeId + "/versoes/" + versaoId
                        + "/requisitos/" + criado.id()))
                .body(criado);
    }

    @GetMapping(BASE + "/requisitos")
    public List<RequisitoResponse> listar(@PathVariable("oportunidadeId") Long oportunidadeId,
                                          @PathVariable("versaoId") Long versaoId,
                                          @PessoaLogada Long pessoaId) {
        return requisitoService.listar(oportunidadeId, versaoId, pessoaId);
    }

    @PutMapping(BASE + "/requisitos/{requisitoId}")
    public RequisitoResponse editar(@PathVariable("oportunidadeId") Long oportunidadeId,
                                    @PathVariable("versaoId") Long versaoId,
                                    @PathVariable("requisitoId") Long requisitoId,
                                    @RequestBody RequisitoEdicaoRequest dados,
                                    @PessoaLogada Long pessoaId) {
        return requisitoService.editar(oportunidadeId, versaoId, requisitoId, dados, pessoaId);
    }

    @DeleteMapping(BASE + "/requisitos/{requisitoId}")
    public ResponseEntity<Void> remover(@PathVariable("oportunidadeId") Long oportunidadeId,
                                        @PathVariable("versaoId") Long versaoId,
                                        @PathVariable("requisitoId") Long requisitoId,
                                        @PessoaLogada Long pessoaId) {
        requisitoService.remover(oportunidadeId, versaoId, requisitoId, pessoaId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping(BASE + "/elegibilidade")
    public ElegibilidadeResponse avaliar(@PathVariable("oportunidadeId") Long oportunidadeId,
                                         @PathVariable("versaoId") Long versaoId,
                                         @RequestParam(name = "organizacaoId", required = false) Long organizacaoId,
                                         @PessoaLogada Long pessoaId) {
        return requisitoService.avaliar(oportunidadeId, versaoId, organizacaoId, pessoaId);
    }
}
