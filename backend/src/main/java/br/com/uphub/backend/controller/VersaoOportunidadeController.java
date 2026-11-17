package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.VersaoOportunidadeCadastroRequest;
import br.com.uphub.backend.dto.VersaoOportunidadeEdicaoRequest;
import br.com.uphub.backend.dto.VersaoOportunidadePublicacaoRequest;
import br.com.uphub.backend.dto.VersaoOportunidadeResponse;
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
            @RequestBody VersaoOportunidadeCadastroRequest dados) {
        VersaoOportunidadeResponse criada = versaoService.cadastrar(oportunidadeId, dados);
        return ResponseEntity
                .created(URI.create("/api/oportunidades/" + oportunidadeId + "/versoes/" + criada.id()))
                .body(criada);
    }

    @GetMapping
    public List<VersaoOportunidadeResponse> listar(@PathVariable("oportunidadeId") Long oportunidadeId) {
        return versaoService.listar(oportunidadeId);
    }

    @GetMapping("/{versaoId}")
    public VersaoOportunidadeResponse buscar(@PathVariable("oportunidadeId") Long oportunidadeId,
                                             @PathVariable("versaoId") Long versaoId) {
        return versaoService.buscarPorId(oportunidadeId, versaoId);
    }

    @PutMapping("/{versaoId}")
    public VersaoOportunidadeResponse editar(@PathVariable("oportunidadeId") Long oportunidadeId,
                                             @PathVariable("versaoId") Long versaoId,
                                             @RequestBody VersaoOportunidadeEdicaoRequest dados) {
        return versaoService.editar(oportunidadeId, versaoId, dados);
    }

    @PostMapping("/{versaoId}/publicar")
    public VersaoOportunidadeResponse publicar(@PathVariable("oportunidadeId") Long oportunidadeId,
                                               @PathVariable("versaoId") Long versaoId,
                                               @RequestBody VersaoOportunidadePublicacaoRequest dados) {
        return versaoService.publicar(oportunidadeId, versaoId, dados);
    }
}
