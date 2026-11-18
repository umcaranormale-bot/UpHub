package br.com.uphub.backend.elegibilidade;

import br.com.uphub.backend.model.Organizacao;

import java.time.Year;
import java.util.function.BiFunction;

// O que um requisito pode conferir no perfil da organização candidata.
public enum CampoElegibilidade {

    TIPO("tipo da organização", Tipo.TEXTO, (o, ano) -> o.getTipo()),
    PORTE("porte", Tipo.TEXTO, (o, ano) -> o.getPorte()),
    SETOR("setor", Tipo.TEXTO, (o, ano) -> o.getSetor()),
    ESTAGIO("estágio", Tipo.TEXTO, (o, ano) -> o.getEstagio()),
    SEDE_UF("UF da sede", Tipo.TEXTO, (o, ano) -> o.getSedeUf()),
    SEDE_CIDADE("cidade da sede", Tipo.TEXTO, (o, ano) -> o.getSedeCidade()),
    TEMPO_DE_MERCADO_ANOS("tempo de mercado (anos)", Tipo.NUMERO,
            (o, ano) -> o.getAnoFundacao() == null ? null : ano.getValue() - o.getAnoFundacao());

    public enum Tipo { TEXTO, NUMERO }

    private final String descricao;
    private final Tipo tipo;
    private final BiFunction<Organizacao, Year, Object> leitor;

    CampoElegibilidade(String descricao, Tipo tipo, BiFunction<Organizacao, Year, Object> leitor) {
        this.descricao = descricao;
        this.tipo = tipo;
        this.leitor = leitor;
    }

    public String getDescricao() {
        return descricao;
    }

    public Tipo getTipo() {
        return tipo;
    }

    // o valor do campo no perfil da organização; null quando a organização não informou
    public Object ler(Organizacao organizacao, Year anoAtual) {
        return leitor.apply(organizacao, anoAtual);
    }

    public static CampoElegibilidade de(String nome) {
        for (CampoElegibilidade campo : values()) {
            if (campo.name().equalsIgnoreCase(nome == null ? "" : nome.trim())) {
                return campo;
            }
        }
        return null;
    }
}
