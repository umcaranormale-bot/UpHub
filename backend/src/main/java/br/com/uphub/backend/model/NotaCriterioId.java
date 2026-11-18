package br.com.uphub.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class NotaCriterioId implements Serializable {

    @Column(name = "avaliacao_id")
    private Long avaliacaoId;

    @Column(name = "criterio_id")
    private Long criterioId;

    protected NotaCriterioId() {
    }

    public NotaCriterioId(Long avaliacaoId, Long criterioId) {
        this.avaliacaoId = avaliacaoId;
        this.criterioId = criterioId;
    }

    public Long getAvaliacaoId() {
        return avaliacaoId;
    }

    public Long getCriterioId() {
        return criterioId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof NotaCriterioId outro)) {
            return false;
        }
        return Objects.equals(avaliacaoId, outro.avaliacaoId) && Objects.equals(criterioId, outro.criterioId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(avaliacaoId, criterioId);
    }
}
