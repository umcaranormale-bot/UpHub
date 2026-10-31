package br.com.uphub.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

@Entity
@Table(name = "organizacao")
public class Organizacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tipo;
    private String nome;

    @Column(name = "razao_social")
    private String razaoSocial;

    private String cnpj;
    private String porte;
    private String setor;
    private String estagio;

    @Column(name = "ano_fundacao")
    private Short anoFundacao;

    @Column(name = "sede_cidade")
    private String sedeCidade;

    @Column(name = "sede_uf")
    private String sedeUf;

    @Column(name = "criada_em", insertable = false, updatable = false)
    private OffsetDateTime criadaEm;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public void setCriadaEm(OffsetDateTime criadaEm) {
        this.criadaEm = criadaEm;
    }
}
