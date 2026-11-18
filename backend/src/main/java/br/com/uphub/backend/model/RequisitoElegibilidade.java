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
import org.hibernate.annotations.ColumnTransformer;

@Entity
@Table(name = "requisito_elegibilidade")
public class RequisitoElegibilidade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "versao_id", nullable = false)
    private VersaoOportunidade versao;

    @Column(name = "ordem")
    private Short ordem;

    @Column(name = "campo", nullable = false, length = 60)
    private String campo;

    @Column(name = "operador", nullable = false, length = 40)
    private String operador;

    // jsonb no banco: guarda o texto JSON (um valor ou uma lista)
    @ColumnTransformer(write = "cast(? as jsonb)")
    @Column(name = "valor", columnDefinition = "jsonb")
    private String valor;

    @Column(name = "obrigatoria", nullable = false)
    private boolean obrigatoria;

    protected RequisitoElegibilidade() {
    }

    public RequisitoElegibilidade(VersaoOportunidade versao, Short ordem, String campo, String operador,
                                  String valor, boolean obrigatoria) {
        this.versao = versao;
        this.ordem = ordem;
        this.campo = campo;
        this.operador = operador;
        this.valor = valor;
        this.obrigatoria = obrigatoria;
    }

    public Long getId() { return id; }

    public VersaoOportunidade getVersao() { return versao; }

    public Short getOrdem() { return ordem; }
    public void setOrdem(Short ordem) { this.ordem = ordem; }

    public String getCampo() { return campo; }

    public String getOperador() { return operador; }

    public String getValor() { return valor; }

    // campo, operador e valor mudam juntos, porque um depende do outro
    public void trocarRegra(String campo, String operador, String valor) {
        this.campo = campo;
        this.operador = operador;
        this.valor = valor;
    }

    public boolean isObrigatoria() { return obrigatoria; }
    public void setObrigatoria(boolean obrigatoria) { this.obrigatoria = obrigatoria; }
}
