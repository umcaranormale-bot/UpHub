CREATE TABLE pedido_ajuste (
                               id                bigint GENERATED ALWAYS AS IDENTITY,
                               candidatura_id    bigint       NOT NULL,
                               avaliacao_id      bigint       NOT NULL,
                               pedido_em         timestamptz  NOT NULL DEFAULT now(),
                               prazo_reenvio     timestamptz  NOT NULL,
                               situacao          varchar(15)  NOT NULL DEFAULT 'AGUARDANDO',
                               resposta          text,
                               reenviado_em      timestamptz,
                               reenviado_por     bigint,
                               prazo_perdido_em  timestamptz,

                               CONSTRAINT pk_pedido_ajuste
                                   PRIMARY KEY (id),

                               CONSTRAINT uq_pedido_ajuste_avaliacao
                                   UNIQUE (avaliacao_id),

                               CONSTRAINT ck_pedido_ajuste_situacao
                                   CHECK (situacao IN ('AGUARDANDO', 'REENVIADO', 'PERDA_DE_PRAZO')),

                               CONSTRAINT ck_pedido_ajuste_prazo
                                   CHECK (prazo_reenvio > pedido_em),

                               CONSTRAINT ck_pedido_ajuste_reenvio
                                   CHECK (
                                       situacao <> 'REENVIADO'
                                           OR (
                                           reenviado_em IS NOT NULL
                                               AND reenviado_por IS NOT NULL
                                               AND resposta IS NOT NULL
                                               AND btrim(resposta) <> ''
                                           )
                                       ),

                               CONSTRAINT ck_pedido_ajuste_no_prazo
                                   CHECK (reenviado_em IS NULL OR reenviado_em <= prazo_reenvio),

                               CONSTRAINT ck_pedido_ajuste_perda
                                   CHECK (
                                       situacao <> 'PERDA_DE_PRAZO'
                                           OR (prazo_perdido_em IS NOT NULL AND reenviado_em IS NULL)
                                       ),

                               CONSTRAINT fk_pedido_ajuste_avaliacao
                                   FOREIGN KEY (avaliacao_id, candidatura_id)
                                       REFERENCES avaliacao (id, candidatura_id)
                                       ON DELETE RESTRICT ON UPDATE RESTRICT,

                               CONSTRAINT fk_pedido_ajuste_reenviado_por
                                   FOREIGN KEY (reenviado_por)
                                       REFERENCES pessoa (id)
                                       ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE UNIQUE INDEX ux_pedido_ajuste_aberto
    ON pedido_ajuste (candidatura_id)
    WHERE situacao = 'AGUARDANDO';

CREATE INDEX ix_pedido_ajuste_prazo
    ON pedido_ajuste (prazo_reenvio)
    WHERE situacao = 'AGUARDANDO';