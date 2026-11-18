package br.com.uphub.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "reserva_vagas")
public class ReservaVagas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "versao_id", nullable = false)
    private VersaoOportunidade versao;

    @Column(name = "criterio", nullable = false, length = 80)
    private String criterio;

    @Column(name = "quantidade", nullable = false)
    private int quantidade;

    protected ReservaVagas() {
    }

    public ReservaVagas(VersaoOportunidade versao, String criterio, int quantidade) {
        this.versao = versao;
        this.criterio = criterio;
        this.quantidade = quantidade;
    }

    public Long getId() { return id; }

    public VersaoOportunidade getVersao() { return versao; }

    public String getCriterio() { return criterio; }
    public void setCriterio(String criterio) { this.criterio = criterio; }

    public int getQuantidade() { return quantidade; }
    public void setQuantidade(int quantidade) { this.quantidade = quantidade; }
}
