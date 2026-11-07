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
import java.time.OffsetDateTime;
import org.hibernate.annotations.Generated;

@Entity
@Table(name = "solicitacao_provedor")
public class SolicitacaoProvedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organizacao_id", nullable = false)
    private Organizacao organizacao;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "solicitante_id", nullable = false)
    private Pessoa solicitante;

    @Column(name = "email_institucional", nullable = false, length = 254)
    private String emailInstitucional;

    @Column(name = "documento_id")
    private Long documentoId;

    @Generated
    @Column(name = "pedida_em", nullable = false, updatable = false)
    private OffsetDateTime pedidaEm;

    @Generated
    @Column(name = "situacao", nullable = false, length = 15)
    private String situacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "decidida_por")
    private Pessoa decididaPor;

    @Column(name = "decidida_em")
    private OffsetDateTime decididaEm;

    @Column(name = "motivo", columnDefinition = "text")
    private String motivo;

    @Generated
    @Column(name = "recusa_por_documento", nullable = false)
    private boolean recusaPorDocumento;

    @Column(name = "solicitacao_anterior_id")
    private Long solicitacaoAnteriorId;

    @Column(name = "resposta_recusa", columnDefinition = "text")
    private String respostaRecusa;

    protected SolicitacaoProvedor() {
    }

    public SolicitacaoProvedor(Organizacao organizacao, Pessoa solicitante,
                               String emailInstitucional, Long documentoId) {
        this.organizacao = organizacao;
        this.solicitante = solicitante;
        this.emailInstitucional = emailInstitucional;
        this.documentoId = documentoId;
    }

    public Long getId() {
        return id;
    }

    public Organizacao getOrganizacao() {
        return organizacao;
    }

    public Pessoa getSolicitante() {
        return solicitante;
    }

    public String getEmailInstitucional() {
        return emailInstitucional;
    }

    public Long getDocumentoId() {
        return documentoId;
    }

    public OffsetDateTime getPedidaEm() {
        return pedidaEm;
    }

    public String getSituacao() {
        return situacao;
    }

    public Pessoa getDecididaPor() {
        return decididaPor;
    }

    public OffsetDateTime getDecididaEm() {
        return decididaEm;
    }

    public String getMotivo() {
        return motivo;
    }

    public boolean isRecusaPorDocumento() {
        return recusaPorDocumento;
    }

    public Long getSolicitacaoAnteriorId() {
        return solicitacaoAnteriorId;
    }

    public String getRespostaRecusa() {
        return respostaRecusa;
    }
}