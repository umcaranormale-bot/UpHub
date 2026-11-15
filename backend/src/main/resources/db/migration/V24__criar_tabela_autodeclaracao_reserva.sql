CREATE TABLE autodeclaracao_reserva (
                                        candidatura_id bigint,
                                        criterio varchar(80),
                                        declarada_em timestamptz NOT NULL DEFAULT now(),
                                        situacao varchar(15) NOT NULL DEFAULT 'DECLARADA',
                                        conferida_por bigint,
                                        conferida_em timestamptz,
                                        motivo_recusa text,
                                        CONSTRAINT pk_autodeclaracao_reserva PRIMARY KEY (candidatura_id, criterio),
                                        CONSTRAINT ck_autodeclaracao_situacao CHECK (situacao IN
                                                                                     ('DECLARADA','CONFIRMADA','RECUSADA')),
                                        CONSTRAINT ck_autodeclaracao_conferencia CHECK ((situacao = 'DECLARADA') =
                                                                                        (conferida_por IS NULL AND conferida_em IS NULL) AND (conferida_por IS NULL) =
                                                                                                                                             (conferida_em IS NULL)),
                                        CONSTRAINT ck_autodeclaracao_motivo CHECK ((situacao = 'RECUSADA') = (motivo_recusa
                                            IS NOT NULL) AND (motivo_recusa IS NULL OR btrim(motivo_recusa) <> '')),
                                        CONSTRAINT fk_autodeclaracao_reserva_conferida_por FOREIGN KEY (conferida_por)
                                            REFERENCES pessoa (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
                                        CONSTRAINT fk_autodeclaracao_reserva_candidatura_id FOREIGN KEY (candidatura_id)
                                            REFERENCES candidatura (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);