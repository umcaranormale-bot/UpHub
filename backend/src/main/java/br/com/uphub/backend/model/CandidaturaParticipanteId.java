package br.com.uphub.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class CandidaturaParticipanteId implements Serializable {

    @Column(name = "candidatura_id")
    private Long candidaturaId;

    @Column(name = "pessoa_id")
    private Long pessoaId;

    protected CandidaturaParticipanteId() {
    }

    public CandidaturaParticipanteId(Long candidaturaId, Long pessoaId) {
        this.candidaturaId = candidaturaId;
        this.pessoaId = pessoaId;
    }

    public Long getCandidaturaId() {
        return candidaturaId;
    }

    public Long getPessoaId() {
        return pessoaId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof CandidaturaParticipanteId outro)) {
            return false;
        }
        return Objects.equals(candidaturaId, outro.candidaturaId) && Objects.equals(pessoaId, outro.pessoaId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(candidaturaId, pessoaId);
    }
}
