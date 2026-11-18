package br.com.uphub.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.OffsetDateTime;

// Uma sessão do mentor com a organização: data, duração e feedback. Assinada, não muda mais.
@Entity
@Table(name = "sessao_mentoria")
public class SessaoMentoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "alocacao_id", nullable = false, updatable = false)
    private Long alocacaoId;

    @Column(name = "sprint_id")
    private Long sprintId;

    @Column(name = "data_sessao", nullable = false)
    private LocalDate dataSessao;

    @Column(name = "duracao_minutos", nullable = false)
    private Short duracaoMinutos;

    @Column
    private String feedback;

    @Column(nullable = false, length = 10)
    private String situacao;

    @Column(name = "assinado_em")
    private OffsetDateTime assinadoEm;

    @Column(name = "registrada_em", nullable = false, updatable = false)
    private OffsetDateTime registradaEm;

    protected SessaoMentoria() {
    }

    public SessaoMentoria(Long alocacaoId, OffsetDateTime quando) {
        this.alocacaoId = alocacaoId;
        this.registradaEm = quando;
        this.situacao = "RASCUNHO";
    }

    public void preencher(Long sprintId, LocalDate dataSessao, Short duracaoMinutos, String feedback) {
        this.sprintId = sprintId;
        this.dataSessao = dataSessao;
        this.duracaoMinutos = duracaoMinutos;
        this.feedback = feedback;
    }

    public void assinar(OffsetDateTime quando) {
        this.situacao = "ASSINADO";
        this.assinadoEm = quando;
    }

    public boolean assinada() { return "ASSINADO".equals(situacao); }

    public Long getId() { return id; }

    public Long getAlocacaoId() { return alocacaoId; }

    public Long getSprintId() { return sprintId; }

    public LocalDate getDataSessao() { return dataSessao; }

    public Short getDuracaoMinutos() { return duracaoMinutos; }

    public String getFeedback() { return feedback; }

    public String getSituacao() { return situacao; }

    public OffsetDateTime getAssinadoEm() { return assinadoEm; }

    public OffsetDateTime getRegistradaEm() { return registradaEm; }
}
