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
import java.time.LocalDate;
import java.time.OffsetDateTime;
import org.hibernate.annotations.Generated;

@Entity
@Table(name = "documento")
public class Documento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organizacao_id", nullable = false)
    private Organizacao organizacao;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "enviado_por", nullable = false)
    private Pessoa enviadoPor;

    @Column(name = "tipo", nullable = false, length = 60)
    private String tipo;

    @Column(name = "nome_arquivo", nullable = false, length = 255)
    private String nomeArquivo;

    @Column(name = "tamanho_bytes", nullable = false)
    private long tamanhoBytes;

    @Column(name = "tipo_mime", length = 100)
    private String tipoMime;

    @Column(name = "armazenamento_ref", nullable = false, columnDefinition = "text")
    private String armazenamentoRef;

    @Column(name = "validade")
    private LocalDate validade;

    @Column(name = "texto_pesquisavel")
    private Boolean textoPesquisavel;

    @Generated
    @Column(name = "enviado_em", nullable = false, updatable = false)
    private OffsetDateTime enviadoEm;

    protected Documento() {
    }

    public Documento(Organizacao organizacao, Pessoa enviadoPor, String tipo,
                     String nomeArquivo, long tamanhoBytes, String tipoMime,
                     String armazenamentoRef, LocalDate validade,
                     Boolean textoPesquisavel) {
        this.organizacao = organizacao;
        this.enviadoPor = enviadoPor;
        this.tipo = tipo;
        this.nomeArquivo = nomeArquivo;
        this.tamanhoBytes = tamanhoBytes;
        this.tipoMime = tipoMime;
        this.armazenamentoRef = armazenamentoRef;
        this.validade = validade;
        this.textoPesquisavel = textoPesquisavel;
    }

    public Long getId() {
        return id;
    }

    public Organizacao getOrganizacao() {
        return organizacao;
    }

    public Pessoa getEnviadoPor() {
        return enviadoPor;
    }

    public String getTipo() {
        return tipo;
    }

    public String getNomeArquivo() {
        return nomeArquivo;
    }

    public long getTamanhoBytes() {
        return tamanhoBytes;
    }

    public String getTipoMime() {
        return tipoMime;
    }

    public String getArmazenamentoRef() {
        return armazenamentoRef;
    }

    public LocalDate getValidade() {
        return validade;
    }

    public Boolean getTextoPesquisavel() {
        return textoPesquisavel;
    }

    public OffsetDateTime getEnviadoEm() {
        return enviadoEm;
    }
}