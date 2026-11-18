package br.com.uphub.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

// O avaliador pede ajuste; a organização corrige e reenvia dentro do prazo, ou perde o prazo.
@Entity
@Table(name = "pedido_ajuste")
public class PedidoAjuste {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "candidatura_id", nullable = false, updatable = false)
    private Long candidaturaId;

    @Column(name = "avaliacao_id", nullable = false, updatable = false)
    private Long avaliacaoId;

    @Column(name = "pedido_em", nullable = false, updatable = false)
    private OffsetDateTime pedidoEm;

    @Column(name = "prazo_reenvio", nullable = false)
    private OffsetDateTime prazoReenvio;

    @Column(nullable = false, length = 15)
    private String situacao;

    @Column
    private String resposta;

    @Column(name = "reenviado_em")
    private OffsetDateTime reenviadoEm;

    @Column(name = "reenviado_por")
    private Long reenviadoPor;

    @Column(name = "prazo_perdido_em")
    private OffsetDateTime prazoPerdidoEm;

    @Column(name = "reaberto_em")
    private OffsetDateTime reabertoEm;

    @Column(name = "reaberto_por")
    private Long reabertoPor;

    protected PedidoAjuste() {
    }

    public PedidoAjuste(Long candidaturaId, Long avaliacaoId, OffsetDateTime quando, OffsetDateTime prazo) {
        this.candidaturaId = candidaturaId;
        this.avaliacaoId = avaliacaoId;
        this.pedidoEm = quando;
        this.prazoReenvio = prazo;
        this.situacao = "AGUARDANDO";
    }

    public void novoPrazo(OffsetDateTime prazo) {
        this.prazoReenvio = prazo;
    }

    public void reenviar(String resposta, Long pessoaId, OffsetDateTime quando) {
        this.situacao = "REENVIADO";
        this.resposta = resposta;
        this.reenviadoPor = pessoaId;
        this.reenviadoEm = quando;
    }

    public void perderPrazo(OffsetDateTime quando) {
        this.situacao = "PERDA_DE_PRAZO";
        this.prazoPerdidoEm = quando;
    }

    public void reabrir(Long pessoaId, OffsetDateTime quando, OffsetDateTime prazo) {
        this.situacao = "AGUARDANDO";
        this.reabertoPor = pessoaId;
        this.reabertoEm = quando;
        this.prazoReenvio = prazo;
    }

    public Long getId() { return id; }

    public Long getCandidaturaId() { return candidaturaId; }

    public Long getAvaliacaoId() { return avaliacaoId; }

    public OffsetDateTime getPedidoEm() { return pedidoEm; }

    public OffsetDateTime getPrazoReenvio() { return prazoReenvio; }

    public String getSituacao() { return situacao; }

    public String getResposta() { return resposta; }

    public OffsetDateTime getReenviadoEm() { return reenviadoEm; }

    public Long getReenviadoPor() { return reenviadoPor; }

    public OffsetDateTime getPrazoPerdidoEm() { return prazoPerdidoEm; }

    public OffsetDateTime getReabertoEm() { return reabertoEm; }

    public Long getReabertoPor() { return reabertoPor; }
}
