package br.com.uphub.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

// Um avaliador designado avalia uma candidatura numa rodada. Depois de assinada, não muda mais.
@Entity
@Table(name = "avaliacao")
public class Avaliacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "candidatura_id", nullable = false, updatable = false)
    private Long candidaturaId;

    @Column(name = "oportunidade_id", nullable = false, updatable = false)
    private Long oportunidadeId;

    @Column(name = "vinculo_id", nullable = false, updatable = false)
    private Long vinculoId;

    @Column(name = "atribuida_por", nullable = false, updatable = false)
    private Long atribuidaPor;

    @Column(name = "atribuida_em", nullable = false, updatable = false)
    private OffsetDateTime atribuidaEm;

    @Column(length = 15)
    private String decisao;

    @Column
    private String parecer;

    @Column(name = "nota_final", precision = 5, scale = 2)
    private BigDecimal notaFinal;

    @Column(name = "assinada_em")
    private OffsetDateTime assinadaEm;

    @Column(nullable = false, updatable = false)
    private Short rodada;

    protected Avaliacao() {
    }

    public Avaliacao(Long candidaturaId, Long oportunidadeId, Long vinculoId, Long atribuidaPor, OffsetDateTime quando,
                     short rodada) {
        this.candidaturaId = candidaturaId;
        this.oportunidadeId = oportunidadeId;
        this.vinculoId = vinculoId;
        this.atribuidaPor = atribuidaPor;
        this.atribuidaEm = quando;
        this.rodada = rodada;
    }

    public void rascunho(String decisao, String parecer) {
        if (decisao != null) {
            this.decisao = decisao;
        }
        if (parecer != null) {
            this.parecer = parecer;
        }
    }

    public void assinar(BigDecimal notaFinal, OffsetDateTime quando) {
        this.notaFinal = notaFinal;
        this.assinadaEm = quando;
    }

    public boolean assinada() { return assinadaEm != null; }

    public Long getId() { return id; }

    public Long getCandidaturaId() { return candidaturaId; }

    public Long getOportunidadeId() { return oportunidadeId; }

    public Long getVinculoId() { return vinculoId; }

    public Long getAtribuidaPor() { return atribuidaPor; }

    public OffsetDateTime getAtribuidaEm() { return atribuidaEm; }

    public String getDecisao() { return decisao; }

    public String getParecer() { return parecer; }

    public BigDecimal getNotaFinal() { return notaFinal; }

    public OffsetDateTime getAssinadaEm() { return assinadaEm; }

    public Short getRodada() { return rodada; }
}
