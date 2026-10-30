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
@Table(name = "pessoa")
public class Pessoa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome", nullable = false, length = 160)
    private String nome;

    @Column(name = "email", nullable = false, length = 254)
    private String email;

    @Column(name = "telefone", length = 20)
    private String telefone;

    @Column(name = "senha_hash", nullable = false)
    private String senhaHash;

    @Column(name = "email_confirmado_em")
    private OffsetDateTime emailConfirmadoEm;

    @Column(name = "foto_ref")
    private String fotoRef;

    @Generated
    @Column(name = "criada_em", nullable = false, updatable = false)
    private OffsetDateTime criadaEm;

    @Column(name = "excluida_em")
    private OffsetDateTime excluidaEm;

    protected Pessoa() {
    }

    public Pessoa(String nome, String email, String telefone, String senhaHash) {
        this.nome = nome;
        this.email = email;
        this.telefone = telefone;
        this.senhaHash = senhaHash;
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getEmail() { return email; }
    public String getTelefone() { return telefone; }
    public String getSenhaHash() { return senhaHash; }
    public OffsetDateTime getEmailConfirmadoEm() { return emailConfirmadoEm; }
    public String getFotoRef() { return fotoRef; }
    public OffsetDateTime getCriadaEm() { return criadaEm; }
    public OffsetDateTime getExcluidaEm() { return excluidaEm; }

    public void setNome(String nome) { this.nome = nome; }
    public void setTelefone(String telefone) { this.telefone = telefone; }
    public void setFotoRef(String fotoRef) { this.fotoRef = fotoRef; }
}