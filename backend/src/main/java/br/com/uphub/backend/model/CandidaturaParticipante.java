package br.com.uphub.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;

// Quem da organização participa da candidatura, com a confirmação de cada um.
@Entity
@Table(name = "candidatura_participante")
public class CandidaturaParticipante {

    @EmbeddedId
    private CandidaturaParticipanteId id;

    @Column(name = "convite_enviado_em")
    private OffsetDateTime conviteEnviadoEm;

    @Column(name = "confirmou_em")
    private OffsetDateTime confirmouEm;

    protected CandidaturaParticipante() {
    }

    public CandidaturaParticipante(Long candidaturaId, Long pessoaId, OffsetDateTime conviteEnviadoEm) {
        this.id = new CandidaturaParticipanteId(candidaturaId, pessoaId);
        this.conviteEnviadoEm = conviteEnviadoEm;
    }

    public CandidaturaParticipanteId getId() { return id; }

    public OffsetDateTime getConviteEnviadoEm() { return conviteEnviadoEm; }

    public OffsetDateTime getConfirmouEm() { return confirmouEm; }

    public boolean confirmou() { return confirmouEm != null; }

    public void confirmar(OffsetDateTime quando) { this.confirmouEm = quando; }
}
