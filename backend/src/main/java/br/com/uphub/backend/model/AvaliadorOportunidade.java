package br.com.uphub.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.OffsetDateTime;

// O provedor designa um avaliador (pelo vínculo dele) para avaliar as candidaturas de uma oportunidade.
@Entity
@Table(name = "avaliador_oportunidade")
public class AvaliadorOportunidade {

    @EmbeddedId
    private AvaliadorOportunidadeId id;

    @Column(name = "prazo_avaliacao")
    private LocalDate prazoAvaliacao;

    @Column(name = "designado_por", nullable = false, updatable = false)
    private Long designadoPor;

    @Column(name = "designado_em", nullable = false, updatable = false)
    private OffsetDateTime designadoEm;

    protected AvaliadorOportunidade() {
    }

    public AvaliadorOportunidade(Long oportunidadeId, Long vinculoId, LocalDate prazoAvaliacao, Long designadoPor,
                                 OffsetDateTime designadoEm) {
        this.id = new AvaliadorOportunidadeId(oportunidadeId, vinculoId);
        this.prazoAvaliacao = prazoAvaliacao;
        this.designadoPor = designadoPor;
        this.designadoEm = designadoEm;
    }

    public AvaliadorOportunidadeId getId() { return id; }

    public LocalDate getPrazoAvaliacao() { return prazoAvaliacao; }

    public Long getDesignadoPor() { return designadoPor; }

    public OffsetDateTime getDesignadoEm() { return designadoEm; }
}
