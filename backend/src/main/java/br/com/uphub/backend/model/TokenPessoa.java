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
@Table(name = "token_pessoa")
public class TokenPessoa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "pessoa_id", nullable = false)
    private Long pessoaId;

    @Column(name = "finalidade", nullable = false, length = 20)
    private String finalidade;

    @Column(name = "token_hash", nullable = false, length = 64)
    private String tokenHash;

    @Generated
    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm;

    @Column(name = "expira_em", nullable = false)
    private OffsetDateTime expiraEm;

    @Column(name = "usado_em")
    private OffsetDateTime usadoEm;

    @Column(name = "cancelado_em")
    private OffsetDateTime canceladoEm;

    @Column(name = "tentativas", nullable = false)
    private short tentativas;

    protected TokenPessoa() {
    }

    public TokenPessoa(Long pessoaId, String finalidade, String tokenHash, OffsetDateTime expiraEm) {
        this.pessoaId = pessoaId;
        this.finalidade = finalidade;
        this.tokenHash = tokenHash;
        this.expiraEm = expiraEm;
        this.tentativas = 0;
    }

    public void marcarUsado() {
        this.usadoEm = OffsetDateTime.now();
    }

    public void cancelar() {
        this.canceladoEm = OffsetDateTime.now();
    }

    public void registrarTentativaErrada() {
        this.tentativas++;
    }

    public boolean expirado() {
        return OffsetDateTime.now().isAfter(expiraEm);
    }

    public boolean esgotouTentativas() {
        return tentativas >= 5;
    }

    public Long getId() { return id; }
    public Long getPessoaId() { return pessoaId; }
    public String getFinalidade() { return finalidade; }
    public String getTokenHash() { return tokenHash; }
    public OffsetDateTime getCriadoEm() { return criadoEm; }
    public OffsetDateTime getExpiraEm() { return expiraEm; }
    public OffsetDateTime getUsadoEm() { return usadoEm; }
    public OffsetDateTime getCanceladoEm() { return canceladoEm; }
    public short getTentativas() { return tentativas; }
}