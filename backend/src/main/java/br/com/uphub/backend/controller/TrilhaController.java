package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.TrilhaResponse;
import br.com.uphub.backend.service.TrilhaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/trilhas")
public class TrilhaController {

    private final TrilhaService trilhaService;

    public TrilhaController(TrilhaService trilhaService) {
        this.trilhaService = trilhaService;
    }

    @GetMapping
    public ResponseEntity<List<TrilhaResponse>> listar() {
        return ResponseEntity.ok(trilhaService.listar());
    }

    @GetMapping("/{codigo}")
    public ResponseEntity<TrilhaResponse> buscarPorCodigo(@PathVariable String codigo) {
        return ResponseEntity.ok(trilhaService.buscarPorCodigo(codigo));
    }
}