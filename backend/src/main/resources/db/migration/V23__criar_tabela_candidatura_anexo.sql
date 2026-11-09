CREATE TABLE candidatura_anexo (
                                   candidatura_id       bigint,
                                   documento_id         bigint,
                                   documento_exigido_id bigint,

                                   CONSTRAINT pk_candidatura_anexo
                                       PRIMARY KEY (candidatura_id, documento_id),

                                   CONSTRAINT fk_candidatura_anexo_candidatura_id
                                       FOREIGN KEY (candidatura_id)
                                           REFERENCES candidatura (id)
                                           ON DELETE RESTRICT ON UPDATE RESTRICT,

                                   CONSTRAINT fk_candidatura_anexo_documento_id
                                       FOREIGN KEY (documento_id)
                                           REFERENCES documento (id)
                                           ON DELETE RESTRICT ON UPDATE RESTRICT,

                                   CONSTRAINT fk_candidatura_anexo_documento_exigido_id
                                       FOREIGN KEY (documento_exigido_id)
                                           REFERENCES documento_exigido (id)
                                           ON DELETE RESTRICT ON UPDATE RESTRICT
);