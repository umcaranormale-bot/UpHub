package br.com.uphub.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

// A organização candidata se declara num critério de reserva de vagas; o provedor confere depois da homologação.
@Entity
@Table(name = "autodeclaracao_reserva")
public class AutodeclaracaoReserva {

    @EmbeddedId
    private AutodeclaracaoReservaId id;

    @Column(name = "declarada_em", nullable = false, updatable = false)
    private OffsetDateTime declaradaEm;

    @Column(nullable = false, length = 15)
    private String situacao;

    @Column(name = "conferida_por")
    private Long conferidaPor;

    @Column(name = "conferida_em")
    private OffsetDateTime conferidaEm;

    @Column(name = "motivo_recusa")
    private String motivoRecusa;

    protected AutodeclaracaoReserva() {
    }

    public AutodeclaracaoReserva(Long candidaturaId, String criterio, OffsetDateTime quando) {
        this.id = new AutodeclaracaoReservaId(candidaturaId, criterio);
        this.declaradaEm = quando;
        this.situacao = "DECLARADA";
    }

    public void confirmar(Long pessoaId, OffsetDateTime quando) {
        this.situacao = "CONFIRMADA";
        this.conferidaPor = pessoaId;
        this.conferidaEm = quando;
    }

    public void recusar(Long pessoaId, OffsetDateTime quando, String motivo) {
        this.situacao = "RECUSADA";
        this.conferidaPor = pessoaId;
        this.conferidaEm = quando;
        this.motivoRecusa = motivo;
    }

    public AutodeclaracaoReservaId getId() { return id; }

    public OffsetDateTime getDeclaradaEm() { return declaradaEm; }

    public String getSituacao() { return situacao; }

    public Long getConferidaPor() { return conferidaPor; }

    public OffsetDateTime getConferidaEm() { return conferidaEm; }

    public String getMotivoRecusa() { return motivoRecusa; }
}
