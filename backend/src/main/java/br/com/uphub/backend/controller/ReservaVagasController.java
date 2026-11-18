package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.ReservaVagasRequest;
import br.com.uphub.backend.dto.ReservaVagasResponse;
import br.com.uphub.backend.seguranca.PessoaLogada;
import br.com.uphub.backend.service.ReservaVagasService;
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
@RequestMapping("/api/oportunidades/{oportunidadeId}/versoes/{versaoId}/reservas")
public class ReservaVagasController {

    private final ReservaVagasService reservaVagasService;

    public ReservaVagasController(ReservaVagasService reservaVagasService) {
        this.reservaVagasService = reservaVagasService;
    }

    @PostMapping
    public ResponseEntity<ReservaVagasResponse> cadastrar(@PathVariable("oportunidadeId") Long oportunidadeId,
                                                              @PathVariable("versaoId") Long versaoId,
                                                              @RequestBody ReservaVagasRequest dados,
                                                              @PessoaLogada Long pessoaId) {
        ReservaVagasResponse criado = reservaVagasService.cadastrar(oportunidadeId, versaoId, dados, pessoaId);
        return ResponseEntity
                .created(URI.create("/api/oportunidades/" + oportunidadeId + "/versoes/" + versaoId
                        + "/reservas/" + criado.id()))
                .body(criado);
    }

    @GetMapping
    public List<ReservaVagasResponse> listar(@PathVariable("oportunidadeId") Long oportunidadeId,
                                                 @PathVariable("versaoId") Long versaoId,
                                                 @PessoaLogada Long pessoaId) {
        return reservaVagasService.listar(oportunidadeId, versaoId, pessoaId);
    }

    @PutMapping("/{reservaId}")
    public ReservaVagasResponse editar(@PathVariable("oportunidadeId") Long oportunidadeId,
                                           @PathVariable("versaoId") Long versaoId,
                                           @PathVariable("reservaId") Long reservaId,
                                           @RequestBody ReservaVagasRequest dados,
                                           @PessoaLogada Long pessoaId) {
        return reservaVagasService.editar(oportunidadeId, versaoId, reservaId, dados, pessoaId);
    }

    @DeleteMapping("/{reservaId}")
    public ResponseEntity<Void> remover(@PathVariable("oportunidadeId") Long oportunidadeId,
                                        @PathVariable("versaoId") Long versaoId,
                                        @PathVariable("reservaId") Long reservaId,
                                        @PessoaLogada Long pessoaId) {
        reservaVagasService.remover(oportunidadeId, versaoId, reservaId, pessoaId);
        return ResponseEntity.noContent().build();
    }
}
