package br.com.uphub.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class OrganizacaoTrilhaId implements Serializable {

    @Column(name = "organizacao_id")
    private Long organizacaoId;

    @Column(name = "trilha_codigo", length = 20)
    private String trilhaCodigo;

    protected OrganizacaoTrilhaId() {
    }

    public OrganizacaoTrilhaId(Long organizacaoId, String trilhaCodigo) {
        this.organizacaoId = organizacaoId;
        this.trilhaCodigo = trilhaCodigo;
    }

    public Long getOrganizacaoId() {
        return organizacaoId;
    }

    public String getTrilhaCodigo() {
        return trilhaCodigo;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof OrganizacaoTrilhaId outro)) {
            return false;
        }
        return Objects.equals(organizacaoId, outro.organizacaoId)
                && Objects.equals(trilhaCodigo, outro.trilhaCodigo);
    }

    @Override
    public int hashCode() {
        return Objects.hash(organizacaoId, trilhaCodigo);
    }
}
