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

// Um ciclo do acompanhamento: planejada, em andamento, entregue pela organização e avaliada pelo mentor.
@Entity
@Table(name = "sprint")
public class Sprint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "candidatura_id", nullable = false, updatable = false)
    private Long candidaturaId;

    @Column(nullable = false, updatable = false)
    private Short numero;

    @Column(nullable = false, length = 15)
    private String estado;

    @Column(name = "prazo_entrega")
    private LocalDate prazoEntrega;

    @Column(name = "entrega_descricao")
    private String entregaDescricao;

    @Column(name = "entrega_registrada_em")
    private OffsetDateTime entregaRegistradaEm;

    @Column(name = "nota_entrega", precision = 4, scale = 2)
    private BigDecimal notaEntrega;

    @Column(name = "feedback_entrega")
    private String feedbackEntrega;

    @Column(name = "avaliada_por")
    private Long avaliadaPor;

    @Column(name = "avaliada_em")
    private OffsetDateTime avaliadaEm;

    protected Sprint() {
    }

    public Sprint(Long candidaturaId, short numero, LocalDate prazoEntrega) {
        this.candidaturaId = candidaturaId;
        this.numero = numero;
        this.prazoEntrega = prazoEntrega;
        this.estado = "PLANEJADA";
    }

    public void iniciar() {
        this.estado = "EM_ANDAMENTO";
    }

    public void entregar(String descricao, OffsetDateTime quando) {
        this.estado = "ENTREGUE";
        this.entregaDescricao = descricao;
        this.entregaRegistradaEm = quando;
    }

    public void avaliar(BigDecimal nota, String feedback, Long pessoaId, OffsetDateTime quando) {
        this.estado = "AVALIADA";
        this.notaEntrega = nota;
        this.feedbackEntrega = feedback;
        this.avaliadaPor = pessoaId;
        this.avaliadaEm = quando;
    }

    public Long getId() { return id; }

    public Long getCandidaturaId() { return candidaturaId; }

    public Short getNumero() { return numero; }

    public String getEstado() { return estado; }

    public LocalDate getPrazoEntrega() { return prazoEntrega; }

    public String getEntregaDescricao() { return entregaDescricao; }

    public OffsetDateTime getEntregaRegistradaEm() { return entregaRegistradaEm; }

    public BigDecimal getNotaEntrega() { return notaEntrega; }

    public String getFeedbackEntrega() { return feedbackEntrega; }

    public Long getAvaliadaPor() { return avaliadaPor; }

    public OffsetDateTime getAvaliadaEm() { return avaliadaEm; }
}
