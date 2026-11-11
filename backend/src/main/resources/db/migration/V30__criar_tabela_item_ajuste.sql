CREATE TABLE item_ajuste (
                             id bigint GENERATED ALWAYS AS IDENTITY,
                             pedido_ajuste_id bigint NOT NULL,
                             descricao varchar(200) NOT NULL,
                             detalhe text,
                             documento_exigido_id bigint,
                             documento_novo_id bigint,
                             corrigido_em timestamptz,
                             CONSTRAINT pk_item_ajuste PRIMARY KEY (id),
                             CONSTRAINT ck_item_ajuste_documento CHECK (documento_novo_id IS NULL OR corrigido_em
                                 IS NOT NULL),
                             CONSTRAINT fk_item_ajuste_pedido FOREIGN KEY (pedido_ajuste_id)
                                 REFERENCES pedido_ajuste (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
                             CONSTRAINT fk_item_ajuste_documento_exigido FOREIGN KEY (documento_exigido_id)
                                 REFERENCES documento_exigido (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
                             CONSTRAINT fk_item_ajuste_documento_novo FOREIGN KEY (documento_novo_id)
                                 REFERENCES documento (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);
CREATE INDEX ix_item_ajuste_pedido ON item_ajuste (pedido_ajuste_id);