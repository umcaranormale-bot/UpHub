-- O mentor avalia cada entrega de sprint (desafio, trilha 3): nota de 0 a 10 e feedback.
ALTER TABLE sprint
    ADD COLUMN nota_entrega numeric(4,2),
    ADD COLUMN feedback_entrega text,
    ADD COLUMN avaliada_por bigint,
    ADD COLUMN avaliada_em timestamptz;

ALTER TABLE sprint
    ADD CONSTRAINT fk_sprint_avaliada_por FOREIGN KEY (avaliada_por)
        REFERENCES pessoa (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    ADD CONSTRAINT ck_sprint_nota_entrega CHECK (nota_entrega IS NULL OR (nota_entrega >= 0 AND nota_entrega <= 10)),
    ADD CONSTRAINT ck_sprint_avaliacao CHECK ((estado = 'AVALIADA') = (avaliada_em IS NOT NULL)
        AND (avaliada_em IS NULL OR (nota_entrega IS NOT NULL AND avaliada_por IS NOT NULL
             AND feedback_entrega IS NOT NULL AND btrim(feedback_entrega) <> '')));
