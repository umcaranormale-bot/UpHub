package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.EntrarResidenciaRequest;
import br.com.uphub.backend.dto.OportunidadeResponse;
import br.com.uphub.backend.dto.ResidenciaRequest;
import br.com.uphub.backend.dto.ResidenciaResponse;
import br.com.uphub.backend.dto.SquadResponse;
import br.com.uphub.backend.seguranca.PessoaLogada;
import br.com.uphub.backend.service.ResidenciaService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ResidenciaController {

    private final ResidenciaService residenciaService;

    public ResidenciaController(ResidenciaService residenciaService) {
        this.residenciaService = residenciaService;
    }

    @PostMapping("/api/residencias")
    public ResponseEntity<ResidenciaResponse> abrir(@RequestBody ResidenciaRequest dados, @PessoaLogada Long pessoaId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(residenciaService.abrir(dados, pessoaId));
    }

    @GetMapping("/api/residencias")
    public List<ResidenciaResponse> listar(@PessoaLogada Long pessoaId) {
        return residenciaService.listar(pessoaId);
    }

    @GetMapping("/api/residencias/{id}")
    public ResidenciaResponse buscar(@PathVariable("id") Long id, @PessoaLogada Long pessoaId) {
        return residenciaService.buscarPorId(id, pessoaId);
    }

    @PutMapping("/api/residencias/{id}")
    public ResidenciaResponse editar(@PathVariable("id") Long id, @RequestBody ResidenciaRequest dados,
                                     @PessoaLogada Long pessoaId) {
        return residenciaService.editar(id, dados, pessoaId);
    }

    @PostMapping("/api/residencias/{id}/encerrar")
    public ResidenciaResponse encerrar(@PathVariable("id") Long id, @PessoaLogada Long pessoaId) {
        return residenciaService.encerrar(id, pessoaId);
    }

    @GetMapping("/api/residencias/{id}/desafios")
    public List<OportunidadeResponse> desafios(@PathVariable("id") Long id) {
        return residenciaService.desafios(id);
    }

    @GetMapping("/api/residencias/{id}/squads")
    public List<SquadResponse> squads(@PathVariable("id") Long id, @PessoaLogada Long pessoaId) {
        return residenciaService.squads(id, pessoaId);
    }

    @PostMapping("/api/squads/{squadId}/residencia")
    public SquadResponse entrar(@PathVariable("squadId") Long squadId, @RequestBody EntrarResidenciaRequest dados,
                                @PessoaLogada Long pessoaId) {
        return residenciaService.entrar(squadId, dados, pessoaId);
    }
}
