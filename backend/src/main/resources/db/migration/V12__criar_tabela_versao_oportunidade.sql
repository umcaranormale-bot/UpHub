CREATE TABLE versao_oportunidade (
                                     id bigint GENERATED ALWAYS AS IDENTITY,
                                     oportunidade_id bigint NOT NULL,
                                     numero integer NOT NULL,
                                     prazo_envio date,
                                     nota_minima numeric(5,2),
                                     validade_nota_dias smallint NOT NULL DEFAULT 90,
                                     escopo text,
                                     entregaveis text,
                                     carga_semanal_horas smallint,
                                     duracao_semanas smallint,
                                     quantidade_vagas integer,
                                     criada_por bigint NOT NULL,
                                     criada_em timestamptz NOT NULL DEFAULT now(),
                                     publicada_em timestamptz,
                                     CONSTRAINT pk_versao_oportunidade PRIMARY KEY (id),
                                     CONSTRAINT uq_versao_numero UNIQUE (oportunidade_id, numero),
                                     CONSTRAINT uq_versao_id_oportunidade UNIQUE (id, oportunidade_id),
                                     CONSTRAINT ck_versao_numero CHECK (numero >= 1),
                                     CONSTRAINT ck_versao_validade CHECK (validade_nota_dias IN (30, 60, 90)),
                                     CONSTRAINT ck_versao_publicacao CHECK (publicada_em IS NULL OR prazo_envio IS NOT
                                         NULL),
                                     CONSTRAINT ck_versao_nota_minima CHECK (nota_minima IS NULL OR nota_minima >= 0),
                                     CONSTRAINT ck_versao_carga CHECK (carga_semanal_horas IS NULL OR carga_semanal_horas
                                         > 0),
                                     CONSTRAINT ck_versao_duracao CHECK (duracao_semanas IS NULL OR duracao_semanas > 0),
                                     CONSTRAINT ck_versao_vagas CHECK (quantidade_vagas IS NULL OR quantidade_vagas > 0),
                                     CONSTRAINT fk_versao_oportunidade_oportunidade_id FOREIGN KEY (oportunidade_id)
                                         REFERENCES oportunidade (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
                                     CONSTRAINT fk_versao_oportunidade_criada_por FOREIGN KEY (criada_por)
                                         REFERENCES pessoa (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);