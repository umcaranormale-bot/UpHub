CREATE TABLE reserva_vagas (
                               id bigint GENERATED ALWAYS AS IDENTITY,
                               versao_id bigint NOT NULL,
                               criterio varchar(80) NOT NULL,
                               CONSTRAINT pk_reserva_vagas PRIMARY KEY (id),
                               CONSTRAINT uq_reserva_versao_criterio UNIQUE (versao_id, criterio),
                               CONSTRAINT fk_reserva_vagas_versao_id FOREIGN KEY (versao_id)
                                   REFERENCES versao_oportunidade (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);