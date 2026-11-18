package br.com.uphub.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

// O avaliador corrige o texto do parecer depois de assinar, com justificativa. O original fica guardado.
@Entity
@Table(name = "retificacao_parecer")
public class RetificacaoParecer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "avaliacao_id", nullable = false, updatable = false)
    private Long avaliacaoId;

    @Column(name = "parecer_retificado", nullable = false, updatable = false)
    private String parecerRetificado;

    @Column(nullable = false, updatable = false)
    private String justificativa;

    @Column(name = "retificada_por", nullable = false, updatable = false)
    private Long retificadaPor;

    @Column(name = "retificada_em", nullable = false, updatable = false)
    private OffsetDateTime retificadaEm;

    protected RetificacaoParecer() {
    }

    public RetificacaoParecer(Long avaliacaoId, String parecerRetificado, String justificativa, Long retificadaPor,
                              OffsetDateTime quando) {
        this.avaliacaoId = avaliacaoId;
        this.parecerRetificado = parecerRetificado;
        this.justificativa = justificativa;
        this.retificadaPor = retificadaPor;
        this.retificadaEm = quando;
    }

    public Long getId() { return id; }

    public Long getAvaliacaoId() { return avaliacaoId; }

    public String getParecerRetificado() { return parecerRetificado; }

    public String getJustificativa() { return justificativa; }

    public Long getRetificadaPor() { return retificadaPor; }

    public OffsetDateTime getRetificadaEm() { return retificadaEm; }
}
