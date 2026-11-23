package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.EventoAuditoriaResponse;
import br.com.uphub.backend.seguranca.PessoaLogada;
import br.com.uphub.backend.service.AuditoriaConsultaService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuditoriaController {

    private final AuditoriaConsultaService consultaService;

    public AuditoriaController(AuditoriaConsultaService consultaService) {
        this.consultaService = consultaService;
    }

    @GetMapping("/api/organizacoes/{orgId}/auditoria")
    public List<EventoAuditoriaResponse> daOrganizacao(@PathVariable("orgId") Long orgId,
                                                       @RequestParam(name = "acao", required = false) String acao,
                                                       @RequestParam(name = "desde", required = false) String desde,
                                                       @RequestParam(name = "ate", required = false) String ate,
                                                       @RequestParam(name = "limite", required = false) Integer limite,
                                                       @PessoaLogada Long pessoaId) {
        return consultaService.daOrganizacao(orgId, consultaService.filtros(acao, desde, ate, limite), pessoaId);
    }

    @GetMapping("/api/oportunidades/{id}/auditoria")
    public List<EventoAuditoriaResponse> daOportunidade(@PathVariable("id") Long id,
                                                        @RequestParam(name = "acao", required = false) String acao,
                                                        @RequestParam(name = "desde", required = false) String desde,
                                                        @RequestParam(name = "ate", required = false) String ate,
                                                        @RequestParam(name = "limite", required = false) Integer limite,
                                                        @PessoaLogada Long pessoaId) {
        return consultaService.daOportunidade(id, consultaService.filtros(acao, desde, ate, limite), pessoaId);
    }

    @GetMapping("/api/candidaturas/{id}/auditoria")
    public List<EventoAuditoriaResponse> daCandidatura(@PathVariable("id") Long id,
                                                       @RequestParam(name = "acao", required = false) String acao,
                                                       @RequestParam(name = "desde", required = false) String desde,
                                                       @RequestParam(name = "ate", required = false) String ate,
                                                       @RequestParam(name = "limite", required = false) Integer limite,
                                                       @PessoaLogada Long pessoaId) {
        return consultaService.daCandidatura(id, consultaService.filtros(acao, desde, ate, limite), pessoaId);
    }
}
