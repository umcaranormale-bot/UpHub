create table teste_flyway (
                              id        bigint generated always as identity primary key,
                              mensagem  text not null,
                              criado_em timestamptz not null default now()
);

insert into teste_flyway (mensagem) values ('Flyway rodou com sucesso');