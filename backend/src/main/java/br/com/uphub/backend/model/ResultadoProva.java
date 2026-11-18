package br.com.uphub.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.Generated;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

// Nota de prova da pessoa física: a nota é da pessoa, nunca da organização.
@Entity
@Table(name = "resultado_prova")
public class ResultadoProva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "pessoa_id", nullable = false)
    private Long pessoaId;

    @Column(name = "area", length = 80)
    private String area;

    @Column(name = "nota", nullable = false, precision = 5, scale = 2)
    private BigDecimal nota;

    @Column(name = "data_prova", nullable = false)
    private LocalDate dataProva;

    @Generated
    @Column(name = "registrado_em", nullable = false, updatable = false)
    private OffsetDateTime registradoEm;

    protected ResultadoProva() {
    }

    public ResultadoProva(Long pessoaId, String area, BigDecimal nota, LocalDate dataProva) {
        this.pessoaId = pessoaId;
        this.area = area;
        this.nota = nota;
        this.dataProva = dataProva;
    }

    public Long getId() { return id; }

    public Long getPessoaId() { return pessoaId; }

    public String getArea() { return area; }

    public BigDecimal getNota() { return nota; }

    public LocalDate getDataProva() { return dataProva; }

    public OffsetDateTime getRegistradoEm() { return registradoEm; }
}
