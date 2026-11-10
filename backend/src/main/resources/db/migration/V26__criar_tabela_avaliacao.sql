CREATE TABLE avaliacao (
                           id bigint GENERATED ALWAYS AS IDENTITY,
                           candidatura_id bigint NOT NULL,
                           oportunidade_id bigint NOT NULL,
                           vinculo_id bigint NOT NULL,
                           atribuida_por bigint NOT NULL,
                           atribuida_em timestamptz NOT NULL DEFAULT now(),
                           decisao varchar(15),
                           parecer text,
                           nota_final numeric(5,2),
                           assinada_em timestamptz,
                           rodada smallint NOT NULL DEFAULT 1,
                           CONSTRAINT pk_avaliacao PRIMARY KEY (id),
                           CONSTRAINT uq_avaliacao_candidatura_avaliador UNIQUE (candidatura_id, vinculo_id,
                                                                                 rodada),
                           CONSTRAINT uq_avaliacao_id_candidatura UNIQUE (id, candidatura_id),
                           CONSTRAINT ck_avaliacao_rodada CHECK (rodada >= 1),
                           CONSTRAINT ck_avaliacao_decisao CHECK (decisao IS NULL OR decisao IN
                                                                                     ('APROVADA','REPROVADA','AJUSTE')),
                           CONSTRAINT ck_avaliacao_parecer CHECK (decisao IS NULL OR (parecer IS NOT NULL AND
                                                                                      btrim(parecer) <> '')),
                           CONSTRAINT ck_avaliacao_assinatura CHECK (assinada_em IS NULL OR decisao IS NOT
                               NULL),
                           CONSTRAINT fk_avaliacao_atribuida_por FOREIGN KEY (atribuida_por)
                               REFERENCES pessoa (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
                           CONSTRAINT fk_avaliacao_candidatura FOREIGN KEY (candidatura_id, oportunidade_id)
                               REFERENCES candidatura (id, oportunidade_id) ON DELETE RESTRICT ON UPDATE
                                   RESTRICT,
                           CONSTRAINT fk_avaliacao_designacao FOREIGN KEY (oportunidade_id, vinculo_id)
                               REFERENCES avaliador_oportunidade (oportunidade_id, vinculo_id) ON DELETE
                                   RESTRICT ON UPDATE RESTRICT
);
CREATE INDEX ix_avaliacao_avaliador ON avaliacao (vinculo_id, oportunidade_id);