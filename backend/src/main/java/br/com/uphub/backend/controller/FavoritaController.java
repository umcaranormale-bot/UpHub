package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.FavoritaResponse;
import br.com.uphub.backend.seguranca.PessoaLogada;
import br.com.uphub.backend.service.FavoritaService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/organizacoes/{organizacaoId}/favoritas")
public class FavoritaController {

    private final FavoritaService favoritaService;

    public FavoritaController(FavoritaService favoritaService) {
        this.favoritaService = favoritaService;
    }

    @GetMapping
    public List<FavoritaResponse> listar(@PathVariable("organizacaoId") Long organizacaoId, @PessoaLogada Long pessoaId) {
        return favoritaService.listar(organizacaoId, pessoaId);
    }

    @PostMapping("/{oportunidadeId}")
    public ResponseEntity<FavoritaResponse> favoritar(@PathVariable("organizacaoId") Long organizacaoId,
                                                      @PathVariable("oportunidadeId") Long oportunidadeId,
                                                      @PessoaLogada Long pessoaId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(favoritaService.favoritar(organizacaoId, oportunidadeId, pessoaId));
    }

    @DeleteMapping("/{oportunidadeId}")
    public ResponseEntity<Void> desfavoritar(@PathVariable("organizacaoId") Long organizacaoId,
                                             @PathVariable("oportunidadeId") Long oportunidadeId,
                                             @PessoaLogada Long pessoaId) {
        favoritaService.desfavoritar(organizacaoId, oportunidadeId, pessoaId);
        return ResponseEntity.noContent().build();
    }
}
