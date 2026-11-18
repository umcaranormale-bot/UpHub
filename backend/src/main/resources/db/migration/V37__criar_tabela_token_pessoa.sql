CREATE TABLE token_pessoa (
                              id bigint GENERATED ALWAYS AS IDENTITY,
                              pessoa_id bigint NOT NULL,
                              finalidade varchar(20) NOT NULL,
                              token_hash varchar(64) NOT NULL,
                              criado_em timestamptz NOT NULL DEFAULT now(),
                              expira_em timestamptz NOT NULL,
                              usado_em timestamptz,
                              cancelado_em timestamptz,
                              tentativas smallint NOT NULL DEFAULT 0,
                              CONSTRAINT pk_token_pessoa PRIMARY KEY (id),
                              CONSTRAINT ck_token_pessoa_finalidade CHECK (finalidade IN
                                                                           ('CONFIRMAR_EMAIL','REDEFINIR_SENHA')),
                              CONSTRAINT ck_token_pessoa_expiracao CHECK (expira_em > criado_em),
                              CONSTRAINT ck_token_pessoa_tentativas CHECK (tentativas BETWEEN 0 AND 5),
                              CONSTRAINT ck_token_pessoa_fim CHECK (usado_em IS NULL OR cancelado_em IS NULL),
                              CONSTRAINT fk_token_pessoa_pessoa_id FOREIGN KEY (pessoa_id) REFERENCES pessoa (id)
                                  ON DELETE RESTRICT ON UPDATE RESTRICT
);
CREATE INDEX ix_token_pessoa ON token_pessoa (pessoa_id, finalidade);
CREATE UNIQUE INDEX ux_token_pessoa_ativo ON token_pessoa (pessoa_id, finalidade) WHERE
usado_em IS NULL AND cancelado_em IS NULL;
CREATE INDEX ix_token_pessoa_hash ON token_pessoa (token_hash);