package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.VersaoOportunidadeEdicaoRequest;
import br.com.uphub.backend.dto.VersaoOportunidadeResponse;
import br.com.uphub.backend.seguranca.PessoaLogada;
import br.com.uphub.backend.service.VersaoOportunidadeService;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/oportunidades/{oportunidadeId}/versoes")
public class VersaoOportunidadeController {

    private final VersaoOportunidadeService versaoService;

    public VersaoOportunidadeController(VersaoOportunidadeService versaoService) {
        this.versaoService = versaoService;
    }

    @PostMapping
    public ResponseEntity<VersaoOportunidadeResponse> cadastrar(
            @PathVariable("oportunidadeId") Long oportunidadeId,
            @PessoaLogada Long pessoaId) {
        VersaoOportunidadeResponse criada = versaoService.cadastrar(oportunidadeId, pessoaId);
        return ResponseEntity
                .created(URI.create("/api/oportunidades/" + oportunidadeId + "/versoes/" + criada.id()))
                .body(criada);
    }

    @GetMapping
    public List<VersaoOportunidadeResponse> listar(@PathVariable("oportunidadeId") Long oportunidadeId,
                                                   @PessoaLogada Long pessoaId) {
        return versaoService.listar(oportunidadeId, pessoaId);
    }

    @GetMapping("/{versaoId}")
    public VersaoOportunidadeResponse buscar(@PathVariable("oportunidadeId") Long oportunidadeId,
                                             @PathVariable("versaoId") Long versaoId,
                                             @PessoaLogada Long pessoaId) {
        return versaoService.buscarPorId(oportunidadeId, versaoId, pessoaId);
    }

    @PutMapping("/{versaoId}")
    public VersaoOportunidadeResponse editar(@PathVariable("oportunidadeId") Long oportunidadeId,
                                             @PathVariable("versaoId") Long versaoId,
                                             @RequestBody VersaoOportunidadeEdicaoRequest dados,
                                             @PessoaLogada Long pessoaId) {
        return versaoService.editar(oportunidadeId, versaoId, dados, pessoaId);
    }

    @PostMapping("/{versaoId}/publicar")
    public VersaoOportunidadeResponse publicar(@PathVariable("oportunidadeId") Long oportunidadeId,
                                               @PathVariable("versaoId") Long versaoId,
                                               @PessoaLogada Long pessoaId) {
        return versaoService.publicar(oportunidadeId, versaoId, pessoaId);
    }
}
