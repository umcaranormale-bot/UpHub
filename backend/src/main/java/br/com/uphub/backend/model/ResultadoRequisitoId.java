package br.com.uphub.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class ResultadoRequisitoId implements Serializable {

    @Column(name = "candidatura_id")
    private Long candidaturaId;

    @Column(name = "requisito_id")
    private Long requisitoId;

    protected ResultadoRequisitoId() {
    }

    public ResultadoRequisitoId(Long candidaturaId, Long requisitoId) {
        this.candidaturaId = candidaturaId;
        this.requisitoId = requisitoId;
    }

    public Long getCandidaturaId() {
        return candidaturaId;
    }

    public Long getRequisitoId() {
        return requisitoId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ResultadoRequisitoId outro)) {
            return false;
        }
        return Objects.equals(candidaturaId, outro.candidaturaId) && Objects.equals(requisitoId, outro.requisitoId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(candidaturaId, requisitoId);
    }
}
