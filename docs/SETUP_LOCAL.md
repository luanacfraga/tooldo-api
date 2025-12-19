# Setup Local (Desenvolvimento)

Guia mínimo para rodar a API localmente.

## Pré-requisitos

- Node.js 18+ (recomendado 20+)
- npm
- Docker (opcional, recomendado para Postgres via `docker-compose`)

## 1) Instalar dependências

```bash
npm install
```

## 2) Variáveis de ambiente

Crie `.env` na raiz do projeto:

- `DATABASE_URL`
- `JWT_SECRET`

## 3) Subir Postgres local (opcional)

```bash
docker-compose up -d
```

## 4) Prisma (gerar client + migrações)

```bash
npm run prisma:generate
npm run prisma:migrate
```

## 5) Rodar API

```bash
npm run start:dev
```

## 6) Testar health

```bash
curl http://localhost:3000/api/v1/health
```

# Setup Local (Desenvolvimento)

Este guia cobre apenas o **setup inicial** para rodar a API localmente.

## Pré-requisitos

- Node.js 18+ (recomendado 20+)
- npm
- Docker (opcional, recomendado para subir o Postgres via `docker-compose`)

## 1) Instalar dependências

```bash
npm install
```

## 2) Variáveis de ambiente

Crie um `.env` na raiz do projeto (ou use `.env.example` se existir no seu repo):

- **Obrigatórias**:
  - `DATABASE_URL`
  - `JWT_SECRET`

- **Recomendadas (local/dev)**:
  - `NODE_ENV=development`
  - `PORT=3000`
  - `ALLOWED_ORIGINS` (em dev pode ser omitido; em produção deve ser definido)

## 3) Subir Postgres local (opcional)

Se quiser usar o Postgres via Docker:

```bash
docker-compose up -d
```

O `docker-compose.yml` expõe Postgres em `localhost:5433`.

## 4) Prisma (gerar client + migrações)

```bash
npm run prisma:generate
npm run prisma:migrate
```

## 5) Rodar API

```bash
npm run start:dev
```

## 6) Testar Health

Com versionamento por URI, o health fica em:

```bash
curl http://localhost:3000/api/v1/health
```

## Links úteis

- **Tecnologias**: [TECNOLOGIAS.md](TECNOLOGIAS.md)
