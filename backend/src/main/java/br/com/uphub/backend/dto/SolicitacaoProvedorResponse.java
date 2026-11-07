package br.com.uphub.backend.dto;

import br.com.uphub.backend.model.SolicitacaoProvedor;
import java.time.OffsetDateTime;

public record SolicitacaoProvedorResponse(
        Long id,
        Long organizacaoId,
        String organizacaoNome,
        Long solicitanteId,
        String solicitanteNome,
        String emailInstitucional,
        Long documentoId,
        OffsetDateTime pedidaEm,
        String situacao,
        Long decididaPorId,
        OffsetDateTime decididaEm,
        String motivo,
        boolean recusaPorDocumento,
        Long solicitacaoAnteriorId,
        String respostaRecusa
) {

    public static SolicitacaoProvedorResponse de(SolicitacaoProvedor s) {
        return new SolicitacaoProvedorResponse(
                s.getId(),
                s.getOrganizacao().getId(),
                s.getOrganizacao().getNome(),
                s.getSolicitante().getId(),
                s.getSolicitante().getNome(),
                s.getEmailInstitucional(),
                s.getDocumentoId(),
                s.getPedidaEm(),
                s.getSituacao(),
                s.getDecididaPor() == null ? null : s.getDecididaPor().getId(),
                s.getDecididaEm(),
                s.getMotivo(),
                s.isRecusaPorDocumento(),
                s.getSolicitacaoAnteriorId(),
                s.getRespostaRecusa()
        );
    }
}