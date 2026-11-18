# Up Hub

Uma plataforma única onde toda oportunidade do ecossistema é publicada, encontra o candidato certo por critérios claros e é acompanhada até o fim. Uma base comum sustenta **fomento**, **investimento** e **formação**, e a gestão do Porto Digital vê tudo em um só painel.

Desafio técnico da Residência Porto Digital (Rise Up · FICR), feito pela Squad 3.

---

## Uma plataforma, três trilhas

O princípio do desafio é: **a plataforma é uma, não três**. As três trilhas seguem o mesmo padrão: alguém oferece uma oportunidade com critérios, alguém se candidata, e facilitadores acompanham e avaliam. Por isso, cada trilha é uma **coluna** (`trilha_codigo`) na mesma oportunidade e na mesma candidatura, e não um sistema à parte.

```
                         ┌──────────────── base comum ────────────────┐
  organização + vínculo ─┤ oportunidade → versão → candidatura → avaliação → resultado → acompanhamento ├─ painel
  (tipo + papel)         └────────────────────────────────────────────┘
                              │                   │                  │
                        FOMENTO (edital)   INVESTIMENTO (tese)   FORMAÇÃO (desafio)
```

| Peça da base | Fomento | Investimento | Formação |
|---|---|---|---|
| Oportunidade e versão (prazo, vagas, critérios, requisitos) | edital | programa ou rodada, com **tese** | desafio proposto por uma empresa, numa **residência** |
| Quem se candidata | empresas e startups | startups (com deck) | squads |
| Motor de elegibilidade | regras do edital | regras do programa | regras do desafio |
| Motor de matching | área + perfil + elegibilidade | **tese** + área + perfil | **competências da squad** + área |
| Máquina de estados da candidatura | a mesma | a mesma, mais o **funil** (kanban) | a mesma |
| Avaliação por critérios, ajuste e rodadas | sim | sim | sim |
| Mentoria, sprints e sessões | sim | sim | sim (com a residência) |
| Painel da gestão | sim | sim | sim |

O que é específico de uma trilha fica numa coluna ou tabela pequena ligada à base: a tese e o funil no Investimento; a residência e as squads na Formação.

## Os cinco papéis (RBAC)

Cada pessoa tem um **vínculo** com uma organização, e o vínculo tem um **papel**. O papel decide o que a pessoa pode fazer **naquela** organização. A regra está no servidor; o front só reflete.

| Papel | O que faz |
|---|---|
| `PROVEDOR` | cria e publica oportunidades, designa avaliadores, convida mentores e conduz a seleção |
| `CANDIDATO` | cria e envia candidaturas, monta a squad, responde aos ajustes e entrega as sprints |
| `AVALIADOR` | avalia as candidaturas que recebeu, com nota por critério e parecer |
| `MENTOR` | acompanha as candidaturas homologadas, com sprints e sessões |
| `GESTAO` | aprova os provedores, abre as residências e vê o painel do ecossistema |

- **Multi-tenant:** cada organização vê só os próprios dados, e a gestão vê todas (`seguranca/Acesso`).
- **Permissões explícitas:** a tabela de quem pode o quê fica num lugar só (`seguranca/Permissao`).
- **Login:** todo endereço em `/api/**` exige o token do login, menos os marcados com `@Publico` (cadastro, login, confirmação de e-mail, esqueci a senha, convites e trilhas).
- **Testes:** `PermissaoTest`, `AcessoTest` e `RotasPublicasTest` travam a tabela de permissões e a lista de endereços públicos.

## Stack, e por quê

| Camada | Escolha | Por quê |
|---|---|---|
| Back-end | Java 21 + Spring Boot 4 | tipagem forte para as regras de negócio, ecossistema maduro (JPA, validação, agendamento) e conhecido pela squad |
| Banco | PostgreSQL 16 + Flyway | relacional, com constraints que protegem as regras no próprio banco; Flyway versiona cada mudança como migration |
| Token | JWT (Nimbus) + senha com BCrypt | sessão sem estado no servidor, simples de validar a cada requisição |
| Front-end | React + TypeScript + Vite + Tailwind | tipos compartilhados com a API (pasta `frontend/src/api`), build rápido |
| Documentação da API | Swagger (springdoc) | a documentação sai do próprio código e fica sempre atualizada |
| Deploy | Docker no Render (API), Cloudflare (front), PostgreSQL gerenciado | sobe a cada merge na `main` |
| CI | GitHub Actions | build e testes a cada push e pull request |

## Arquitetura do back-end

Camadas, de fora para dentro: `controller` → `service` → `repository` → `model`. As entradas e saídas são `record`s em `dto`.

```
backend/src/main/java/br/com/uphub/backend/
├── controller/     os endereços HTTP; não têm regra de negócio
├── service/        as regras de negócio de cada assunto
├── repository/     acesso ao banco (Spring Data JPA)
├── model/          as entidades (uma por tabela)
├── dto/            o que entra e o que sai de cada endereço
├── seguranca/      token, @PessoaLogada, @Publico, Permissao e Acesso (RBAC e multi-tenant)
├── candidatura/    MaquinaDeEstados, EstagioFunil, EtapaDoEnvio e TiposPorTrilha
├── elegibilidade/  MotorElegibilidade, os campos e os operadores das regras
└── matching/       MotorMatching
```

### Os motores

São classes puras: não acessam o banco e têm teste JUnit.

- **Máquina de estados** (`candidatura/MaquinaDeEstados`): os 17 estados da candidatura, de `RASCUNHO` a `CONCLUIDA`, as transições e o ator que pode fazer cada uma (candidato, provedor, avaliador ou sistema). Uma transição que não existe vira **409**; um ator errado, **403**.
- **Motor de elegibilidade** (`elegibilidade/MotorElegibilidade`): confere as regras da versão contra o perfil da organização e devolve elegível, inelegível ou pendente, com o que faltou. Roda no envio, e o extrato fica guardado.
- **Motor de matching** (`matching/MotorMatching`): nota de 0 a 100 por critérios ponderados (elegibilidade, área, perfil, tese e competências), com pesos por trilha e a explicação de cada ponto.
- **Etapas do envio** (`candidatura/EtapaDoEnvio`): cada parte da candidatura (participantes, notas, anexos) confere o que é dela antes do envio, sem mexer no serviço da candidatura.

## Rodar no computador

**Pré-requisitos:** Java 21, Maven, Node 22 e um PostgreSQL 16.

**Back-end.** As variáveis ficam num `.env` dentro de `backend/`, que está no `.gitignore` e **nunca** vai para o GitHub:

```
DB_URL=jdbc:postgresql://localhost:5432/uphub
DB_USER=postgres
DB_PASSWORD=********
JWT_SECRET=********          # 48 bytes aleatórios em base64
```

```
cd backend
mvn spring-boot:run          # sobe em http://localhost:8080 e aplica as migrations
```

A documentação interativa da API fica em **http://localhost:8080/swagger-ui.html**. Para testar um endereço protegido, faça o login em `POST /api/auth/login`, clique em **Authorize** e cole o token.

**Front-end:**

```
cd frontend
npm ci
npm run dev                  # http://localhost:5173, falando com o back-end de VITE_API_URL
```

## Testes

```
cd backend
mvn verify                   # precisa de DB_URL, DB_USER, DB_PASSWORD e JWT_SECRET
```

| Teste | O que garante |
|---|---|
| `MaquinaDeEstadosTest` | o caminho completo até `CONCLUIDA`, as transições inválidas, os papéis errados e os estados finais |
| `MotorElegibilidadeTest` | cada operador das regras, os pendentes e o resultado geral |
| `MotorMatchingTest` | os pesos de cada trilha somam 100, a tese, o perfil, a squad, o inelegível e o pendente |
| `PermissaoTest` | a tabela de quem pode o quê (RBAC) |
| `AcessoTest` | cada organização vê só os próprios dados, a gestão vê todas, e o papel decide a ação |
| `RotasPublicasTest` | só os endereços combinados funcionam sem login |
| `BackendApplicationTests` | a aplicação sobe e todas as migrations rodam num banco vazio |

Além do JUnit, cada entrega foi testada no Postman contra um banco de testes, com as coleções de cada parte rodando de novo a cada entrega.

## CI

O `.github/workflows/ci.yml` roda a cada push na `main` e a cada pull request:

- **back-end:** sobe um PostgreSQL descartável, roda as migrations do zero e `mvn verify` (build e todos os testes);
- **front-end:** `npm ci`, lint e build.

## Banco de dados

As migrations ficam em `backend/src/main/resources/db/migration`, de `V1` (pessoa) em diante. O Flyway aplica as novas a cada subida, inclusive fora de ordem (`spring.flyway.out-of-order=true`), porque as branches da squad numeram as migrations em paralelo.
