package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.EventoAuditoriaResponse;
import br.com.uphub.backend.seguranca.PessoaLogada;
import br.com.uphub.backend.service.AuditoriaConsultaService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuditoriaController {

    private final AuditoriaConsultaService consultaService;

    public AuditoriaController(AuditoriaConsultaService consultaService) {
        this.consultaService = consultaService;
    }

    @GetMapping("/api/oportunidades/{id}/auditoria")
    public List<EventoAuditoriaResponse> daOportunidade(@PathVariable("id") Long id,
                                                        @PessoaLogada Long pessoaId) {
        return consultaService.daOportunidade(id, pessoaId);
    }

    @GetMapping("/api/candidaturas/{id}/auditoria")
    public List<EventoAuditoriaResponse> daCandidatura(@PathVariable("id") Long id,
                                                       @PessoaLogada Long pessoaId) {
        return consultaService.daCandidatura(id, pessoaId);
    }
}