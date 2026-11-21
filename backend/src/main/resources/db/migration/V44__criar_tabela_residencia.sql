-- Residência (desafio, trilha Formação): a coordenação, que é a gestão do Porto Digital, abre a residência.
-- As squads entram com o código; as empresas ligam os desafios (oportunidades da Formação) a ela.
CREATE TABLE residencia (
    id          bigint GENERATED ALWAYS AS IDENTITY,
    nome        varchar(200) NOT NULL,
    descricao   text,
    codigo      varchar(40)  NOT NULL,
    inicio      date         NOT NULL,
    fim         date         NOT NULL,
    estado      varchar(15)  NOT NULL DEFAULT 'ABERTA',
    criada_por  bigint       NOT NULL,
    criada_em   timestamptz  NOT NULL DEFAULT now(),
    encerrada_em timestamptz,
    CONSTRAINT pk_residencia PRIMARY KEY (id),
    CONSTRAINT uq_residencia_codigo UNIQUE (codigo),
    CONSTRAINT ck_residencia_periodo CHECK (fim >= inicio),
    CONSTRAINT ck_residencia_estado CHECK (estado IN ('ABERTA', 'ENCERRADA')),
    CONSTRAINT ck_residencia_encerramento CHECK ((estado = 'ENCERRADA') = (encerrada_em IS NOT NULL)),
    CONSTRAINT fk_residencia_criada_por FOREIGN KEY (criada_por)
        REFERENCES pessoa (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

ALTER TABLE squad ADD COLUMN residencia_id bigint;
ALTER TABLE squad ADD CONSTRAINT fk_squad_residencia_id FOREIGN KEY (residencia_id)
    REFERENCES residencia (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE oportunidade ADD COLUMN residencia_id bigint;
ALTER TABLE oportunidade
    ADD CONSTRAINT fk_oportunidade_residencia_id FOREIGN KEY (residencia_id)
        REFERENCES residencia (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    ADD CONSTRAINT ck_oportunidade_residencia_formacao CHECK (residencia_id IS NULL OR trilha_codigo = 'FORMACAO');

CREATE INDEX ix_squad_residencia ON squad (residencia_id);
CREATE INDEX ix_oportunidade_residencia ON oportunidade (residencia_id);
