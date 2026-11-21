package br.com.uphub.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class VisualizacaoOportunidadeId implements Serializable {

    @Column(name = "oportunidade_id")
    private Long oportunidadeId;

    @Column(name = "organizacao_id")
    private Long organizacaoId;

    protected VisualizacaoOportunidadeId() {
    }

    public VisualizacaoOportunidadeId(Long oportunidadeId, Long organizacaoId) {
        this.oportunidadeId = oportunidadeId;
        this.organizacaoId = organizacaoId;
    }

    public Long getOportunidadeId() {
        return oportunidadeId;
    }

    public Long getOrganizacaoId() {
        return organizacaoId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof VisualizacaoOportunidadeId outro)) {
            return false;
        }
        return Objects.equals(oportunidadeId, outro.oportunidadeId)
                && Objects.equals(organizacaoId, outro.organizacaoId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(oportunidadeId, organizacaoId);
    }
}
