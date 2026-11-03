CREATE TABLE criterio (
                          id bigint GENERATED ALWAYS AS IDENTITY,
                          versao_id bigint NOT NULL,
                          ordem smallint,
                          descricao text NOT NULL,
                          peso numeric(5,2),
                          escala_min numeric(5,2),
                          escala_max numeric(5,2),
                          evidencia_esperada text,
                          CONSTRAINT pk_criterio PRIMARY KEY (id),
                          CONSTRAINT ck_criterio_peso CHECK (peso IS NULL OR (peso > 0 AND peso <= 100)),
                          CONSTRAINT ck_criterio_escala CHECK (escala_min IS NULL OR escala_max IS NULL OR
                                                               escala_max > escala_min),
                          CONSTRAINT fk_criterio_versao_id FOREIGN KEY (versao_id)
                              REFERENCES versao_oportunidade (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);
CREATE INDEX ix_criterio_versao ON criterio (versao_id);