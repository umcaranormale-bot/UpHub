package br.com.uphub.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

@Entity
@Table(name = "squad_integrante")
public class SquadIntegrante {

    @EmbeddedId
    private SquadIntegranteId id;

    @MapsId("squadId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "squad_id")
    private Squad squad;

    @MapsId("pessoaId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pessoa_id")
    private Pessoa pessoa;

    @Column(name = "competencia", length = 120)
    private String competencia;

    protected SquadIntegrante() {
    }

    public SquadIntegrante(Squad squad, Pessoa pessoa, String competencia) {
        this.id = new SquadIntegranteId(squad.getOrganizacaoId(), pessoa.getId());
        this.squad = squad;
        this.pessoa = pessoa;
        this.competencia = competencia;
    }

    public SquadIntegranteId getId() {
        return id;
    }

    public Squad getSquad() {
        return squad;
    }

    public Pessoa getPessoa() {
        return pessoa;
    }

    public String getCompetencia() {
        return competencia;
    }
}