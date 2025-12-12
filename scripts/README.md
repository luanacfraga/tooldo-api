# Scripts de Deploy AWS

Scripts auxiliares para deploy da aplicação na AWS.

## Scripts Disponíveis

### `build-and-push-ecr.sh`

Faz build da imagem Docker e envia para o ECR.

**Uso:**

```bash
./scripts/build-and-push-ecr.sh [tag]
```

**Exemplos:**

```bash
# Build e push com tag latest
./scripts/build-and-push-ecr.sh latest

# Build e push com tag de versão
./scripts/build-and-push-ecr.sh v1.0.0
```

**Variáveis de ambiente:**

- `AWS_REGION` - Região AWS (padrão: `us-east-1`)
- `AWS_ACCOUNT_ID` - ID da conta AWS (padrão: `114700956661`)
- `ECR_REPOSITORY` - Nome do repositório ECR (padrão: `tooldo-api`)

---

### `deploy.sh`

Script completo que faz build, push e atualiza o serviço ECS.

**Uso:**

```bash
./scripts/deploy.sh [tag] [cluster] [service]
```

**Exemplos:**

```bash
# Deploy completo com valores padrão
./scripts/deploy.sh

# Deploy com tag específica
./scripts/deploy.sh v1.0.0 tooldo-api tooldo-api
```

**Variáveis de ambiente:**

- Mesmas do `build-and-push-ecr.sh`

---

### `run-migrations.sh`

Executa migrações do Prisma em uma task ECS one-off.

**Uso:**

```bash
./scripts/run-migrations.sh [cluster] [task-definition] [subnet-id-1] [subnet-id-2] [security-group-id]
```

**Exemplo:**

```bash
./scripts/run-migrations.sh \
  tooldo-api \
  tooldo-api-task \
  subnet-xxxxx \
  subnet-yyyyy \
  sg-zzzzz
```

**Para encontrar os IDs necessários:**

```bash
# Listar subnets privadas
aws ec2 describe-subnets \
  --filters "Name=tag:Name,Values=*private*" \
  --query 'Subnets[*].[SubnetId,Tags[?Key==`Name`].Value|[0]]' \
  --output table

# Listar security groups
aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=SG-App" \
  --query 'SecurityGroups[*].[GroupId,GroupName]' \
  --output table
```

---

### `init-db.js`

Script Node.js para inicializar o banco de dados no ECS. Constrói a DATABASE_URL a partir de variáveis de ambiente e executa `prisma db push`.

**Uso no ECS:**

Executado como task one-off para criar o banco de dados e aplicar o schema Prisma.

```bash
node scripts/init-db.js
```

**Variáveis de ambiente necessárias:**

- `DB_HOST` - Endpoint do RDS
- `DB_USER` - Usuário do banco
- `DB_PASS` - Senha do banco (com caracteres especiais tratados automaticamente)
- `DB_NAME` - Nome do banco de dados
- `DB_PORT` - Porta (padrão: `5432`)
- `DB_SCHEMA` - Schema (padrão: `public`)

---

## Scripts de Setup (uso único)

### `create-secrets.sh`

Script interativo para criar segredos no AWS Secrets Manager.

**Uso:**

```bash
./scripts/create-secrets.sh
```

Cria os seguintes segredos:
- `tooldo/db/prod` - Credenciais do RDS (JSON)
- `tooldo/db/url` - DATABASE_URL completa (opcional)
- `tooldo/jwt/secret` - Chave JWT

**Nota:** Executar apenas uma vez durante o setup inicial.

---

### `create-ecs-service.sh`

Script para criar o serviço ECS inicial.

**Uso:**

```bash
./scripts/create-ecs-service.sh
```

**Nota:** Executar apenas uma vez durante o setup inicial. Após criado, use `deploy.sh` para atualizações.

---

## Pré-requisitos

- AWS CLI configurado
- Docker instalado e em execução
- Permissões AWS apropriadas (ECR, ECS, EC2)

## Documentação Completa

Para mais detalhes sobre o deploy, consulte: [docs/AWS_DEPLOY.md](../docs/AWS_DEPLOY.md)
