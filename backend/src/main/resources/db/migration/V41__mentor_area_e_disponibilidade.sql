-- Alocação de mentores por área e disponibilidade (desafio, trilha 2): a área de atuação e as horas
-- livres por mês ficam no vínculo do mentor. Só fazem sentido no papel MENTOR.
ALTER TABLE vinculo
    ADD COLUMN area_atuacao varchar(80),
    ADD COLUMN horas_disponiveis_mes numeric(5,1);

ALTER TABLE vinculo
    ADD CONSTRAINT ck_vinculo_horas_disponiveis CHECK (horas_disponiveis_mes IS NULL OR horas_disponiveis_mes > 0),
    ADD CONSTRAINT ck_vinculo_mentoria_so_mentor CHECK (papel = 'MENTOR' OR (area_atuacao IS NULL AND horas_disponiveis_mes IS NULL));
