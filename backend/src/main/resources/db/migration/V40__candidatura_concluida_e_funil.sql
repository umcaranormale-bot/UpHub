-- Itens centrais do desafio que faltavam na candidatura (V19):
-- 1) o estado final CONCLUIDA (rascunho → submetida → em análise → aprovada → em acompanhamento → concluída);
-- 2) o estágio do funil da trilha Investimento (inscrita → triada → em diligência → selecionada).
ALTER TABLE candidatura DROP CONSTRAINT ck_candidatura_estado;
ALTER TABLE candidatura ADD CONSTRAINT ck_candidatura_estado CHECK (estado IN ('RASCUNHO', 'ENVIADA',
    'ELEGIVEL', 'NAO_ELEGIVEL', 'EM_ANALISE', 'AJUSTE', 'PERDA_DE_PRAZO',
    'APROVADA', 'REPROVADA', 'HOMOLOGADA', 'LISTA_DE_ESPERA', 'EM_ACOMPANHAMENTO',
    'DESISTENTE', 'NAO_CONVOCADA', 'DESCLASSIFICADA', 'DESCARTADA', 'CONCLUIDA'));

ALTER TABLE candidatura ADD COLUMN estagio_funil varchar(20);
ALTER TABLE candidatura ADD CONSTRAINT ck_candidatura_estagio_funil CHECK (estagio_funil IS NULL
    OR estagio_funil IN ('INSCRITA', 'TRIADA', 'EM_DILIGENCIA', 'SELECIONADA'));
