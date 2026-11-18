package br.com.uphub.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;

// Primeira e última vez que uma organização abriu a oportunidade (funil de alcance).
@Entity
@Table(name = "visualizacao_oportunidade")
public class VisualizacaoOportunidade {

    @EmbeddedId
    private VisualizacaoOportunidadeId id;

    @Column(name = "primeira_em", nullable = false, updatable = false)
    private OffsetDateTime primeiraEm;

    @Column(name = "ultima_em", nullable = false)
    private OffsetDateTime ultimaEm;

    protected VisualizacaoOportunidade() {
    }

    public VisualizacaoOportunidade(Long oportunidadeId, Long organizacaoId, OffsetDateTime quando) {
        this.id = new VisualizacaoOportunidadeId(oportunidadeId, organizacaoId);
        this.primeiraEm = quando;
        this.ultimaEm = quando;
    }

    public VisualizacaoOportunidadeId getId() { return id; }

    public OffsetDateTime getPrimeiraEm() { return primeiraEm; }

    public OffsetDateTime getUltimaEm() { return ultimaEm; }

    // viu de novo: só a última data muda
    public void viuDeNovo(OffsetDateTime quando) { this.ultimaEm = quando; }
}
