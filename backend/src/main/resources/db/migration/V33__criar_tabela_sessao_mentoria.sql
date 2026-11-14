CREATE TABLE sessao_mentoria (
                                 id bigint GENERATED ALWAYS AS IDENTITY,
                                 alocacao_id bigint NOT NULL,
                                 sprint_id bigint,
                                 data_sessao date NOT NULL,
                                 duracao_minutos smallint NOT NULL,
                                 feedback text,
                                 situacao varchar(10) NOT NULL DEFAULT 'RASCUNHO',
                                 assinado_em timestamptz,
                                 registrada_em timestamptz NOT NULL DEFAULT now(),
                                 CONSTRAINT pk_sessao_mentoria PRIMARY KEY (id),
                                 CONSTRAINT ck_sessao_duracao CHECK (duracao_minutos > 0),
                                 CONSTRAINT ck_sessao_situacao CHECK (situacao IN ('RASCUNHO','ASSINADO')),
                                 CONSTRAINT ck_sessao_assinatura CHECK (situacao = 'RASCUNHO' OR (assinado_em IS NOT
                                     NULL AND feedback IS NOT NULL AND btrim(feedback) <> '')),
                                 CONSTRAINT fk_sessao_mentoria_alocacao_id FOREIGN KEY (alocacao_id) REFERENCES
                                     alocacao_mentor (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
                                 CONSTRAINT fk_sessao_mentoria_sprint_id FOREIGN KEY (sprint_id) REFERENCES sprint
                                     (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);
CREATE INDEX ix_sessao_alocacao_data ON sessao_mentoria (alocacao_id, data_sessao);