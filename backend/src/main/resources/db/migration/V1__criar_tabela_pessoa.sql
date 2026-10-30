CREATE TABLE pessoa (
                        id bigint GENERATED ALWAYS AS IDENTITY,
                        nome varchar(160) NOT NULL,
                        email varchar(254) NOT NULL,
                        telefone varchar(20),
                        senha_hash text NOT NULL,
                        email_confirmado_em timestamptz,
                        foto_ref text,
                        criada_em timestamptz NOT NULL DEFAULT now(),
                        excluida_em timestamptz,
                        CONSTRAINT pk_pessoa PRIMARY KEY (id)
);
CREATE UNIQUE INDEX ux_pessoa_email ON pessoa (lower(email));