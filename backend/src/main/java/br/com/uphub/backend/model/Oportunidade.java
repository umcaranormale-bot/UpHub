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
@Table(name = "oportunidade")
public class Oportunidade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "organizacao_id", nullable = false)
    private Long organizacaoId;

    @Column(name = "trilha_codigo", nullable = false, length = 20)
    private String trilhaCodigo;

    @Column(name = "titulo", nullable = false, length = 200)
    private String titulo;

    @Column(name = "resumo", columnDefinition = "text")
    private String resumo;

    @Column(name = "estado", nullable = false, length = 15)
    private String estado;

    @Column(name = "criada_por", nullable = false)
    private Long criadaPor;

    @Generated
    @Column(name = "criada_em", nullable = false, updatable = false)
    private OffsetDateTime criadaEm;

    @Column(name = "publicada_em")
    private OffsetDateTime publicadaEm;

    @Column(name = "encerrada_em")
    private OffsetDateTime encerradaEm;

    protected Oportunidade() {
    }

    public Oportunidade(Long organizacaoId, String trilhaCodigo, String titulo,
                        String resumo, Long criadaPor) {
        this.organizacaoId = organizacaoId;
        this.trilhaCodigo = trilhaCodigo;
        this.titulo = titulo;
        this.resumo = resumo;
        this.criadaPor = criadaPor;
        this.estado = "RASCUNHO";
    }

    public Long getId() { return id; }

    public Long getOrganizacaoId() { return organizacaoId; }
    public void setOrganizacaoId(Long organizacaoId) { this.organizacaoId = organizacaoId; }

    public String getTrilhaCodigo() { return trilhaCodigo; }
    public void setTrilhaCodigo(String trilhaCodigo) { this.trilhaCodigo = trilhaCodigo; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getResumo() { return resumo; }
    public void setResumo(String resumo) { this.resumo = resumo; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public Long getCriadaPor() { return criadaPor; }
    public void setCriadaPor(Long criadaPor) { this.criadaPor = criadaPor; }

    public OffsetDateTime getCriadaEm() { return criadaEm; }

    public OffsetDateTime getPublicadaEm() { return publicadaEm; }
    public void setPublicadaEm(OffsetDateTime publicadaEm) { this.publicadaEm = publicadaEm; }

    public OffsetDateTime getEncerradaEm() { return encerradaEm; }
    public void setEncerradaEm(OffsetDateTime encerradaEm) { this.encerradaEm = encerradaEm; }
}