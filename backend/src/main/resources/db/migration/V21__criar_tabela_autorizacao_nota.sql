CREATE TABLE autorizacao_nota (
                                  id                    bigint GENERATED ALWAYS AS IDENTITY,
                                  candidatura_id        bigint        NOT NULL,
                                  resultado_prova_id    bigint        NOT NULL,
                                  autorizada_em         timestamptz   NOT NULL DEFAULT now(),
                                  nota_congelada        numeric(5,2)  NOT NULL,
                                  data_prova_congelada  date          NOT NULL,

                                  CONSTRAINT pk_autorizacao_nota
                                      PRIMARY KEY (id),

                                  CONSTRAINT uq_autorizacao_candidatura_prova
                                      UNIQUE (candidatura_id, resultado_prova_id),

                                  CONSTRAINT fk_autorizacao_nota_candidatura_id
                                      FOREIGN KEY (candidatura_id)
                                          REFERENCES candidatura (id)
                                          ON DELETE RESTRICT ON UPDATE RESTRICT,

                                  CONSTRAINT fk_autorizacao_nota_resultado_prova_id
                                      FOREIGN KEY (resultado_prova_id)
                                          REFERENCES resultado_prova (id)
                                          ON DELETE RESTRICT ON UPDATE RESTRICT
);