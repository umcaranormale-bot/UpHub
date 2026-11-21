package br.com.uphub.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

// Quantos dias úteis um item pode ficar parado em cada etapa antes de virar gargalo (V36).
// As 4 etapas nascem na migration, com 5 dias úteis; a gestão muda o limite.
@Entity
@Table(name = "parametro_gargalo")
public class ParametroGargalo {

    @Id
    @Column(length = 20)
    private String etapa;

    @Column(name = "limite_dias_uteis", nullable = false)
    private Short limiteDiasUteis;

    protected ParametroGargalo() {
    }

    public String getEtapa() { return etapa; }

    public int getLimiteDiasUteis() { return limiteDiasUteis; }

    public void setLimiteDiasUteis(int limite) { this.limiteDiasUteis = (short) limite; }
}
