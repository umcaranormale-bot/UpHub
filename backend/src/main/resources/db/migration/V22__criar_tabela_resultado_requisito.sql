CREATE TABLE resultado_requisito (
                                     candidatura_id bigint,
                                     requisito_id bigint,
                                     situacao varchar(15) NOT NULL,
                                     valor_informado text,
                                     avaliado_em timestamptz NOT NULL DEFAULT now(),
                                     CONSTRAINT pk_resultado_requisito PRIMARY KEY (candidatura_id, requisito_id),
                                     CONSTRAINT ck_resultado_situacao CHECK (situacao IN
                                                                             ('ATENDIDO','NAO_ATENDIDO','PENDENTE')),
                                     CONSTRAINT fk_resultado_requisito_candidatura_id FOREIGN KEY (candidatura_id)
                                         REFERENCES candidatura (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
                                     CONSTRAINT fk_resultado_requisito_requisito_id FOREIGN KEY (requisito_id)
                                         REFERENCES requisito_elegibilidade (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);
