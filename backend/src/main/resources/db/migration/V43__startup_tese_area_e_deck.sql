-- Tipos de organização do desafio: entram STARTUP e ACELERADORA. PESSOA_FISICA continua aceita no banco
-- só para não quebrar linhas antigas; a API não cadastra mais esse tipo.
ALTER TABLE organizacao DROP CONSTRAINT ck_organizacao_tipo;
ALTER TABLE organizacao ADD CONSTRAINT ck_organizacao_tipo CHECK (tipo IN ('EMPRESA','STARTUP','SQUAD','PESSOA_FISICA',
    'ORGAO_FOMENTO','INVESTIDOR','ACELERADORA','EMPRESA_PARCEIRA','GESTAO'));

-- Perfil e deck da startup (C2): a descrição do negócio e o documento do deck.
ALTER TABLE organizacao
    ADD COLUMN descricao text,
    ADD COLUMN deck_documento_id bigint;
ALTER TABLE organizacao
    ADD CONSTRAINT fk_organizacao_deck_documento_id FOREIGN KEY (deck_documento_id)
        REFERENCES documento (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    ADD CONSTRAINT ck_organizacao_deck_so_startup CHECK (deck_documento_id IS NULL OR tipo = 'STARTUP');

-- Área da oportunidade e tese de investimento (C1 e o matching, M2).
ALTER TABLE oportunidade
    ADD COLUMN area varchar(80),
    ADD COLUMN tese text;
ALTER TABLE oportunidade
    ADD CONSTRAINT ck_oportunidade_tese_investimento CHECK (tese IS NULL OR trilha_codigo = 'INVESTIMENTO');
