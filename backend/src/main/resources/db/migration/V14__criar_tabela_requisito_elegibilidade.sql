CREATE TABLE requisito_elegibilidade (
                                         id          bigint GENERATED ALWAYS AS IDENTITY,
                                         versao_id   bigint       NOT NULL,
                                         ordem       smallint,
                                         campo       varchar(60)  NOT NULL,
                                         operador    varchar(40)  NOT NULL,
                                         valor       jsonb,
                                         obrigatoria boolean      NOT NULL,

                                         CONSTRAINT pk_requisito_elegibilidade
                                             PRIMARY KEY (id),

                                         CONSTRAINT fk_requisito_elegibilidade_versao_id
                                             FOREIGN KEY (versao_id)
                                                 REFERENCES versao_oportunidade (id)
                                                 ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE INDEX ix_requisito_versao
    ON requisito_elegibilidade (versao_id);