package br.com.uphub.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

// A pessoa autoriza o uso da própria nota numa candidatura; a nota e a data ficam congeladas.
@Entity
@Table(name = "autorizacao_nota")
public class AutorizacaoNota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "candidatura_id", nullable = false)
    private Long candidaturaId;

    @Column(name = "resultado_prova_id", nullable = false)
    private Long resultadoProvaId;

    @Column(name = "autorizada_em", nullable = false, updatable = false)
    private OffsetDateTime autorizadaEm;

    @Column(name = "nota_congelada", nullable = false, precision = 5, scale = 2)
    private BigDecimal notaCongelada;

    @Column(name = "data_prova_congelada", nullable = false)
    private LocalDate dataProvaCongelada;

    protected AutorizacaoNota() {
    }

    public AutorizacaoNota(Long candidaturaId, ResultadoProva prova, OffsetDateTime quando) {
        this.candidaturaId = candidaturaId;
        this.resultadoProvaId = prova.getId();
        this.autorizadaEm = quando;
        this.notaCongelada = prova.getNota();
        this.dataProvaCongelada = prova.getDataProva();
    }

    public Long getId() { return id; }

    public Long getCandidaturaId() { return candidaturaId; }

    public Long getResultadoProvaId() { return resultadoProvaId; }

    public OffsetDateTime getAutorizadaEm() { return autorizadaEm; }

    public BigDecimal getNotaCongelada() { return notaCongelada; }

    public LocalDate getDataProvaCongelada() { return dataProvaCongelada; }
}
