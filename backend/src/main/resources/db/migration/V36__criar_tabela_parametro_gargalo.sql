CREATE TABLE parametro_gargalo (
                                   etapa varchar(20),
                                   limite_dias_uteis smallint NOT NULL DEFAULT 5,
                                   CONSTRAINT pk_parametro_gargalo PRIMARY KEY (etapa),
                                   CONSTRAINT ck_gargalo_etapa CHECK (etapa IN
                                                                      ('PUBLICACAO','ELEGIBILIDADE','AVALIACAO','HOMOLOGACAO')),
                                   CONSTRAINT ck_gargalo_limite CHECK (limite_dias_uteis > 0)
);
INSERT INTO parametro_gargalo (etapa) VALUES
                                          ('PUBLICACAO'),('ELEGIBILIDADE'),('AVALIACAO'),('HOMOLOGACAO');