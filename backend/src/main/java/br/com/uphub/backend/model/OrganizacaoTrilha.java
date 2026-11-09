package br.com.uphub.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

@Entity
@Table(name = "organizacao_trilha")
public class OrganizacaoTrilha {

    @EmbeddedId
    private OrganizacaoTrilhaId id;

    @MapsId("organizacaoId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organizacao_id", nullable = false)
    private Organizacao organizacao;

    @MapsId("trilhaCodigo")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trilha_codigo", nullable = false)
    private Trilha trilha;

    protected OrganizacaoTrilha() {
    }

    public OrganizacaoTrilha(Organizacao organizacao, Trilha trilha) {
        this.id = new OrganizacaoTrilhaId(organizacao.getId(), trilha.getCodigo());
        this.organizacao = organizacao;
        this.trilha = trilha;
    }

    public OrganizacaoTrilhaId getId() {
        return id;
    }

    public Organizacao getOrganizacao() {
        return organizacao;
    }

    public Trilha getTrilha() {
        return trilha;
    }
}
