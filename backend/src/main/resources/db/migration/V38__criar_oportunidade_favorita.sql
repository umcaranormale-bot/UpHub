CREATE TABLE oportunidade_favorita (
                                       organizacao_id bigint NOT NULL,
                                       oportunidade_id bigint NOT NULL,
                                       favoritada_por bigint NOT NULL,
                                       favoritada_em timestamptz NOT NULL DEFAULT now(),
                                       CONSTRAINT pk_oportunidade_favorita PRIMARY KEY (organizacao_id, oportunidade_id),
                                       CONSTRAINT fk_oportunidade_favorita_organizacao_id FOREIGN KEY (organizacao_id)
                                           REFERENCES organizacao (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
                                       CONSTRAINT fk_oportunidade_favorita_oportunidade_id FOREIGN KEY (oportunidade_id)
                                           REFERENCES oportunidade (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
                                       CONSTRAINT fk_oportunidade_favorita_favoritada_por FOREIGN KEY (favoritada_por)
                                           REFERENCES pessoa (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);
CREATE INDEX ix_oportunidade_favorita_oportunidade ON oportunidade_favorita
    (oportunidade_id);