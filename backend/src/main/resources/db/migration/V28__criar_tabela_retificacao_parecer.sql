CREATE TABLE retificacao_parecer (
                                     id bigint GENERATED ALWAYS AS IDENTITY,
                                     avaliacao_id bigint NOT NULL,
                                     parecer_retificado text NOT NULL,
                                     justificativa text NOT NULL,
                                     retificada_por bigint NOT NULL,
                                     retificada_em timestamptz NOT NULL DEFAULT now(),
                                     CONSTRAINT pk_retificacao_parecer PRIMARY KEY (id),
                                     CONSTRAINT fk_retificacao_parecer_avaliacao_id FOREIGN KEY (avaliacao_id)
                                         REFERENCES avaliacao (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
                                     CONSTRAINT fk_retificacao_parecer_retificada_por FOREIGN KEY (retificada_por)
                                         REFERENCES pessoa (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);