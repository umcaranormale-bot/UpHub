package br.com.uphub.backend.dto;

import java.util.List;

// itens: obrigatórios quando a decisão é AJUSTE; nas outras decisões, o body pode ir vazio
public record AssinaturaRequest(
        List<ItemAjusteRequest> itens
) {
}
