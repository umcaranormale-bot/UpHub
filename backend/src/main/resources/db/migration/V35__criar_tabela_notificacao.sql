CREATE TABLE notificacao (
                             id bigint GENERATED ALWAYS AS IDENTITY,
                             pessoa_id bigint NOT NULL,
                             oportunidade_id bigint,
                             titulo varchar(160) NOT NULL,
                             mensagem text,
                             tipo varchar(15) NOT NULL,
                             criada_em timestamptz NOT NULL DEFAULT now(),
                             lida_em timestamptz,
                             email_enviado_em timestamptz,
                             CONSTRAINT pk_notificacao PRIMARY KEY (id),
                             CONSTRAINT ck_notificacao_tipo CHECK (tipo IN ('PEDE_ACAO','INFORMATIVA')),
                             CONSTRAINT ck_notificacao_email CHECK (email_enviado_em IS NULL OR tipo =
                                                                                                'PEDE_ACAO'),
                             CONSTRAINT fk_notificacao_pessoa_id FOREIGN KEY (pessoa_id) REFERENCES pessoa (id)
                                 ON DELETE RESTRICT ON UPDATE RESTRICT,
                             CONSTRAINT fk_notificacao_oportunidade_id FOREIGN KEY (oportunidade_id) REFERENCES
                                 oportunidade (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);
CREATE INDEX ix_notificacao_pessoa ON notificacao (pessoa_id, criada_em DESC);