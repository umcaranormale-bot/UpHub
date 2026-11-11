package br.com.uphub.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import org.hibernate.annotations.Generated;

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
    public void setEmail(String email) { this.email = email; }

    public String getPapel() { return papel; }
    public void setPapel(String papel) { this.papel = papel; }

    public Long getOrganizacaoId() { return organizacaoId; }
    public void setOrganizacaoId(Long organizacaoId) { this.organizacaoId = organizacaoId; }

    public Long getEnviadoPor() { return enviadoPor; }
    public void setEnviadoPor(Long enviadoPor) { this.enviadoPor = enviadoPor; }

    public OffsetDateTime getEnviadoEm() { return enviadoEm; }

    public OffsetDateTime getExpiraEm() { return expiraEm; }
    public void setExpiraEm(OffsetDateTime expiraEm) { this.expiraEm = expiraEm; }

    public String getSituacao() { return situacao; }
    public void setSituacao(String situacao) { this.situacao = situacao; }

    public OffsetDateTime getAceitoEm() { return aceitoEm; }
    public void setAceitoEm(OffsetDateTime aceitoEm) { this.aceitoEm = aceitoEm; }

    public Long getPessoaId() { return pessoaId; }
    public void setPessoaId(Long pessoaId) { this.pessoaId = pessoaId; }

    public String getTokenHash() { return tokenHash; }
}