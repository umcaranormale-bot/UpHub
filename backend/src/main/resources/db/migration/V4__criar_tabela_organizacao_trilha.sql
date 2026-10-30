CREATE TABLE organizacao_trilha (
                                    organizacao_id bigint,
                                    trilha_codigo varchar(20),
                                    CONSTRAINT pk_organizacao_trilha PRIMARY KEY (organizacao_id, trilha_codigo),
                                    CONSTRAINT fk_organizacao_trilha_organizacao_id FOREIGN KEY (organizacao_id) REFERENCES
                                        organizacao (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
                                    CONSTRAINT fk_organizacao_trilha_trilha_codigo FOREIGN KEY (trilha_codigo) REFERENCES trilha
                                        (codigo) ON DELETE RESTRICT ON UPDATE RESTRICT
);