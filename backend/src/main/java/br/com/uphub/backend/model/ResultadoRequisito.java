package br.com.uphub.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

// O que o motor de elegibilidade decidiu em cada requisito, no momento do envio.
@Entity
@Table(name = "resultado_requisito")
public class ResultadoRequisito {

    @EmbeddedId
    private ResultadoRequisitoId id;

    @Column(nullable = false, length = 15)
    private String situacao;

    @Column(name = "valor_informado")
    private String valorInformado;

    @Column(name = "avaliado_em", nullable = false, updatable = false)
    private OffsetDateTime avaliadoEm;

    protected ResultadoRequisito() {
    }

    public ResultadoRequisito(Long candidaturaId, Long requisitoId, String situacao, String valorInformado,
                              OffsetDateTime avaliadoEm) {
        this.id = new ResultadoRequisitoId(candidaturaId, requisitoId);
        this.situacao = situacao;
        this.valorInformado = valorInformado;
        this.avaliadoEm = avaliadoEm;
    }

    public ResultadoRequisitoId getId() { return id; }

    public String getSituacao() { return situacao; }

    public String getValorInformado() { return valorInformado; }

    public OffsetDateTime getAvaliadoEm() { return avaliadoEm; }
}
