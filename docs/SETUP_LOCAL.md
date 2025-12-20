# Setup Local (Desenvolvimento)

Este guia cobre o **setup completo** para rodar a API Tooldo localmente.

## 📋 Pré-requisitos

- Node.js 18+ (recomendado 20+)
- npm
- Docker (opcional, recomendado para subir o Postgres via `docker-compose`)

## 🚀 Passo a Passo

### 1) Instalar dependências

```bash
npm install
```

### 2) Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto (ou use `.env.example` se existir):

**Variáveis obrigatórias:**

```env
DATABASE_URL="postgresql://user:password@localhost:5432/tooldo_db?schema=public"
JWT_SECRET="your-secret-key-change-me-minimum-32-characters"
```

**Variáveis recomendadas (local/dev):**

```env
NODE_ENV="development"
PORT=3000
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:3001"
ALLOWED_ORIGINS="http://localhost:3001"
```

**Nota:** Em desenvolvimento, `ALLOWED_ORIGINS` pode ser omitido. Em produção deve ser definido.

### 3) Subir Postgres local (opcional)

Se quiser usar o Postgres via Docker:

```bash
docker-compose up -d
```

O `docker-compose.yml` expõe Postgres em `localhost:5433`.

**Alternativa:** Use um banco PostgreSQL local ou remoto, ajustando a `DATABASE_URL` no `.env`.

### 4) Prisma (gerar client + migrações)

```bash
# Gerar cliente Prisma
npm run prisma:generate

# Executar migrações
npm run prisma:migrate
```

### 5) Rodar API

```bash
npm run start:dev
```

A API estará disponível em `http://localhost:3000`.

### 6) Testar Health

Com versionamento por URI, o health check fica em:

```bash
curl http://localhost:3000/api/v1/health
```

Deve retornar:

```json
{
  "status": "ok",
  "timestamp": "...",
  "service": "tooldo-api"
}
```

## 📚 Próximos Passos

- **Swagger/OpenAPI**: Acesse `http://localhost:3000/api/docs` para documentação interativa
- **Prisma Studio**: Execute `npm run prisma:studio` para visualizar o banco de dados
- **Desenvolvimento**: Consulte **[MEMORY_BANK_PADROES.md](../MEMORY_BANK_PADROES.md)** para padrões de código

## 🔧 Comandos Úteis

```bash
# Modo watch (recompila automaticamente)
npm run start:dev

# Modo debug
npm run start:debug

# Verificar tipos TypeScript
npm run typecheck

# Executar lint
npm run lint

# Executar testes
npm run test

# Abrir Prisma Studio
npm run prisma:studio
```

## 🆘 Troubleshooting

### Erro de conexão com banco de dados

- Verifique se o PostgreSQL está rodando
- Confirme a `DATABASE_URL` no `.env`
- Se usar Docker, verifique: `docker-compose ps`

### Erro de migração Prisma

- Execute `npm run prisma:generate` antes de `prisma:migrate`
- Verifique se o banco de dados existe
- Verifique permissões do usuário do banco

### Porta já em uso

- Altere a `PORT` no `.env`
- Ou pare o processo que está usando a porta 3000

## 🔗 Links Úteis

- **[TECNOLOGIAS.md](./TECNOLOGIAS.md)**: Detalhes técnicos das tecnologias
- **[MEMORY_BANK_PADROES.md](../MEMORY_BANK_PADROES.md)**: Padrões de código
- **[BUSINESS_RULES.md](../BUSINESS_RULES.md)**: Regras de negócio

---

**Pronto para desenvolver! 🎉**
