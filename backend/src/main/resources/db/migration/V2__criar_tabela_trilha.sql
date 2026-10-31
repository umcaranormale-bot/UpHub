CREATE TABLE trilha (
                        codigo varchar(20),
                        nome varchar(40) NOT NULL,
                        CONSTRAINT pk_trilha PRIMARY KEY (codigo),
                        CONSTRAINT uq_trilha_nome UNIQUE (nome)
);