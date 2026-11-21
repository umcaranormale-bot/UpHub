package br.com.uphub.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.OffsetDateTime;

// A residência que a coordenação (gestão do Porto Digital) abre: junta as squads e os desafios da trilha Formação.
@Entity
@Table(name = "residencia")
public class Residencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String nome;

    @Column
    private String descricao;

    @Column(nullable = false, length = 40, updatable = false)
    private String codigo;

    @Column(nullable = false)
    private LocalDate inicio;

    @Column(nullable = false)
    private LocalDate fim;

    @Column(nullable = false, length = 15)
    private String estado;

    @Column(name = "criada_por", nullable = false, updatable = false)
    private Long criadaPor;

    @Column(name = "criada_em", nullable = false, updatable = false)
    private OffsetDateTime criadaEm;

    @Column(name = "encerrada_em")
    private OffsetDateTime encerradaEm;

    protected Residencia() {
    }

    public Residencia(String nome, String descricao, String codigo, LocalDate inicio, LocalDate fim, Long criadaPor,
                      OffsetDateTime quando) {
        this.nome = nome;
        this.descricao = descricao;
        this.codigo = codigo;
        this.inicio = inicio;
        this.fim = fim;
        this.criadaPor = criadaPor;
        this.criadaEm = quando;
        this.estado = "ABERTA";
    }

    public void editar(String nome, String descricao, LocalDate inicio, LocalDate fim) {
        if (nome != null) {
            this.nome = nome;
        }
        if (descricao != null) {
            this.descricao = descricao.isBlank() ? null : descricao;
        }
        if (inicio != null) {
            this.inicio = inicio;
        }
        if (fim != null) {
            this.fim = fim;
        }
    }

    public void encerrar(OffsetDateTime quando) {
        this.estado = "ENCERRADA";
        this.encerradaEm = quando;
    }

    public boolean aberta() { return "ABERTA".equals(estado); }

    public Long getId() { return id; }

    public String getNome() { return nome; }

    public String getDescricao() { return descricao; }

    public String getCodigo() { return codigo; }

    public LocalDate getInicio() { return inicio; }

    public LocalDate getFim() { return fim; }

    public String getEstado() { return estado; }

    public Long getCriadaPor() { return criadaPor; }

    public OffsetDateTime getCriadaEm() { return criadaEm; }

    public OffsetDateTime getEncerradaEm() { return encerradaEm; }
}
