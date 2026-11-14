ALTER TABLE oportunidade
    ADD COLUMN suspensa_em timestamptz,
ADD CONSTRAINT ck_oportunidade_suspensao CHECK (suspensa_em IS NULL OR estado <>
'RASCUNHO');