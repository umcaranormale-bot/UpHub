package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.MatchResponse;
import br.com.uphub.backend.dto.PesosMatchingResponse;
import br.com.uphub.backend.seguranca.PessoaLogada;
import br.com.uphub.backend.service.MatchingService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MatchingController {

    private final MatchingService matchingService;

    public MatchingController(MatchingService matchingService) {
        this.matchingService = matchingService;
    }

    @GetMapping("/api/matching/oportunidades")
    public List<MatchResponse> paraOrganizacao(@RequestParam(name = "organizacaoId", required = false) Long organizacaoId,
                                               @RequestParam(name = "limite", required = false) Integer limite,
                                               @PessoaLogada Long pessoaId) {
        return matchingService.paraOrganizacao(organizacaoId, limite, pessoaId);
    }

    @GetMapping("/api/oportunidades/{oportunidadeId}/matching")
    public List<MatchResponse> paraOportunidade(@PathVariable("oportunidadeId") Long oportunidadeId,
                                                @RequestParam(name = "limite", required = false) Integer limite,
                                                @PessoaLogada Long pessoaId) {
        return matchingService.paraOportunidade(oportunidadeId, limite, pessoaId);
    }

    @GetMapping("/api/matching/pesos")
    public List<PesosMatchingResponse> pesos() {
        return matchingService.pesos();
    }
}
