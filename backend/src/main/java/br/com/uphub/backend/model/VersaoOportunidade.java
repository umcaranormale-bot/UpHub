package br.com.uphub.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import org.hibernate.annotations.Generated;

@Entity
@Table(name = "versao_oportunidade")
public class VersaoOportunidade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "oportunidade_id", nullable = false)
    private Long oportunidadeId;

    @Column(name = "numero", nullable = false)
    private Integer numero;

    @Column(name = "prazo_envio")
    private LocalDate prazoEnvio;

    @Column(name = "nota_minima", precision = 5, scale = 2)
    private BigDecimal notaMinima;

    @Column(name = "validade_nota_dias", nullable = false)
    private Short validadeNotaDias;

    @Column(name = "prazo_ajuste_dias", nullable = false)
    private Short prazoAjusteDias;

    @Column(name = "escopo", columnDefinition = "text")
    private String escopo;

    @Column(name = "entregaveis", columnDefinition = "text")
    private String entregaveis;

    @Column(name = "carga_semanal_horas")
    private Short cargaSemanalHoras;

    @Column(name = "duracao_semanas")
    private Short duracaoSemanas;

    @Column(name = "quantidade_vagas")
    private Integer quantidadeVagas;

    @Column(name = "criada_por", nullable = false)
    private Long criadaPor;

    @Generated
    @Column(name = "criada_em", nullable = false, updatable = false)
    private OffsetDateTime criadaEm;

    @Column(name = "publicada_em")
    private OffsetDateTime publicadaEm;

    protected VersaoOportunidade() {
    }

    public VersaoOportunidade(Long oportunidadeId, Integer numero, Long criadaPor) {
        this.oportunidadeId = oportunidadeId;
        this.numero = numero;
        this.criadaPor = criadaPor;
        // mesmos padrões do banco (DEFAULT 90 e DEFAULT 7)
        this.validadeNotaDias = 90;
        this.prazoAjusteDias = 7;
    }

    public boolean isPublicada() {
        return publicadaEm != null;
    }

    public Long getId() { return id; }

    public Long getOportunidadeId() { return oportunidadeId; }

    public Integer getNumero() { return numero; }

    public LocalDate getPrazoEnvio() { return prazoEnvio; }
    public void setPrazoEnvio(LocalDate prazoEnvio) { this.prazoEnvio = prazoEnvio; }

    public BigDecimal getNotaMinima() { return notaMinima; }
    public void setNotaMinima(BigDecimal notaMinima) { this.notaMinima = notaMinima; }

    public Short getValidadeNotaDias() { return validadeNotaDias; }
    public void setValidadeNotaDias(Short validadeNotaDias) { this.validadeNotaDias = validadeNotaDias; }

    public Short getPrazoAjusteDias() { return prazoAjusteDias; }
    public void setPrazoAjusteDias(Short prazoAjusteDias) { this.prazoAjusteDias = prazoAjusteDias; }

    public String getEscopo() { return escopo; }
    public void setEscopo(String escopo) { this.escopo = escopo; }

    public String getEntregaveis() { return entregaveis; }
    public void setEntregaveis(String entregaveis) { this.entregaveis = entregaveis; }

    public Short getCargaSemanalHoras() { return cargaSemanalHoras; }
    public void setCargaSemanalHoras(Short cargaSemanalHoras) { this.cargaSemanalHoras = cargaSemanalHoras; }

    public Short getDuracaoSemanas() { return duracaoSemanas; }
    public void setDuracaoSemanas(Short duracaoSemanas) { this.duracaoSemanas = duracaoSemanas; }

    public Integer getQuantidadeVagas() { return quantidadeVagas; }
    public void setQuantidadeVagas(Integer quantidadeVagas) { this.quantidadeVagas = quantidadeVagas; }

    public Long getCriadaPor() { return criadaPor; }

    public OffsetDateTime getCriadaEm() { return criadaEm; }

    public OffsetDateTime getPublicadaEm() { return publicadaEm; }
    public void setPublicadaEm(OffsetDateTime publicadaEm) { this.publicadaEm = publicadaEm; }
}
