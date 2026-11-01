package br.com.uphub.backend.controller;

import br.com.uphub.backend.model.OrganizacaoTrilha;
import br.com.uphub.backend.model.Trilha;
import br.com.uphub.backend.service.TrilhaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trilhas")
public class TrilhaController {

    @Autowired
    private TrilhaService trilhaService;

    @GetMapping
    public ResponseEntity<List<Trilha>> listarTrilhas() {
        List<Trilha> trilhas = trilhaService.listarTodasTrilhas();
        return ResponseEntity.ok(trilhas);
    }

    @GetMapping("/organizacao/{organizacaoId}")
    public ResponseEntity<List<OrganizacaoTrilha>> listarPorOrganizacao(@PathVariable Long organizacaoId) {
        List<OrganizacaoTrilha> vinculos = trilhaService.listarTrilhasPorOrganizacao(organizacaoId);
        return ResponseEntity.ok(vinculos);
    }
}