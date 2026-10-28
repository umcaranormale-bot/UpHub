# Migrations do Up Hub

Os arquivos `.sql` desta pasta são aplicados pelo Flyway, em ordem de versão,
toda vez que a aplicação sobe.

## Nome do arquivo

    V<numero>__<descricao>.sql

Exemplo: V3__criar_tabela_oportunidade.sql

- `V` maiúsculo
- **dois** underlines entre oa número e a descrição
- underline no lugar de espaço na descrição

## Regras

1. Antes de criar, olhe o maior número desta pasta na branch `main` e avise no
   grupo qual número você pegou.
2. Arquivo já aplicado **nunca** é editado nem apagado. Para corrigir, crie um
   arquivo novo com a próxima versão.
3. O SQL Editor do Supabase serve para descobrir o comando certo. Quem aplica
   é o Flyway.

O passo a passo completo está no guia da frente de banco de dados.