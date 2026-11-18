CREATE TABLE documento (
                           id bigint GENERATED ALWAYS AS IDENTITY,
                           organizacao_id bigint NOT NULL,
                           enviado_por bigint NOT NULL,
                           tipo varchar(60) NOT NULL,
                           nome_arquivo varchar(255) NOT NULL,
                           tamanho_bytes bigint NOT NULL,
                           tipo_mime varchar(100),
                           armazenamento_ref text NOT NULL,
                           validade date,
                           texto_pesquisavel boolean,
                           enviado_em timestamptz NOT NULL DEFAULT now(),
                           CONSTRAINT pk_documento PRIMARY KEY (id),
                           CONSTRAINT ck_documento_tamanho CHECK (tamanho_bytes > 0),
                           CONSTRAINT fk_documento_organizacao_id FOREIGN KEY (organizacao_id)
                               REFERENCES organizacao (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
                           CONSTRAINT fk_documento_enviado_por FOREIGN KEY (enviado_por)
                               REFERENCES pessoa (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);
CREATE INDEX ix_documento_organizacao ON documento (organizacao_id, tipo);