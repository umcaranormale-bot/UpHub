package br.com.uphub.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

// Um ponto que o avaliador pediu para corrigir. Pode apontar um documento exigido a trocar.
@Entity
@Table(name = "item_ajuste")
public class ItemAjuste {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "pedido_ajuste_id", nullable = false, updatable = false)
    private Long pedidoAjusteId;

    @Column(nullable = false, length = 200, updatable = false)
    private String descricao;

    @Column(updatable = false)
    private String detalhe;

    @Column(name = "documento_exigido_id", updatable = false)
    private Long documentoExigidoId;

    @Column(name = "documento_novo_id")
    private Long documentoNovoId;

    @Column(name = "corrigido_em")
    private OffsetDateTime corrigidoEm;

    protected ItemAjuste() {
    }

    public ItemAjuste(Long pedidoAjusteId, String descricao, String detalhe, Long documentoExigidoId) {
        this.pedidoAjusteId = pedidoAjusteId;
        this.descricao = descricao;
        this.detalhe = detalhe;
        this.documentoExigidoId = documentoExigidoId;
    }

    public void corrigir(Long documentoNovoId, OffsetDateTime quando) {
        this.documentoNovoId = documentoNovoId;
        this.corrigidoEm = quando;
    }

    public boolean corrigido() { return corrigidoEm != null; }

    public Long getId() { return id; }

    public Long getPedidoAjusteId() { return pedidoAjusteId; }

    public String getDescricao() { return descricao; }

    public String getDetalhe() { return detalhe; }

    public Long getDocumentoExigidoId() { return documentoExigidoId; }

    public Long getDocumentoNovoId() { return documentoNovoId; }

    public OffsetDateTime getCorrigidoEm() { return corrigidoEm; }
}
