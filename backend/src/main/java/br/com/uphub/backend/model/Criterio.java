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
import java.math.BigDecimal;

@Entity
@Table(name = "criterio")
public class Criterio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "versao_id", nullable = false)
    private VersaoOportunidade versao;

    @Column(name = "ordem")
    private Short ordem;

    @Column(name = "descricao", nullable = false, columnDefinition = "text")
    private String descricao;

    @Column(name = "peso", precision = 5, scale = 2)
    private BigDecimal peso;

    @Column(name = "escala_min", precision = 5, scale = 2)
    private BigDecimal escalaMin;

    @Column(name = "escala_max", precision = 5, scale = 2)
    private BigDecimal escalaMax;

    @Column(name = "evidencia_esperada", columnDefinition = "text")
    private String evidenciaEsperada;

    protected Criterio() {
    }

    public Criterio(VersaoOportunidade versao, Short ordem, String descricao, BigDecimal peso,
                    BigDecimal escalaMin, BigDecimal escalaMax, String evidenciaEsperada) {
        this.versao = versao;
        this.ordem = ordem;
        this.descricao = descricao;
        this.peso = peso;
        this.escalaMin = escalaMin;
        this.escalaMax = escalaMax;
        this.evidenciaEsperada = evidenciaEsperada;
    }

    public Long getId() { return id; }

    public VersaoOportunidade getVersao() { return versao; }

    public Short getOrdem() { return ordem; }
    public void setOrdem(Short ordem) { this.ordem = ordem; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public BigDecimal getPeso() { return peso; }
    public void setPeso(BigDecimal peso) { this.peso = peso; }

    public BigDecimal getEscalaMin() { return escalaMin; }
    public void setEscalaMin(BigDecimal escalaMin) { this.escalaMin = escalaMin; }

    public BigDecimal getEscalaMax() { return escalaMax; }
    public void setEscalaMax(BigDecimal escalaMax) { this.escalaMax = escalaMax; }

    public String getEvidenciaEsperada() { return evidenciaEsperada; }
    public void setEvidenciaEsperada(String evidenciaEsperada) { this.evidenciaEsperada = evidenciaEsperada; }
}
