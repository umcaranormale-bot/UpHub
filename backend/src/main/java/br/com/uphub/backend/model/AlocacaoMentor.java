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

// O provedor convida um mentor para acompanhar uma candidatura homologada, com as horas por mês.
@Entity
@Table(name = "alocacao_mentor")
public class AlocacaoMentor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "vinculo_id", nullable = false, updatable = false)
    private Long vinculoId;

    @Column(name = "candidatura_id", nullable = false, updatable = false)
    private Long candidaturaId;

    @Column(name = "horas_previstas_mes", nullable = false, precision = 5, scale = 1)
    private BigDecimal horasPrevistasMes;

    @Column(name = "prazo_resposta", nullable = false)
    private LocalDate prazoResposta;

    @Column(nullable = false, length = 15)
    private String situacao;

    @Column(name = "convidada_por", nullable = false, updatable = false)
    private Long convidadaPor;

    @Column(name = "convidada_em", nullable = false, updatable = false)
    private OffsetDateTime convidadaEm;

    @Column(name = "respondida_em")
    private OffsetDateTime respondidaEm;

    protected AlocacaoMentor() {
    }

    public AlocacaoMentor(Long vinculoId, Long candidaturaId, BigDecimal horasPrevistasMes, LocalDate prazoResposta,
                          Long convidadaPor, OffsetDateTime quando) {
        this.vinculoId = vinculoId;
        this.candidaturaId = candidaturaId;
        this.horasPrevistasMes = horasPrevistasMes;
        this.prazoResposta = prazoResposta;
        this.convidadaPor = convidadaPor;
        this.convidadaEm = quando;
        this.situacao = "PENDENTE";
    }

    public void responder(boolean aceita, OffsetDateTime quando) {
        this.situacao = aceita ? "ACEITA" : "RECUSADA";
        this.respondidaEm = quando;
    }

    public void expirar() {
        this.situacao = "EXPIRADA";
    }

    public Long getId() { return id; }

    public Long getVinculoId() { return vinculoId; }

    public Long getCandidaturaId() { return candidaturaId; }

    public BigDecimal getHorasPrevistasMes() { return horasPrevistasMes; }

    public LocalDate getPrazoResposta() { return prazoResposta; }

    public String getSituacao() { return situacao; }

    public Long getConvidadaPor() { return convidadaPor; }

    public OffsetDateTime getConvidadaEm() { return convidadaEm; }

    public OffsetDateTime getRespondidaEm() { return respondidaEm; }
}
