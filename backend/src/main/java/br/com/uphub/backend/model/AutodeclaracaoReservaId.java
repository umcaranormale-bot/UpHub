package br.com.uphub.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class AutodeclaracaoReservaId implements Serializable {

    @Column(name = "candidatura_id")
    private Long candidaturaId;

    @Column(name = "criterio", length = 80)
    private String criterio;

    protected AutodeclaracaoReservaId() {
    }

    public AutodeclaracaoReservaId(Long candidaturaId, String criterio) {
        this.candidaturaId = candidaturaId;
        this.criterio = criterio;
    }

    public Long getCandidaturaId() {
        return candidaturaId;
    }

    public String getCriterio() {
        return criterio;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof AutodeclaracaoReservaId outro)) {
            return false;
        }
        return Objects.equals(candidaturaId, outro.candidaturaId) && Objects.equals(criterio, outro.criterio);
    }

    @Override
    public int hashCode() {
        return Objects.hash(candidaturaId, criterio);
    }
}
