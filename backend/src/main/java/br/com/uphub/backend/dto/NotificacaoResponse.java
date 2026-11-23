package br.com.uphub.backend.dto;

import br.com.uphub.backend.model.Notificacao;
import java.time.OffsetDateTime;

public record NotificacaoResponse(
        Long id,
        String titulo,
        String mensagem,
        String tipo,
        Long oportunidadeId,
        String oportunidadeTitulo,
        String link,
        OffsetDateTime criadaEm,
        OffsetDateTime lidaEm,
        OffsetDateTime emailEnviadoEm
) {

    public static NotificacaoResponse de(Notificacao n, String oportunidadeTitulo) {
        return new NotificacaoResponse(n.getId(), n.getTitulo(), n.getMensagem(), n.getTipo(),
                n.getOportunidadeId(), oportunidadeTitulo, null,
                n.getCriadaEm(), n.getLidaEm(), n.getEmailEnviadoEm());
    }
}
