package br.com.uphub.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class SquadIntegranteId implements Serializable {

    @Column(name = "squad_id")
    private Long squadId;

    @Column(name = "pessoa_id")
    private Long pessoaId;

    protected SquadIntegranteId() {
    }

    public SquadIntegranteId(Long squadId, Long pessoaId) {
        this.squadId = squadId;
        this.pessoaId = pessoaId;
    }

    public Long getSquadId() {
        return squadId;
    }

    public Long getPessoaId() {
        return pessoaId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof SquadIntegranteId outro)) {
            return false;
        }
        return Objects.equals(squadId, outro.squadId)
                && Objects.equals(pessoaId, outro.pessoaId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(squadId, pessoaId);
    }
}