package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.CandidaturaEnvioResponse;
import br.com.uphub.backend.dto.CandidaturaRequest;
import br.com.uphub.backend.dto.CandidaturaResponse;
import br.com.uphub.backend.dto.DecisaoElegibilidadeRequest;
import br.com.uphub.backend.dto.FunilRequest;
import br.com.uphub.backend.dto.TransicaoResponse;
import br.com.uphub.backend.seguranca.PessoaLogada;
import br.com.uphub.backend.service.CandidaturaService;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CandidaturaController {

    private final CandidaturaService candidaturaService;

    public CandidaturaController(CandidaturaService candidaturaService) {
        this.candidaturaService = candidaturaService;
    }

    @PostMapping("/api/oportunidades/{oportunidadeId}/candidaturas")
    public ResponseEntity<CandidaturaResponse> cadastrar(@PathVariable("oportunidadeId") Long oportunidadeId,
                                                         @RequestBody CandidaturaRequest dados,
                                                         @PessoaLogada Long pessoaId) {
        CandidaturaResponse criada = candidaturaService.cadastrar(oportunidadeId, dados, pessoaId);
        return ResponseEntity.created(URI.create("/api/candidaturas/" + criada.id())).body(criada);
    }

    @GetMapping("/api/oportunidades/{oportunidadeId}/candidaturas")
    public List<CandidaturaResponse> listarDaOportunidade(@PathVariable("oportunidadeId") Long oportunidadeId,
                                                          @RequestParam(name = "estado", required = false) String estado,
                                                          @PessoaLogada Long pessoaId) {
        return candidaturaService.listarDaOportunidade(oportunidadeId, estado, pessoaId);
    }

    @GetMapping("/api/candidaturas")
    public List<CandidaturaResponse> listarDaOrganizacao(@RequestParam(name = "organizacaoId", required = false) Long organizacaoId,
                                                         @PessoaLogada Long pessoaId) {
        return candidaturaService.listarDaOrganizacao(organizacaoId, pessoaId);
    }

    @GetMapping("/api/candidaturas/transicoes")
    public List<TransicaoResponse> transicoes() {
        return candidaturaService.transicoes();
    }

    @GetMapping("/api/candidaturas/{id}")
    public CandidaturaResponse buscar(@PathVariable("id") Long id, @PessoaLogada Long pessoaId) {
        return candidaturaService.buscarPorId(id, pessoaId);
    }

    @PutMapping("/api/candidaturas/{id}")
    public CandidaturaResponse editar(@PathVariable("id") Long id, @RequestBody CandidaturaRequest dados,
                                      @PessoaLogada Long pessoaId) {
        return candidaturaService.editar(id, dados, pessoaId);
    }

    @PostMapping("/api/candidaturas/{id}/enviar")
    public CandidaturaEnvioResponse enviar(@PathVariable("id") Long id, @PessoaLogada Long pessoaId) {
        return candidaturaService.enviar(id, pessoaId);
    }

    @PostMapping("/api/candidaturas/{id}/elegibilidade")
    public CandidaturaResponse decidirElegibilidade(@PathVariable("id") Long id,
                                                    @RequestBody DecisaoElegibilidadeRequest dados,
                                                    @PessoaLogada Long pessoaId) {
        return candidaturaService.decidirElegibilidade(id, dados, pessoaId);
    }

    @PostMapping("/api/candidaturas/{id}/analise")
    public CandidaturaResponse iniciarAnalise(@PathVariable("id") Long id, @PessoaLogada Long pessoaId) {
        return candidaturaService.iniciarAnalise(id, pessoaId);
    }

    @PostMapping("/api/candidaturas/{id}/funil")
    public CandidaturaResponse moverNoFunil(@PathVariable("id") Long id, @RequestBody FunilRequest dados,
                                            @PessoaLogada Long pessoaId) {
        return candidaturaService.moverNoFunil(id, dados, pessoaId);
    }
}
