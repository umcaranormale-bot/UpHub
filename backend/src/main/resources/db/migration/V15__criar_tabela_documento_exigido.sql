CREATE TABLE documento_exigido (
                                   id bigint GENERATED ALWAYS AS IDENTITY,
                                   versao_id bigint NOT NULL,
                                   nome varchar(120) NOT NULL,
                                   obrigatorio boolean NOT NULL,
                                   CONSTRAINT pk_documento_exigido PRIMARY KEY (id),
                                   CONSTRAINT fk_documento_exigido_versao_id FOREIGN KEY (versao_id)
                                       REFERENCES versao_oportunidade (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);
CREATE INDEX ix_docexigido_versao ON documento_exigido (versao_id);