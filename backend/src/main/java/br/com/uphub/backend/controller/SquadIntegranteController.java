package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.SquadIntegranteCadastroRequest;
import br.com.uphub.backend.dto.SquadIntegranteResponse;
import br.com.uphub.backend.service.SquadIntegranteService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/squads/{squadId}/integrantes")
public class SquadIntegranteController {

    private final SquadIntegranteService squadIntegranteService;

    public SquadIntegranteController(SquadIntegranteService squadIntegranteService) {
        this.squadIntegranteService = squadIntegranteService;
    }

    @PostMapping
    public ResponseEntity<SquadIntegranteResponse> adicionar(
            @PathVariable("squadId") Long squadId,
            @RequestBody SquadIntegranteCadastroRequest dados) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(squadIntegranteService.adicionar(squadId, dados));
    }

    @GetMapping
    public List<SquadIntegranteResponse> listar(@PathVariable("squadId") Long squadId) {
        return squadIntegranteService.listar(squadId);
    }
}