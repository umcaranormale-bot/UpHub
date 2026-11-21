package br.com.uphub.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class AvaliadorOportunidadeId implements Serializable {

    @Column(name = "oportunidade_id")
    private Long oportunidadeId;

    @Column(name = "vinculo_id")
    private Long vinculoId;

    protected AvaliadorOportunidadeId() {
    }

    public AvaliadorOportunidadeId(Long oportunidadeId, Long vinculoId) {
        this.oportunidadeId = oportunidadeId;
        this.vinculoId = vinculoId;
    }

    public Long getOportunidadeId() {
        return oportunidadeId;
    }

    public Long getVinculoId() {
        return vinculoId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof AvaliadorOportunidadeId outro)) {
            return false;
        }
        return Objects.equals(oportunidadeId, outro.oportunidadeId) && Objects.equals(vinculoId, outro.vinculoId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(oportunidadeId, vinculoId);
    }
}
