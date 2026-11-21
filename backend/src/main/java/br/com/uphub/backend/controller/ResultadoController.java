package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.CandidaturaResponse;
import br.com.uphub.backend.dto.VagasResponse;
import br.com.uphub.backend.seguranca.PessoaLogada;
import br.com.uphub.backend.service.ResultadoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ResultadoController {

    private final ResultadoService resultadoService;

    public ResultadoController(ResultadoService resultadoService) {
        this.resultadoService = resultadoService;
    }

    @GetMapping("/api/oportunidades/{oportunidadeId}/vagas")
    public VagasResponse vagas(@PathVariable("oportunidadeId") Long oportunidadeId, @PessoaLogada Long pessoaId) {
        return resultadoService.resumo(oportunidadeId, pessoaId);
    }

    @PostMapping("/api/candidaturas/{id}/homologar")
    public CandidaturaResponse homologar(@PathVariable("id") Long id, @PessoaLogada Long pessoaId) {
        return resultadoService.homologar(id, pessoaId);
    }

    @PostMapping("/api/candidaturas/{id}/lista-de-espera")
    public CandidaturaResponse listaDeEspera(@PathVariable("id") Long id, @PessoaLogada Long pessoaId) {
        return resultadoService.listaDeEspera(id, pessoaId);
    }

    @PostMapping("/api/candidaturas/{id}/convocar")
    public CandidaturaResponse convocar(@PathVariable("id") Long id, @PessoaLogada Long pessoaId) {
        return resultadoService.convocar(id, pessoaId);
    }

    @PostMapping("/api/candidaturas/{id}/nao-convocar")
    public CandidaturaResponse naoConvocar(@PathVariable("id") Long id, @PessoaLogada Long pessoaId) {
        return resultadoService.naoConvocar(id, pessoaId);
    }

    @PostMapping("/api/candidaturas/{id}/acompanhamento")
    public CandidaturaResponse iniciarAcompanhamento(@PathVariable("id") Long id, @PessoaLogada Long pessoaId) {
        return resultadoService.iniciarAcompanhamento(id, pessoaId);
    }

    @PostMapping("/api/candidaturas/{id}/concluir")
    public CandidaturaResponse concluir(@PathVariable("id") Long id, @PessoaLogada Long pessoaId) {
        return resultadoService.concluir(id, pessoaId);
    }

    @PostMapping("/api/candidaturas/{id}/desistir")
    public CandidaturaResponse desistir(@PathVariable("id") Long id, @PessoaLogada Long pessoaId) {
        return resultadoService.desistir(id, pessoaId);
    }
}
