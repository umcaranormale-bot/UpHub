CREATE TABLE visualizacao_oportunidade (
                                           oportunidade_id bigint,
                                           organizacao_id bigint,
                                           primeira_em timestamptz NOT NULL DEFAULT now(),
                                           ultima_em timestamptz NOT NULL DEFAULT now(),
                                           CONSTRAINT pk_visualizacao_oportunidade PRIMARY KEY (oportunidade_id,
                                                                                                organizacao_id),
                                           CONSTRAINT fk_visualizacao_oportunidade_oportunidade_id FOREIGN KEY
                                               (oportunidade_id)
                                               REFERENCES oportunidade (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
                                           CONSTRAINT fk_visualizacao_oportunidade_organizacao_id FOREIGN KEY (organizacao_id)
                                               REFERENCES organizacao (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);