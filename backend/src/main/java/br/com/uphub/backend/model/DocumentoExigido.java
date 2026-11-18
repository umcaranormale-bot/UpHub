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

@Entity
@Table(name = "documento_exigido")
public class DocumentoExigido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "versao_id", nullable = false)
    private VersaoOportunidade versao;

    @Column(name = "nome", nullable = false, length = 120)
    private String nome;

    @Column(name = "obrigatorio", nullable = false)
    private boolean obrigatorio;

    protected DocumentoExigido() {
    }

    public DocumentoExigido(VersaoOportunidade versao, String nome, boolean obrigatorio) {
        this.versao = versao;
        this.nome = nome;
        this.obrigatorio = obrigatorio;
    }

    public Long getId() { return id; }

    public VersaoOportunidade getVersao() { return versao; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public boolean isObrigatorio() { return obrigatorio; }
    public void setObrigatorio(boolean obrigatorio) { this.obrigatorio = obrigatorio; }
}
