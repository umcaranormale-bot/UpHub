package br.com.uphub.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.ColumnTransformer;
import org.hibernate.annotations.Generated;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "candidatura")
public class Candidatura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "oportunidade_id", nullable = false)
    private Long oportunidadeId;

    @Column(name = "versao_id")
    private Long versaoId;

    @Column(name = "organizacao_id", nullable = false)
    private Long organizacaoId;

    @Column(name = "criada_por", nullable = false)
    private Long criadaPor;

    @Column(name = "titulo_proposta", length = 200)
    private String tituloProposta;

    @Column(name = "resumo_executivo", columnDefinition = "text")
    private String resumoExecutivo;

    @Column(name = "valor_solicitado", precision = 14, scale = 2)
    private BigDecimal valorSolicitado;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado;

    @Column(name = "salva_em")
    private OffsetDateTime salvaEm;

    @Column(name = "enviada_em")
    private OffsetDateTime enviadaEm;

    // cópia do perfil da organização no envio (jsonb): o que foi avaliado não muda depois
    @ColumnTransformer(write = "cast(? as jsonb)")
    @Column(name = "perfil_congelado", columnDefinition = "jsonb")
    private String perfilCongelado;

    @Column(name = "posicao_lista")
    private Short posicaoLista;

    @Column(name = "estagio_funil", length = 20)
    private String estagioFunil;

    @Generated
    @Column(name = "criada_em", nullable = false, updatable = false)
    private OffsetDateTime criadaEm;

    protected Candidatura() {
    }

    public Candidatura(Long oportunidadeId, Long organizacaoId, Long criadaPor) {
        this.oportunidadeId = oportunidadeId;
        this.organizacaoId = organizacaoId;
        this.criadaPor = criadaPor;
        this.estado = "RASCUNHO";
    }

    public Long getId() { return id; }

    public Long getOportunidadeId() { return oportunidadeId; }

    public Long getVersaoId() { return versaoId; }

    public Long getOrganizacaoId() { return organizacaoId; }

    public Long getCriadaPor() { return criadaPor; }

    public String getTituloProposta() { return tituloProposta; }
    public void setTituloProposta(String tituloProposta) { this.tituloProposta = tituloProposta; }

    public String getResumoExecutivo() { return resumoExecutivo; }
    public void setResumoExecutivo(String resumoExecutivo) { this.resumoExecutivo = resumoExecutivo; }

    public BigDecimal getValorSolicitado() { return valorSolicitado; }
    public void setValorSolicitado(BigDecimal valorSolicitado) { this.valorSolicitado = valorSolicitado; }

    public String getEstado() { return estado; }

    public OffsetDateTime getSalvaEm() { return salvaEm; }

    public OffsetDateTime getEnviadaEm() { return enviadaEm; }

    public String getPerfilCongelado() { return perfilCongelado; }

    public Short getPosicaoLista() { return posicaoLista; }

    public String getEstagioFunil() { return estagioFunil; }

    public OffsetDateTime getCriadaEm() { return criadaEm; }

    public void marcarSalva(OffsetDateTime quando) { this.salvaEm = quando; }

    // envio: versão, data e perfil gravados juntos (ck_candidatura_envio)
    public void enviar(Long versaoId, OffsetDateTime quando, String perfilCongelado, String estadoDepois) {
        this.versaoId = versaoId;
        this.enviadaEm = quando;
        this.perfilCongelado = perfilCongelado;
        this.estado = estadoDepois;
    }

    // a conferência da transição é da MaquinaDeEstados, no service
    public void mudarEstado(String novo) { this.estado = novo; }

    public void moverNoFunil(String estagio) { this.estagioFunil = estagio; }
}
