CREATE TABLE alocacao_mentor (
                                 id bigint GENERATED ALWAYS AS IDENTITY,
                                 vinculo_id bigint NOT NULL,
                                 candidatura_id bigint NOT NULL,
                                 horas_previstas_mes numeric(5,1) NOT NULL,
                                 prazo_resposta date NOT NULL,
                                 situacao varchar(15) NOT NULL DEFAULT 'PENDENTE',
                                 convidada_por bigint NOT NULL,
                                 convidada_em timestamptz NOT NULL DEFAULT now(),
                                 respondida_em timestamptz,
                                 CONSTRAINT pk_alocacao_mentor PRIMARY KEY (id),
                                 CONSTRAINT ck_alocacao_situacao CHECK (situacao IN
                                                                        ('PENDENTE','ACEITA','RECUSADA','EXPIRADA')),
                                 CONSTRAINT ck_alocacao_horas CHECK (horas_previstas_mes > 0),
                                 CONSTRAINT ck_alocacao_resposta CHECK (situacao NOT IN ('ACEITA','RECUSADA') OR
                                                                        respondida_em IS NOT NULL),
                                 CONSTRAINT uq_alocacao_mentor_candidatura UNIQUE (vinculo_id, candidatura_id),
                                 CONSTRAINT fk_alocacao_mentor_vinculo_id FOREIGN KEY (vinculo_id) REFERENCES vinculo
                                     (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
                                 CONSTRAINT fk_alocacao_mentor_candidatura_id FOREIGN KEY (candidatura_id) REFERENCES
                                     candidatura (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
                                 CONSTRAINT fk_alocacao_mentor_convidada_por FOREIGN KEY (convidada_por) REFERENCES
                                     pessoa (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);
CREATE INDEX ix_alocacao_mentor ON alocacao_mentor (vinculo_id, situacao);