package br.com.uphub.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

// A nota que o avaliador deu num critério da oportunidade.
@Entity
@Table(name = "nota_criterio")
public class NotaCriterio {

    @EmbeddedId
    private NotaCriterioId id;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal nota;

    @Column(name = "registrada_em", nullable = false)
    private OffsetDateTime registradaEm;

    protected NotaCriterio() {
    }

    public NotaCriterio(Long avaliacaoId, Long criterioId, BigDecimal nota, OffsetDateTime quando) {
        this.id = new NotaCriterioId(avaliacaoId, criterioId);
        this.nota = nota;
        this.registradaEm = quando;
    }

    public void trocar(BigDecimal nota, OffsetDateTime quando) {
        this.nota = nota;
        this.registradaEm = quando;
    }

    public NotaCriterioId getId() { return id; }

    public BigDecimal getNota() { return nota; }

    public OffsetDateTime getRegistradaEm() { return registradaEm; }
}
