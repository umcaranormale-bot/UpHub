package br.com.uphub.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;

// Oportunidade que a organização candidata guardou para acompanhar (V38). É da organização, não da pessoa.
@Entity
@Table(name = "oportunidade_favorita")
public class OportunidadeFavorita {

    @EmbeddedId
    private OportunidadeFavoritaId id;

    @Column(name = "favoritada_por", nullable = false, updatable = false)
    private Long favoritadaPor;

    @Column(name = "favoritada_em", nullable = false, updatable = false)
    private OffsetDateTime favoritadaEm;

    protected OportunidadeFavorita() {
    }

    public OportunidadeFavorita(Long organizacaoId, Long oportunidadeId, Long favoritadaPor, OffsetDateTime quando) {
        this.id = new OportunidadeFavoritaId(organizacaoId, oportunidadeId);
        this.favoritadaPor = favoritadaPor;
        this.favoritadaEm = quando;
    }

    public OportunidadeFavoritaId getId() { return id; }

    public Long getFavoritadaPor() { return favoritadaPor; }

    public OffsetDateTime getFavoritadaEm() { return favoritadaEm; }
}
