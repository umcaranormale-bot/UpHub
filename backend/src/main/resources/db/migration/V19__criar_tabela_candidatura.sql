CREATE TABLE candidatura (
                             id bigint GENERATED ALWAYS AS IDENTITY,
                             oportunidade_id bigint NOT NULL,
                             versao_id bigint,
                             organizacao_id bigint NOT NULL,
                             criada_por bigint NOT NULL,
                             titulo_proposta varchar(200),
                             resumo_executivo text,
                             valor_solicitado numeric(14,2),
                             estado varchar(20) NOT NULL DEFAULT 'RASCUNHO',
                             salva_em timestamptz,
                             enviada_em timestamptz,
                             perfil_congelado jsonb,
                             posicao_lista smallint,
                             criada_em timestamptz NOT NULL DEFAULT now(),
                             CONSTRAINT pk_candidatura PRIMARY KEY (id),
                             CONSTRAINT uq_candidatura_id_oportunidade UNIQUE (id, oportunidade_id),
                             CONSTRAINT uq_candidatura_org_oportunidade UNIQUE (oportunidade_id, organizacao_id),
                             CONSTRAINT ck_candidatura_estado CHECK (estado IN ('RASCUNHO','ENVIADA','ELEGIVEL',
                                                                                'NAO_ELEGIVEL','EM_ANALISE','AJUSTE','PERDA_DE_PRAZO','APROVADA','REPROVADA',
                                                                                'HOMOLOGADA','LISTA_DE_ESPERA','EM_ACOMPANHAMENTO')),
                             CONSTRAINT ck_candidatura_valor CHECK (valor_solicitado IS NULL OR valor_solicitado
                                 >= 0),
                             CONSTRAINT ck_candidatura_lista CHECK ((estado = 'LISTA_DE_ESPERA') = (posicao_lista
                                 IS NOT NULL)),
                             CONSTRAINT ck_candidatura_posicao CHECK (posicao_lista IS NULL OR posicao_lista >
                                                                                               0),
                             CONSTRAINT ck_candidatura_envio CHECK (estado = 'RASCUNHO' OR (enviada_em IS NOT
                                 NULL AND versao_id IS NOT NULL)),
                             CONSTRAINT fk_candidatura_oportunidade_id FOREIGN KEY (oportunidade_id) REFERENCES
                                 oportunidade (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
                             CONSTRAINT fk_candidatura_organizacao_id FOREIGN KEY (organizacao_id) REFERENCES
                                 organizacao (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
                             CONSTRAINT fk_candidatura_criada_por FOREIGN KEY (criada_por) REFERENCES pessoa (id)
                                 ON DELETE RESTRICT ON UPDATE RESTRICT,
                             CONSTRAINT fk_candidatura_versao FOREIGN KEY (versao_id, oportunidade_id) REFERENCES
                                 versao_oportunidade (id, oportunidade_id) ON DELETE RESTRICT ON UPDATE RESTRICT
);
CREATE INDEX ix_candidatura_oportunidade_estado ON candidatura (oportunidade_id,
                                                                estado);
CREATE INDEX ix_candidatura_organizacao ON candidatura (organizacao_id, estado);
CREATE UNIQUE INDEX ux_candidatura_lista ON candidatura (oportunidade_id, posicao_lista)
    WHERE estado = 'LISTA_DE_ESPERA';