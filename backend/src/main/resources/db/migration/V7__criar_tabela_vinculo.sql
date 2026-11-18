CREATE TABLE vinculo (
                         id             bigint GENERATED ALWAYS AS IDENTITY,
                         pessoa_id      bigint       NOT NULL,
                         organizacao_id bigint       NOT NULL,
                         papel          varchar(20)  NOT NULL,
                         funcao         varchar(120),
                         representante  boolean      NOT NULL DEFAULT false,
                         ativo_desde    timestamptz  NOT NULL DEFAULT now(),
                         encerrado_em   timestamptz,

                         CONSTRAINT pk_vinculo PRIMARY KEY (id),

                         CONSTRAINT uq_vinculo_pessoa_org UNIQUE (pessoa_id, organizacao_id),

                         CONSTRAINT ck_vinculo_papel CHECK (
                             papel IN ('PROVEDOR', 'CANDIDATO', 'AVALIADOR', 'MENTOR', 'GESTAO')
                             ),

                         CONSTRAINT fk_vinculo_pessoa_id FOREIGN KEY (pessoa_id)
                             REFERENCES pessoa (id)
                             ON DELETE RESTRICT ON UPDATE RESTRICT,

                         CONSTRAINT fk_vinculo_organizacao_id FOREIGN KEY (organizacao_id)
                             REFERENCES organizacao (id)
                             ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE INDEX ix_vinculo_organizacao ON vinculo (organizacao_id);