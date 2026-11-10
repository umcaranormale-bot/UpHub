package br.com.uphub.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "trilha")
public class Trilha {

    @Id
    @Column(name = "codigo", length = 20)
    private String codigo;

    @Column(name = "nome", nullable = false, length = 40)
    private String nome;

    protected Trilha() {}

    public String getCodigo() {
        return codigo;
    }

    public String getNome() {
        return nome;
    }
}