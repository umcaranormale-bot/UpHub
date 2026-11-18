package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.DocumentoExigidoRequest;
import br.com.uphub.backend.dto.DocumentoExigidoResponse;
import br.com.uphub.backend.seguranca.PessoaLogada;
import br.com.uphub.backend.service.DocumentoExigidoService;
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
@RequestMapping("/api/oportunidades/{oportunidadeId}/versoes/{versaoId}/documentos-exigidos")
public class DocumentoExigidoController {

    private final DocumentoExigidoService documentoExigidoService;

    public DocumentoExigidoController(DocumentoExigidoService documentoExigidoService) {
        this.documentoExigidoService = documentoExigidoService;
    }

    @PostMapping
    public ResponseEntity<DocumentoExigidoResponse> cadastrar(@PathVariable("oportunidadeId") Long oportunidadeId,
                                                              @PathVariable("versaoId") Long versaoId,
                                                              @RequestBody DocumentoExigidoRequest dados,
                                                              @PessoaLogada Long pessoaId) {
        DocumentoExigidoResponse criado = documentoExigidoService.cadastrar(oportunidadeId, versaoId, dados, pessoaId);
        return ResponseEntity
                .created(URI.create("/api/oportunidades/" + oportunidadeId + "/versoes/" + versaoId
                        + "/documentos-exigidos/" + criado.id()))
                .body(criado);
    }

    @GetMapping
    public List<DocumentoExigidoResponse> listar(@PathVariable("oportunidadeId") Long oportunidadeId,
                                                 @PathVariable("versaoId") Long versaoId,
                                                 @PessoaLogada Long pessoaId) {
        return documentoExigidoService.listar(oportunidadeId, versaoId, pessoaId);
    }

    @PutMapping("/{documentoId}")
    public DocumentoExigidoResponse editar(@PathVariable("oportunidadeId") Long oportunidadeId,
                                           @PathVariable("versaoId") Long versaoId,
                                           @PathVariable("documentoId") Long documentoId,
                                           @RequestBody DocumentoExigidoRequest dados,
                                           @PessoaLogada Long pessoaId) {
        return documentoExigidoService.editar(oportunidadeId, versaoId, documentoId, dados, pessoaId);
    }

    @DeleteMapping("/{documentoId}")
    public ResponseEntity<Void> remover(@PathVariable("oportunidadeId") Long oportunidadeId,
                                        @PathVariable("versaoId") Long versaoId,
                                        @PathVariable("documentoId") Long documentoId,
                                        @PessoaLogada Long pessoaId) {
        documentoExigidoService.remover(oportunidadeId, versaoId, documentoId, pessoaId);
        return ResponseEntity.noContent().build();
    }
}
