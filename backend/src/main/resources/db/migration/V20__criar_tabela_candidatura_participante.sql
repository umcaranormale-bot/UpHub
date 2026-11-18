CREATE TABLE candidatura_participante (
                                          candidatura_id     bigint,
                                          pessoa_id          bigint,
                                          convite_enviado_em timestamptz,
                                          confirmou_em       timestamptz,

                                          CONSTRAINT pk_candidatura_participante
                                              PRIMARY KEY (candidatura_id, pessoa_id),

                                          CONSTRAINT fk_candidatura_participante_candidatura_id
                                              FOREIGN KEY (candidatura_id)
                                                  REFERENCES candidatura (id)
                                                  ON DELETE RESTRICT ON UPDATE RESTRICT,

                                          CONSTRAINT fk_candidatura_participante_pessoa_id
                                              FOREIGN KEY (pessoa_id)
                                                  REFERENCES pessoa (id)
                                                  ON DELETE RESTRICT ON UPDATE RESTRICT
);