package br.com.uphub.backend.dto;

import br.com.uphub.backend.model.Convite;
import java.time.OffsetDateTime;

public record ConviteResponse(
        Long id,
        String email,
        String papel,
        Long organizacaoId,
        Long enviadoPor,
        OffsetDateTime enviadoEm,
        OffsetDateTime expiraEm,
        String situacao,
        OffsetDateTime aceitoEm,
        Long pessoaId
) {

    public static ConviteResponse de(Convite convite) {
        return new ConviteResponse(
                convite.getId(),
                convite.getEmail(),
                convite.getPapel(),
                convite.getOrganizacaoId(),
                convite.getEnviadoPor(),
                convite.getEnviadoEm(),
                convite.getExpiraEm(),
                convite.getSituacao(),
                convite.getAceitoEm(),
                convite.getPessoaId()
        );
    }
}