package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.GargaloEtapaResponse;
import br.com.uphub.backend.dto.ParametroGargaloRequest;
import br.com.uphub.backend.dto.ParametroGargaloResponse;
import br.com.uphub.backend.seguranca.PessoaLogada;
import br.com.uphub.backend.service.GargaloService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class GargaloController {

    private final GargaloService gargaloService;

    public GargaloController(GargaloService gargaloService) {
        this.gargaloService = gargaloService;
    }

    @GetMapping("/api/gargalos")
    public List<GargaloEtapaResponse> listar(@RequestParam(name = "etapa", required = false) String etapa,
                                             @PessoaLogada Long pessoaId) {
        return gargaloService.listar(etapa, pessoaId);
    }

    @GetMapping("/api/gargalos/parametros")
    public List<ParametroGargaloResponse> parametros(@PessoaLogada Long pessoaId) {
        return gargaloService.parametros(pessoaId);
    }

    @PutMapping("/api/gargalos/parametros/{etapa}")
    public ParametroGargaloResponse editar(@PathVariable("etapa") String etapa, @RequestBody ParametroGargaloRequest dados,
                                           @PessoaLogada Long pessoaId) {
        return gargaloService.editarParametro(etapa, dados, pessoaId);
    }
}
