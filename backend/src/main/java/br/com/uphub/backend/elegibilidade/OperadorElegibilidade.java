package br.com.uphub.backend.elegibilidade;

// Como o valor do perfil é comparado com o valor exigido pelo requisito.
public enum OperadorElegibilidade {

    IGUAL("igual a", false, false),
    DIFERENTE("diferente de", false, false),
    EM("um destes", true, false),
    FORA_DE("nenhum destes", true, false),
    MAIOR_OU_IGUAL("no mínimo", false, true),
    MENOR_OU_IGUAL("no máximo", false, true);

    private final String descricao;
    private final boolean lista;
    private final boolean soNumero;

    OperadorElegibilidade(String descricao, boolean lista, boolean soNumero) {
        this.descricao = descricao;
        this.lista = lista;
        this.soNumero = soNumero;
    }

    public String getDescricao() {
        return descricao;
    }

    // EM e FORA_DE recebem uma lista de valores; os outros, um valor só
    public boolean isLista() {
        return lista;
    }

    // MAIOR_OU_IGUAL e MENOR_OU_IGUAL só servem para campos numéricos
    public boolean isSoNumero() {
        return soNumero;
    }

    public static OperadorElegibilidade de(String nome) {
        for (OperadorElegibilidade operador : values()) {
            if (operador.name().equalsIgnoreCase(nome == null ? "" : nome.trim())) {
                return operador;
            }
        }
        return null;
    }
}
