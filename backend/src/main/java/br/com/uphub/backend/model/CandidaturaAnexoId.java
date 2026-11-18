package br.com.uphub.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class CandidaturaAnexoId implements Serializable {

    @Column(name = "candidatura_id")
    private Long candidaturaId;

    @Column(name = "documento_id")
    private Long documentoId;

    protected CandidaturaAnexoId() {
    }

    public CandidaturaAnexoId(Long candidaturaId, Long documentoId) {
        this.candidaturaId = candidaturaId;
        this.documentoId = documentoId;
    }

    public Long getCandidaturaId() {
        return candidaturaId;
    }

    public Long getDocumentoId() {
        return documentoId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof CandidaturaAnexoId outro)) {
            return false;
        }
        return Objects.equals(candidaturaId, outro.candidaturaId) && Objects.equals(documentoId, outro.documentoId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(candidaturaId, documentoId);
    }
}
