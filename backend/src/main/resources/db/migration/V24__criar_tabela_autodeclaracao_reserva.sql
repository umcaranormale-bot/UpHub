CREATE TABLE autodeclaracao_reserva (
                                        candidatura_id bigint,
                                        criterio varchar(80),
                                        declarada_em timestamptz NOT NULL DEFAULT now(),
                                        CONSTRAINT pk_autodeclaracao_reserva PRIMARY KEY (candidatura_id, criterio),
                                        CONSTRAINT fk_autodeclaracao_reserva_candidatura_id FOREIGN KEY (candidatura_id)
                                            REFERENCES candidatura (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);