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
@Table(name = "evento_auditoria")
public class EventoAuditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Generated
    @Column(name = "ocorrido_em", nullable = false, insertable = false, updatable = false)
    private OffsetDateTime ocorridoEm;

    @Column(name = "autor_pessoa_id", updatable = false)
    private Long autorPessoaId;

    @Column(name = "autor_sistema", length = 60, updatable = false)
    private String autorSistema;

    @Column(name = "papel", length = 20, updatable = false)
    private String papel;

    @Column(name = "acao", nullable = false, length = 80, updatable = false)
    private String acao;

    @Column(name = "entidade_tipo", nullable = false, length = 40, updatable = false)
    private String entidadeTipo;

    @Column(name = "entidade_id", nullable = false, updatable = false)
    private Long entidadeId;

    @Column(name = "oportunidade_id", updatable = false)
    private Long oportunidadeId;

    @Column(name = "candidatura_id", updatable = false)
    private Long candidaturaId;

    @Column(name = "versao_id", updatable = false)
    private Long versaoId;

    @Column(name = "estado_anterior", length = 30, updatable = false)
    private String estadoAnterior;

    @Column(name = "estado_novo", length = 30, updatable = false)
    private String estadoNovo;

    @Column(name = "justificativa", columnDefinition = "text", updatable = false)
    private String justificativa;

    protected EventoAuditoria() {
    }

    public EventoAuditoria(Long autorPessoaId, String autorSistema, String papel,
                           String acao, String entidadeTipo, Long entidadeId,
                           Long oportunidadeId, Long candidaturaId, Long versaoId,
                           String estadoAnterior, String estadoNovo, String justificativa) {
        this.autorPessoaId = autorPessoaId;
        this.autorSistema = autorSistema;
        this.papel = papel;
        this.acao = acao;
        this.entidadeTipo = entidadeTipo;
        this.entidadeId = entidadeId;
        this.oportunidadeId = oportunidadeId;
        this.candidaturaId = candidaturaId;
        this.versaoId = versaoId;
        this.estadoAnterior = estadoAnterior;
        this.estadoNovo = estadoNovo;
        this.justificativa = justificativa;
    }

    public Long getId() { return id; }
    public OffsetDateTime getOcorridoEm() { return ocorridoEm; }
    public Long getAutorPessoaId() { return autorPessoaId; }
    public String getAutorSistema() { return autorSistema; }
    public String getPapel() { return papel; }
    public String getAcao() { return acao; }
    public String getEntidadeTipo() { return entidadeTipo; }
    public Long getEntidadeId() { return entidadeId; }
    public Long getOportunidadeId() { return oportunidadeId; }
    public Long getCandidaturaId() { return candidaturaId; }
    public Long getVersaoId() { return versaoId; }
    public String getEstadoAnterior() { return estadoAnterior; }
    public String getEstadoNovo() { return estadoNovo; }
    public String getJustificativa() { return justificativa; }
}