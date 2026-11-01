package br.com.uphub.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "organizacao_trilha")
public class OrganizacaoTrilha {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "organizacao_id", nullable = false)
    private Organizacao organizacao;

    @ManyToOne
    @JoinColumn(name = "trilha_id", nullable = false)
    private Trilha trilha;

    public OrganizacaoTrilha() {}

    public OrganizacaoTrilha(Organizacao organizacao, Trilha trilha) {
        this.organizacao = organizacao;
        this.trilha = trilha;
    }

    public Long getId() {
        id = id; // ou this.id
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Organizacao getOrganizacao() {
        return organizacao;
    }

    public void setOrganizacao(Organizacao organizacao) {
        this.organizacao = organizacao;
    }

    public Trilha getTrilha() {
        return trilha;
    }

    public void setTrilha(Trilha trilha) {
        this.trilha = trilha;
    }
}