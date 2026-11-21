CREATE TABLE sprint (
                        id bigint GENERATED ALWAYS AS IDENTITY,
                        candidatura_id bigint NOT NULL,
                        numero smallint NOT NULL,
                        estado varchar(15) NOT NULL DEFAULT 'PLANEJADA',
                        prazo_entrega date,
                        entrega_descricao text,
                        entrega_registrada_em timestamptz,
                        CONSTRAINT pk_sprint PRIMARY KEY (id),
                        CONSTRAINT uq_sprint_numero UNIQUE (candidatura_id, numero),
                        CONSTRAINT ck_sprint_estado CHECK (estado IN
                                                           ('PLANEJADA','EM_ANDAMENTO','ENTREGUE','AVALIADA')),
                        CONSTRAINT ck_sprint_numero CHECK (numero >= 1),
                        CONSTRAINT ck_sprint_entrega CHECK (estado NOT IN ('ENTREGUE','AVALIADA') OR
                                                            entrega_registrada_em IS NOT NULL),
                        CONSTRAINT fk_sprint_candidatura_id FOREIGN KEY (candidatura_id) REFERENCES
                            candidatura (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);