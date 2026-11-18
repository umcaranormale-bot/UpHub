CREATE TABLE solicitacao_provedor (
                                      id bigint GENERATED ALWAYS AS IDENTITY,
                                      organizacao_id bigint NOT NULL,
                                      solicitante_id bigint NOT NULL,
                                      email_institucional varchar(254) NOT NULL,
                                      documento_id bigint,
                                      pedida_em timestamptz NOT NULL DEFAULT now(),
                                      situacao varchar(15) NOT NULL DEFAULT 'AGUARDANDO',
                                      decidida_por bigint,
                                      decidida_em timestamptz,
                                      motivo text,
                                      recusa_por_documento boolean NOT NULL DEFAULT false,
                                      solicitacao_anterior_id bigint,
                                      resposta_recusa text,
                                      revogada_por bigint,
                                      revogada_em timestamptz,
                                      motivo_revogacao text,
                                      CONSTRAINT pk_solicitacao_provedor PRIMARY KEY (id),
                                      CONSTRAINT uq_solicitacao_id_org UNIQUE (id, organizacao_id),
                                      CONSTRAINT uq_solicitacao_anterior UNIQUE (solicitacao_anterior_id),
                                      CONSTRAINT ck_solicitacao_situacao CHECK (situacao IN
                                                                                ('AGUARDANDO','APROVADA','RECUSADA','REVOGADA')),
                                      CONSTRAINT ck_solicitacao_decisao CHECK (situacao = 'AGUARDANDO' OR (decidida_por IS
                                          NOT NULL AND decidida_em IS NOT NULL)),
                                      CONSTRAINT ck_solicitacao_motivo CHECK (situacao <> 'RECUSADA' OR (motivo IS NOT
                                          NULL AND btrim(motivo) <> '')),
                                      CONSTRAINT ck_solicitacao_recusa_documento CHECK (NOT recusa_por_documento OR
                                                                                        situacao = 'RECUSADA'),
                                      CONSTRAINT ck_solicitacao_resposta CHECK (solicitacao_anterior_id IS NULL OR
                                                                                (resposta_recusa IS NOT NULL AND btrim(resposta_recusa) <> '')),
                                      CONSTRAINT ck_solicitacao_revogacao CHECK (situacao <> 'REVOGADA' OR (revogada_por
                                                                                                                IS NOT NULL AND revogada_em IS NOT NULL AND motivo_revogacao IS NOT NULL AND
                                                                                                            btrim(motivo_revogacao) <> '')),
                                      CONSTRAINT ck_solicitacao_revogacao_so_revogada CHECK (situacao = 'REVOGADA' OR
                                                                                             (revogada_por IS NULL AND revogada_em IS NULL AND motivo_revogacao IS NULL)),
                                      CONSTRAINT ck_solicitacao_revogada_apos_decisao CHECK (revogada_em IS NULL OR
                                                                                             revogada_em >= decidida_em),
                                      CONSTRAINT fk_solicitacao_provedor_organizacao_id FOREIGN KEY (organizacao_id)
                                          REFERENCES organizacao (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
                                      CONSTRAINT fk_solicitacao_provedor_solicitante_id FOREIGN KEY (solicitante_id)
                                          REFERENCES pessoa (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
                                      CONSTRAINT fk_solicitacao_provedor_documento_id FOREIGN KEY (documento_id)
                                          REFERENCES documento (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
                                      CONSTRAINT fk_solicitacao_provedor_decidida_por FOREIGN KEY (decidida_por)
                                          REFERENCES pessoa (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
                                      CONSTRAINT fk_solicitacao_provedor_revogada_por FOREIGN KEY (revogada_por)
                                          REFERENCES pessoa (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
                                      CONSTRAINT fk_solicitacao_anterior FOREIGN KEY (solicitacao_anterior_id,
                                                                                      organizacao_id) REFERENCES solicitacao_provedor (id, organizacao_id) ON DELETE
                                          RESTRICT ON UPDATE RESTRICT
);
CREATE INDEX ix_solicitacao_situacao ON solicitacao_provedor (situacao, pedida_em);
CREATE UNIQUE INDEX ux_solicitacao_aberta ON solicitacao_provedor (organizacao_id) WHERE
    situacao = 'AGUARDANDO';