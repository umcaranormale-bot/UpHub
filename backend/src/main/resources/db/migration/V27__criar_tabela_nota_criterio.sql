CREATE TABLE nota_criterio (
                               avaliacao_id   bigint,
                               criterio_id    bigint,
                               nota           numeric(5,2)  NOT NULL,
                               registrada_em  timestamptz   NOT NULL DEFAULT now(),

                               CONSTRAINT pk_nota_criterio
                                   PRIMARY KEY (avaliacao_id, criterio_id),

                               CONSTRAINT fk_nota_criterio_avaliacao_id
                                   FOREIGN KEY (avaliacao_id)
                                       REFERENCES avaliacao (id)
                                       ON DELETE RESTRICT ON UPDATE RESTRICT,

                               CONSTRAINT fk_nota_criterio_criterio_id
                                   FOREIGN KEY (criterio_id)
                                       REFERENCES criterio (id)
                                       ON DELETE RESTRICT ON UPDATE RESTRICT
);