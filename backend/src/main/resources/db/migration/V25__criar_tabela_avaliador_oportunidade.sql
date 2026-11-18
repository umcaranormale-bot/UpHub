CREATE TABLE avaliador_oportunidade (
                                        oportunidade_id  bigint,
                                        vinculo_id       bigint,
                                        prazo_avaliacao  date,
                                        designado_por    bigint       NOT NULL,
                                        designado_em     timestamptz  NOT NULL DEFAULT now(),

                                        CONSTRAINT pk_avaliador_oportunidade
                                            PRIMARY KEY (oportunidade_id, vinculo_id),

                                        CONSTRAINT fk_avaliador_oportunidade_oportunidade_id
                                            FOREIGN KEY (oportunidade_id)
                                                REFERENCES oportunidade (id)
                                                ON DELETE RESTRICT ON UPDATE RESTRICT,

                                        CONSTRAINT fk_avaliador_oportunidade_vinculo_id
                                            FOREIGN KEY (vinculo_id)
                                                REFERENCES vinculo (id)
                                                ON DELETE RESTRICT ON UPDATE RESTRICT,

                                        CONSTRAINT fk_avaliador_oportunidade_designado_por
                                            FOREIGN KEY (designado_por)
                                                REFERENCES pessoa (id)
                                                ON DELETE RESTRICT ON UPDATE RESTRICT
);