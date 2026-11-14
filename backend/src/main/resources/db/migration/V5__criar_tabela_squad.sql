CREATE TABLE squad (
                       organizacao_id bigint,
                       descricao text,
                       codigo_coordenacao varchar(40),
                       CONSTRAINT pk_squad PRIMARY KEY (organizacao_id),
                       CONSTRAINT fk_squad_organizacao_id FOREIGN KEY (organizacao_id)
                           REFERENCES organizacao (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);