CREATE TABLE resultado_prova (
                                 id bigint GENERATED ALWAYS AS IDENTITY,
                                 pessoa_id bigint NOT NULL,
                                 area varchar(80),
                                 nota numeric(5,2) NOT NULL,
                                 data_prova date NOT NULL,
                                 data_validade date GENERATED ALWAYS AS (data_prova + 90) STORED,
                                 registrado_em timestamptz NOT NULL DEFAULT now(),
                                 CONSTRAINT pk_resultado_prova PRIMARY KEY (id),
                                 CONSTRAINT ck_prova_nota CHECK (nota >= 0),
                                 CONSTRAINT fk_resultado_prova_pessoa_id FOREIGN KEY (pessoa_id)
                                     REFERENCES pessoa (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);
CREATE INDEX ix_prova_pessoa_data ON resultado_prova (pessoa_id, data_prova DESC);