package br.com.uphub.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import org.hibernate.annotations.Generated;

@Entity
@Table(name = "organizacao")
public class Organizacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tipo", nullable = false, length = 30)
    private String tipo;

    @Column(name = "nome", nullable = false, length = 200)
    private String nome;

    @Column(name = "razao_social", length = 200)
    private String razaoSocial;

    @Column(name = "cnpj", length = 14)
    private String cnpj;

    @Column(name = "porte", length = 30)
    private String porte;

    @Column(name = "setor", length = 80)
    private String setor;

    @Column(name = "estagio", length = 40)
    private String estagio;

    @Column(name = "ano_fundacao")
    private Short anoFundacao;

    @Column(name = "sede_cidade", length = 80)
    private String sedeCidade;

    @Column(name = "sede_uf", length = 2)
    private String sedeUf;

    @Generated
    @Column(name = "criada_em", nullable = false, updatable = false)
    private OffsetDateTime criadaEm;

    public Long getId() {
        return id;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getRazaoSocial() {
        return razaoSocial;
    }

    public void setRazaoSocial(String razaoSocial) {
        this.razaoSocial = razaoSocial;
    }

    public String getCnpj() {
        return cnpj;
    }

    public void setCnpj(String cnpj) {
        this.cnpj = cnpj;
    }

    public String getPorte() {
        return porte;
    }

    public void setPorte(String porte) {
        this.porte = porte;
    }

    public String getSetor() {
        return setor;
    }

    public void setSetor(String setor) {
        this.setor = setor;
    }

    public String getEstagio() {
        return estagio;
    }

    public void setEstagio(String estagio) {
        this.estagio = estagio;
    }

    public Short getAnoFundacao() {
        return anoFundacao;
    }

    public void setAnoFundacao(Short anoFundacao) {
        this.anoFundacao = anoFundacao;
    }

    public String getSedeCidade() {
        return sedeCidade;
    }

    public void setSedeCidade(String sedeCidade) {
        this.sedeCidade = sedeCidade;
    }

    public String getSedeUf() {
        return sedeUf;
    }

    public void setSedeUf(String sedeUf) {
        this.sedeUf = sedeUf;
    }

    public OffsetDateTime getCriadaEm() {
        return criadaEm;
    }
}