CREATE TABLE convite (
                         id bigint GENERATED ALWAYS AS IDENTITY,
                         email varchar(254) NOT NULL,
                         papel varchar(20) NOT NULL,
                         organizacao_id bigint NOT NULL,
                         enviado_por bigint NOT NULL,
                         enviado_em timestamptz NOT NULL DEFAULT now(),
                         expira_em timestamptz NOT NULL,
                         situacao varchar(15) NOT NULL DEFAULT 'AGUARDANDO',
                         aceito_em timestamptz,
                         pessoa_id bigint,
                         token varchar(64) NOT NULL,
                         CONSTRAINT pk_convite PRIMARY KEY (id),
                         CONSTRAINT uq_convite_token UNIQUE (token),
                         CONSTRAINT ck_convite_expiracao CHECK (expira_em > enviado_em),
                         CONSTRAINT ck_convite_aceite CHECK (situacao <> 'ACEITO' OR (aceito_em IS NOT NULL
                             AND pessoa_id IS NOT NULL)),
                         CONSTRAINT ck_convite_papel CHECK (papel IN ('AVALIADOR','MENTOR')),
                         CONSTRAINT ck_convite_situacao CHECK (situacao IN
                                                               ('AGUARDANDO','ACEITO','RECUSADO','EXPIRADO')),
                         CONSTRAINT fk_convite_organizacao_id FOREIGN KEY (organizacao_id)
                             REFERENCES organizacao (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
                         CONSTRAINT fk_convite_enviado_por FOREIGN KEY (enviado_por)
                             REFERENCES pessoa (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
                         CONSTRAINT fk_convite_pessoa_id FOREIGN KEY (pessoa_id)
                             REFERENCES pessoa (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);
CREATE UNIQUE INDEX ux_convite_aberto ON convite (organizacao_id, papel, lower(email))
    WHERE situacao = 'AGUARDANDO';