package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.DocumentoCadastroRequest;
import br.com.uphub.backend.dto.DocumentoResponse;
import br.com.uphub.backend.service.DocumentoService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/documentos")
public class DocumentoController {

    private final DocumentoService documentoService;

    public DocumentoController(DocumentoService documentoService) {
        this.documentoService = documentoService;
    }

    @PostMapping
    public ResponseEntity<DocumentoResponse> cadastrar(@RequestBody DocumentoCadastroRequest dados) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(documentoService.cadastrar(dados));
    }

    @GetMapping
    public List<DocumentoResponse> listar(
            @RequestParam(name = "organizacaoId", required = false) Long organizacaoId) {
        return documentoService.listar(organizacaoId);
    }

    @GetMapping("/{id}")
    public DocumentoResponse buscar(@PathVariable Long id) {
        return documentoService.buscarPorId(id);
    }
}