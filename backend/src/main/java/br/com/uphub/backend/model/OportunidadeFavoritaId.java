package br.com.uphub.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class OportunidadeFavoritaId implements Serializable {

    @Column(name = "organizacao_id")
    private Long organizacaoId;

    @Column(name = "oportunidade_id")
    private Long oportunidadeId;

    protected OportunidadeFavoritaId() {
    }

    public OportunidadeFavoritaId(Long organizacaoId, Long oportunidadeId) {
        this.organizacaoId = organizacaoId;
        this.oportunidadeId = oportunidadeId;
    }

    public Long getOrganizacaoId() { return organizacaoId; }

    public Long getOportunidadeId() { return oportunidadeId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof OportunidadeFavoritaId outro)) {
            return false;
        }
        return Objects.equals(organizacaoId, outro.organizacaoId) && Objects.equals(oportunidadeId, outro.oportunidadeId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(organizacaoId, oportunidadeId);
    }
}
