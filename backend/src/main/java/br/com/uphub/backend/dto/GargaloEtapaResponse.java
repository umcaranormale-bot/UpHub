package br.com.uphub.backend.dto;

import java.time.OffsetDateTime;
import java.util.List;

// Uma etapa com os itens parados além do limite, do mais antigo para o mais novo.
public record GargaloEtapaResponse(
        String etapa,
        int limiteDiasUteis,
        int acimaDoLimite,
        Integer maisAntigoDiasUteis,
        List<ItemParado> itens
) {
    // responsavel: com quem está a bola (o provedor, o avaliador ou a gestão)
    public record ItemParado(Long oportunidadeId, String oportunidadeTitulo, Long candidaturaId,
                             Long solicitacaoProvedorId, String organizacaoNome, Responsavel responsavel,
                             boolean semAvaliador, OffsetDateTime paradoDesde, int diasUteis) {
    }

    public record Responsavel(Long pessoaId, String nome, String papel) {
    }
}
