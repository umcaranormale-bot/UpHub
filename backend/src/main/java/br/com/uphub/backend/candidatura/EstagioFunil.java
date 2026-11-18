package br.com.uphub.backend.candidatura;

// Funil da trilha Investimento: a candidatura só anda para a frente.
public enum EstagioFunil {
    INSCRITA, TRIADA, EM_DILIGENCIA, SELECIONADA;

    public static EstagioFunil de(String nome) {
        for (EstagioFunil estagio : values()) {
            if (estagio.name().equalsIgnoreCase(nome == null ? "" : nome.trim())) {
                return estagio;
            }
        }
        return null;
    }
}
