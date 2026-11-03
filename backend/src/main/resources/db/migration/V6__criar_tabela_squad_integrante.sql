CREATE TABLE squad_integrante (
                                  squad_id bigint,
                                  pessoa_id bigint,
                                  competencia varchar(120),
                                  CONSTRAINT pk_squad_integrante PRIMARY KEY (squad_id, pessoa_id),
                                  CONSTRAINT fk_squad_integrante_squad_id FOREIGN KEY (squad_id)
                                      REFERENCES squad (organizacao_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
                                  CONSTRAINT fk_squad_integrante_pessoa_id FOREIGN KEY (pessoa_id)
                                      REFERENCES pessoa (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);