CREATE TABLE oportunidade (
                              id bigint GENERATED ALWAYS AS IDENTITY,
                              organizacao_id bigint NOT NULL,
                              trilha_codigo varchar(20) NOT NULL,
                              titulo varchar(200) NOT NULL,
                              resumo text,
                              estado varchar(15) NOT NULL DEFAULT 'RASCUNHO',
                              criada_por bigint NOT NULL,
                              criada_em timestamptz NOT NULL DEFAULT now(),
                              publicada_em timestamptz,
                              encerrada_em timestamptz,
                              CONSTRAINT pk_oportunidade PRIMARY KEY (id),
                              CONSTRAINT ck_oportunidade_estado CHECK (estado IN
                                                                       ('RASCUNHO','PUBLICADA','EM_AVALIACAO','ENCERRADA')),
                              CONSTRAINT ck_oportunidade_publicacao CHECK (estado = 'RASCUNHO' OR publicada_em IS
                                  NOT NULL),
                              CONSTRAINT ck_oportunidade_encerramento CHECK (estado <> 'ENCERRADA' OR encerrada_em
                                  IS NOT NULL),
                              CONSTRAINT fk_oportunidade_organizacao_id FOREIGN KEY (organizacao_id)
                                  REFERENCES organizacao (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
                              CONSTRAINT fk_oportunidade_trilha_codigo FOREIGN KEY (trilha_codigo)
                                  REFERENCES trilha (codigo) ON DELETE RESTRICT ON UPDATE RESTRICT,
                              CONSTRAINT fk_oportunidade_criada_por FOREIGN KEY (criada_por)
                                  REFERENCES pessoa (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);
CREATE INDEX ix_oportunidade_trilha_estado ON oportunidade (trilha_codigo, estado);
CREATE INDEX ix_oportunidade_organizacao ON oportunidade (organizacao_id, estado);