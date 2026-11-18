package br.com.uphub.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

// Um documento da organização anexado à candidatura, podendo cumprir um documento exigido pela oportunidade.
@Entity
@Table(name = "candidatura_anexo")
public class CandidaturaAnexo {

    @EmbeddedId
    private CandidaturaAnexoId id;

    @Column(name = "documento_exigido_id")
    private Long documentoExigidoId;

    protected CandidaturaAnexo() {
    }

    public CandidaturaAnexo(Long candidaturaId, Long documentoId, Long documentoExigidoId) {
        this.id = new CandidaturaAnexoId(candidaturaId, documentoId);
        this.documentoExigidoId = documentoExigidoId;
    }

    public CandidaturaAnexoId getId() { return id; }

    public Long getDocumentoExigidoId() { return documentoExigidoId; }
}
