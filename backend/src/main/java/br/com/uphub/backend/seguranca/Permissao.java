package br.com.uphub.backend.seguranca;

import java.util.Set;

public enum Permissao {

    CRIAR_OPORTUNIDADE("criar oportunidades", "PROVEDOR"),
    CONVIDAR_AVALIADOR_OU_MENTOR("convidar avaliadores e mentores", "PROVEDOR"),
    PEDIR_PERMISSAO_DE_PROVEDOR("pedir a permissão de provedor", "PROVEDOR"),
    ENVIAR_DOCUMENTO("enviar documentos", "PROVEDOR", "CANDIDATO"),
    MONTAR_SQUAD("montar a squad", "CANDIDATO");

    private final String descricao;
    private final Set<String> papeis;

    Permissao(String descricao, String... papeis) {
        this.descricao = descricao;
        this.papeis = Set.of(papeis);
    }

    public String getDescricao() {
        return descricao;
    }

    public Set<String> getPapeis() {
        return papeis;
    }
}
