CREATE TABLE evento_auditoria (
                                  id bigint GENERATED ALWAYS AS IDENTITY,
                                  ocorrido_em timestamptz NOT NULL DEFAULT now(),
                                  autor_pessoa_id bigint,
                                  autor_sistema varchar(60),
                                  papel varchar(20),
                                  acao varchar(80) NOT NULL,
                                  entidade_tipo varchar(40) NOT NULL,
                                  entidade_id bigint NOT NULL,
                                  oportunidade_id bigint,
                                  candidatura_id bigint,
                                  versao_id bigint,
                                  estado_anterior varchar(30),
                                  estado_novo varchar(30),
                                  justificativa text,
                                  CONSTRAINT pk_evento_auditoria PRIMARY KEY (id),
                                  CONSTRAINT ck_auditoria_autor CHECK (autor_pessoa_id IS NOT NULL OR autor_sistema IS
                                      NOT NULL),
                                  CONSTRAINT fk_evento_auditoria_autor_pessoa_id FOREIGN KEY (autor_pessoa_id)
                                      REFERENCES pessoa (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
                                  CONSTRAINT fk_evento_auditoria_oportunidade_id FOREIGN KEY (oportunidade_id)
                                      REFERENCES oportunidade (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
                                  CONSTRAINT fk_evento_auditoria_candidatura_id FOREIGN KEY (candidatura_id)
                                      REFERENCES candidatura (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
                                  CONSTRAINT fk_evento_auditoria_versao_id FOREIGN KEY (versao_id) REFERENCES
                                      versao_oportunidade (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);
CREATE INDEX ix_auditoria_oportunidade ON evento_auditoria (oportunidade_id,
                                                            ocorrido_em);
CREATE INDEX ix_auditoria_candidatura ON evento_auditoria (candidatura_id, ocorrido_em);
CREATE FUNCTION fn_evento_auditoria_imutavel() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
RAISE EXCEPTION 'evento_auditoria e imutavel (UPDATE/DELETE proibidos)';
END;
$$;
CREATE TRIGGER trg_evento_auditoria_imutavel BEFORE UPDATE OR DELETE ON evento_auditoria
FOR EACH ROW EXECUTE FUNCTION fn_evento_auditoria_imutavel();