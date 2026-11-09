package br.com.uphub.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "squad")
public class Squad {

    @Id
    @Column(name = "organizacao_id")
    private Long organizacaoId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organizacao_id")
    private Organizacao organizacao;

    @Column(name = "descricao")
    private String descricao;

    @Column(name = "codigo_coordenacao", length = 40)
    private String codigoCoordenacao;

    protected Squad() {
    }

    public Squad(Organizacao organizacao, String descricao, String codigoCoordenacao) {
        this.organizacao = organizacao;
        this.descricao = descricao;
        this.codigoCoordenacao = codigoCoordenacao;
    }

    public Long getOrganizacaoId() {
        return organizacaoId;
    }

    public Organizacao getOrganizacao() {
        return organizacao;
    }

    public String getDescricao() {
        return descricao;
    }

    public String getCodigoCoordenacao() {
        return codigoCoordenacao;
    }
}