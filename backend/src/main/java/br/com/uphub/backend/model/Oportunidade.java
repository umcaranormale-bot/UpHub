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

    @Column(name = "suspensa_em")
    private OffsetDateTime suspensaEm;

    // V43: área de atuação (para o matching) e tese de investimento (só na trilha INVESTIMENTO)
    @Column(name = "area", length = 80)
    private String area;

    @Column(name = "tese")
    private String tese;

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

    public String getTrilhaCodigo() { return trilhaCodigo; }

    public String getTitulo() { return titulo; }

    public String getResumo() { return resumo; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public Long getCriadaPor() { return criadaPor; }

    public OffsetDateTime getCriadaEm() { return criadaEm; }

    public OffsetDateTime getPublicadaEm() { return publicadaEm; }
    public void setPublicadaEm(OffsetDateTime publicadaEm) { this.publicadaEm = publicadaEm; }

    public OffsetDateTime getEncerradaEm() { return encerradaEm; }
    public void setEncerradaEm(OffsetDateTime encerradaEm) { this.encerradaEm = encerradaEm; }

    public OffsetDateTime getSuspensaEm() { return suspensaEm; }

    public boolean suspensa() { return suspensaEm != null; }

    // revogação da permissão do provedor: a oportunidade para (nenhuma etapa anda, nenhum prazo vence)
    public void suspender(OffsetDateTime quando) { this.suspensaEm = quando; }

    // nova aprovação do provedor: a oportunidade volta a andar
    public void retomar() { this.suspensaEm = null; }

    public String getArea() { return area; }

    public String getTese() { return tese; }

    // só enquanto é rascunho; campo null = "não alterar", texto vazio = "apagar"
    public void editar(String titulo, String resumo, String area, String tese) {
        if (titulo != null) {
            this.titulo = titulo;
        }
        if (resumo != null) {
            this.resumo = resumo.isBlank() ? null : resumo;
        }
        if (area != null) {
            this.area = area.isBlank() ? null : area;
        }
        if (tese != null) {
            this.tese = tese.isBlank() ? null : tese;
        }
    }
}
