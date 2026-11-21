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
@Table(name = "notificacao")
public class Notificacao {

    public static final String PEDE_ACAO = "PEDE_ACAO";
    public static final String INFORMATIVA = "INFORMATIVA";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "pessoa_id", nullable = false, updatable = false)
    private Long pessoaId;

    @Column(name = "oportunidade_id", updatable = false)
    private Long oportunidadeId;

    @Column(name = "titulo", nullable = false, length = 160, updatable = false)
    private String titulo;

    @Column(name = "mensagem", columnDefinition = "text", updatable = false)
    private String mensagem;

    @Column(name = "tipo", nullable = false, length = 15, updatable = false)
    private String tipo;

    @Generated
    @Column(name = "criada_em", nullable = false, insertable = false, updatable = false)
    private OffsetDateTime criadaEm;

    @Column(name = "lida_em")
    private OffsetDateTime lidaEm;

    @Column(name = "email_enviado_em")
    private OffsetDateTime emailEnviadoEm;

    protected Notificacao() {
    }

    public Notificacao(Long pessoaId, Long oportunidadeId, String titulo, String mensagem, String tipo) {
        this.pessoaId = pessoaId;
        this.oportunidadeId = oportunidadeId;
        this.titulo = titulo;
        this.mensagem = mensagem;
        this.tipo = tipo;
    }

    public void marcarLida(OffsetDateTime quando) {
        if (this.lidaEm == null) {
            this.lidaEm = quando;
        }
    }

    // só a PEDE_ACAO manda e-mail (ck_notificacao_email)
    public void marcarEmailEnviado(OffsetDateTime quando) {
        if (!PEDE_ACAO.equals(tipo)) {
            throw new IllegalStateException("Só a notificação PEDE_ACAO manda e-mail");
        }
        this.emailEnviadoEm = quando;
    }

    public boolean lida() {
        return lidaEm != null;
    }

    public Long getId() { return id; }
    public Long getPessoaId() { return pessoaId; }
    public Long getOportunidadeId() { return oportunidadeId; }
    public String getTitulo() { return titulo; }
    public String getMensagem() { return mensagem; }
    public String getTipo() { return tipo; }
    public OffsetDateTime getCriadaEm() { return criadaEm; }
    public OffsetDateTime getLidaEm() { return lidaEm; }
    public OffsetDateTime getEmailEnviadoEm() { return emailEnviadoEm; }
}