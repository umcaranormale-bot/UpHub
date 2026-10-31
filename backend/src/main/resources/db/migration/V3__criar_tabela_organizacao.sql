CREATE TABLE organizacao (
                             id bigint GENERATED ALWAYS AS IDENTITY,
                             tipo varchar(30) NOT NULL,
                             nome varchar(200) NOT NULL,
                             razao_social varchar(200),
                             cnpj char(14),
                             porte varchar(30),
                             setor varchar(80),
                             estagio varchar(40),
                             ano_fundacao smallint,
                             sede_cidade varchar(80),
                             sede_uf char(2),
                             criada_em timestamptz NOT NULL DEFAULT now(),
                             CONSTRAINT pk_organizacao PRIMARY KEY (id),
                             CONSTRAINT uq_organizacao_cnpj UNIQUE (cnpj),
                             CONSTRAINT ck_organizacao_cnpj CHECK (cnpj IS NULL OR cnpj ~ '^[0-9]{14}$')
    );