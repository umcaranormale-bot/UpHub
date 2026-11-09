package br.com.uphub.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import org.hibernate.annotations.Generated;

@Entity
@Table(name = "vinculo")
public class Vinculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pessoa_id", nullable = false)
    private Pessoa pessoa;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organizacao_id", nullable = false)
    private Organizacao organizacao;

    @Column(name = "papel", nullable = false, length = 20)
    private String papel;

    @Column(name = "funcao", length = 120)
    private String funcao;

    @Column(name = "representante", nullable = false)
    private boolean representante;

    @Generated
    @Column(name = "ativo_desde", nullable = false, updatable = false)
    private OffsetDateTime ativoDesde;

    @Column(name = "encerrado_em")
    private OffsetDateTime encerradoEm;

    protected Vinculo() {
    }

    public Vinculo(Pessoa pessoa, Organizacao organizacao, String papel,
                   String funcao, boolean representante) {
        this.pessoa = pessoa;
        this.organizacao = organizacao;
        this.papel = papel;
        this.funcao = funcao;
        this.representante = representante;
    }

    public Long getId() {
        return id;
    }

    public Pessoa getPessoa() {
        return pessoa;
    }

    public Organizacao getOrganizacao() {
        return organizacao;
    }

    public String getPapel() {
        return papel;
    }

    public String getFuncao() {
        return funcao;
    }

    public boolean isRepresentante() {
        return representante;
    }

    public OffsetDateTime getAtivoDesde() {
        return ativoDesde;
    }

    public OffsetDateTime getEncerradoEm() {
        return encerradoEm;
    }
}