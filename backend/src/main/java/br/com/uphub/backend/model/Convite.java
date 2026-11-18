package br.com.uphub.backend.model;

import java.time.OffsetDateTime;

import org.hibernate.annotations.Generated;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "convite")
public class Convite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "email", nullable = false, length = 254)
    private String email;

    @Column(name = "papel", nullable = false, length = 20)
    private String papel;

    @Column(name = "organizacao_id", nullable = false)
    private Long organizacaoId;

    @Column(name = "enviado_por", nullable = false)
    private Long enviadoPor;

    @Generated
    @Column(name = "enviado_em", nullable = false, updatable = false)
    private OffsetDateTime enviadoEm;

    @Column(name = "expira_em", nullable = false)
    private OffsetDateTime expiraEm;

    @Column(name = "situacao", nullable = false, length = 15)
    private String situacao;

    @Column(name = "aceito_em")
    private OffsetDateTime aceitoEm;

    @Column(name = "pessoa_id")
    private Long pessoaId;

    @Column(name = "token_hash", nullable = false, length = 64)
    private String tokenHash;

    protected Convite() {
    }

    public Convite(String email, String papel, Long organizacaoId, Long enviadoPor,
                   OffsetDateTime expiraEm, String tokenHash) {
        this.email = email;
        this.papel = papel;
        this.organizacaoId = organizacaoId;
        this.enviadoPor = enviadoPor;
        this.expiraEm = expiraEm;
        this.tokenHash = tokenHash;
        this.situacao = "AGUARDANDO";
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getPapel() { return papel; }
    public Long getOrganizacaoId() { return organizacaoId; }
    public Long getEnviadoPor() { return enviadoPor; }
    public OffsetDateTime getEnviadoEm() { return enviadoEm; }
    public OffsetDateTime getExpiraEm() { return expiraEm; }
    public String getSituacao() { return situacao; }
    public OffsetDateTime getAceitoEm() { return aceitoEm; }
    public Long getPessoaId() { return pessoaId; }
    public String getTokenHash() { return tokenHash; }


    public boolean aguardando() {
        return "AGUARDANDO".equals(situacao);
    }

    public boolean vencido() {
        return expiraEm.isBefore(OffsetDateTime.now());
    }

    public void aceitar(Long pessoaId) {
        this.situacao = "ACEITO";
        this.aceitoEm = OffsetDateTime.now();
        this.pessoaId = pessoaId;
    }

    public void recusar() {
        this.situacao = "RECUSADO";
    }

    public void expirar() {
        this.situacao = "EXPIRADO";
    }
}