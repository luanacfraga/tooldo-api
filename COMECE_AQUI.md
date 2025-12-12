# 🚀 Comece Aqui - Deploy AWS

> **Guia rápido para fazer deploy da API Tooldo na AWS**

Este guia fornece um checklist rápido dos passos essenciais para fazer deploy. Para instruções detalhadas, consulte a [documentação completa](./docs/README.md).

## 📋 Índice

1. [O que já está pronto](#-o-que-já-está-pronto)
2. [Próximos Passos](#-próximos-passos-ordem-de-execução)
3. [Documentação Completa](#-documentação-completa)
4. [Comandos Rápidos](#-comandos-rápidos)
5. [Precisa de Ajuda?](#-precisa-de-ajuda)

---

## ✅ O que já está pronto

- ✅ Dockerfile otimizado para NestJS
- ✅ Endpoint de health check (`/api/health`)
- ✅ Scripts de build e push para ECR
- ✅ Scripts de deploy e migrações
- ✅ Documentação completa

## 📋 Próximos Passos (Ordem de Execução)

### 1️⃣ Build e Push da Imagem (5 minutos)

```bash
# Execute este comando na raiz do projeto
./scripts/build-and-push-ecr.sh latest
```

Isso vai:

- Fazer login no ECR automaticamente
- Fazer build da imagem Docker
- Fazer push para o repositório `tooldo-api`

**Verificar:** Acesse https://us-east-1.console.aws.amazon.com/ecr/repositories/private/114700956661/tooldo-api e confirme que a imagem está lá.

---

### 2️⃣ Configurar Secrets Manager (10 minutos)

No console AWS → Secrets Manager:

#### A) Criar segredo do banco: `tooldo/db/prod`

```json
{
  "username": "tooldo",
  "password": "SUA_SENHA_DO_RDS",
  "engine": "postgres",
  "host": "SEU_RDS_ENDPOINT.us-east-1.rds.amazonaws.com",
  "port": 5432,
  "dbname": "tooldo_db"
}
```

#### B) Criar segredo DATABASE_URL: `tooldo/db/url`

**Tipo:** Texto simples

**Valor:**

```
postgresql://tooldo:SUA_SENHA@SEU_RDS_ENDPOINT:5432/tooldo_db?schema=public
```

**Exemplo:**

```
postgresql://tooldo:MinhaSenha123@tooldo-db.abc123.us-east-1.rds.amazonaws.com:5432/tooldo_db?schema=public
```

#### C) Criar segredo JWT: `tooldo/jwt/secret`

**Tipo:** Texto simples

**Valor:** Uma string aleatória forte (mínimo 32 caracteres)

---

### 3️⃣ Criar Task Definition no ECS (15 minutos)

Siga o guia detalhado: [docs/DEPLOY_STEP_BY_STEP.md](docs/DEPLOY_STEP_BY_STEP.md#-passo-4-criar-task-definition-no-ecs)

**Resumo:**

- Nome: `tooldo-api-task`
- Tipo: Fargate
- CPU: 0.5 vCPU, Memória: 1 GB
- Imagem: `114700956661.dkr.ecr.us-east-1.amazonaws.com/tooldo-api:latest`
- Porta: 3000
- Variáveis de ambiente (ver guia completo)
- Secrets do Secrets Manager
- VPC: `vpc-tooldo`, Subnets privadas, SG-App

**Template JSON disponível:** [docs/ECS_TASK_DEFINITION_TEMPLATE.json](docs/ECS_TASK_DEFINITION_TEMPLATE.json)

---

### 4️⃣ Criar Serviço ECS (5 minutos)

Siga o guia: [docs/DEPLOY_STEP_BY_STEP.md](docs/DEPLOY_STEP_BY_STEP.md#-passo-5-criar-serviço-ecs)

**Resumo:**

- Nome: `tooldo-api`
- Cluster: `tooldo-api`
- Task Definition: `tooldo-api-task`
- Desired tasks: 1
- Sem load balancer por enquanto

---

### 5️⃣ Criar ALB e Target Group (15 minutos)

Siga o guia: [docs/DEPLOY_STEP_BY_STEP.md](docs/DEPLOY_STEP_BY_STEP.md#-passo-6-criar-alb-e-conectar)

**Resumo:**

- ALB: `tooldo-api-alb` (subnets públicas, SG-ALB)
- Target Group: `tooldo-api-tg` (porta 3000, health check `/api/health`)
- Listener HTTPS:443 com certificado ACM
- Conectar serviço ECS ao target group

---

### 6️⃣ Configurar DNS (5 minutos)

Na GoDaddy, criar CNAME:

- Nome: `api`
- Valor: DNS name do ALB

---

### 7️⃣ Executar Migrações (5 minutos)

```bash
# Primeiro, encontre os IDs necessários:
aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=vpc-xxxxx" "Name=tag:Name,Values=*private*" \
  --query 'Subnets[*].[SubnetId,Tags[?Key==`Name`].Value|[0]]' \
  --output table

aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=SG-App" \
  --query 'SecurityGroups[*].[GroupId,GroupName]' \
  --output table

# Depois execute:
./scripts/run-migrations.sh \
  tooldo-api \
  tooldo-api-task \
  subnet-xxxxx \
  subnet-yyyyy \
  sg-zzzzz
```

---

### 8️⃣ Verificar (5 minutos)

```bash
# Health check
curl https://api.tooldo.com/api/health

# Deve retornar:
# {"status":"ok","timestamp":"...","service":"tooldo-api"}
```

---

## 📚 Documentação Completa

### Guias de Deploy

- **[Guia Passo a Passo Detalhado](./docs/DEPLOY_STEP_BY_STEP.md)**: Instruções detalhadas para cada etapa
- **[Guia Rápido de Referência](./docs/QUICK_REFERENCE.md)**: Comandos e URLs importantes
- **[Documentação AWS Completa](./docs/AWS_DEPLOY.md)**: Arquitetura e configuração completa
- **[Guia Secrets Manager](./docs/SECRETS_MANAGER_GUIDE.md)**: Configuração de segredos

### Outros Documentos

- **[README.md](./README.md)**: Visão geral do projeto
- **[Índice de Documentação](./docs/README.md)**: Navegação completa da documentação
- **[Regras de Negócio](./BUSINESS_RULES.md)**: Entenda as regras do sistema
- **[Padrões de Código](./MEMORY_BANK_PADROES.md)**: Padrões de desenvolvimento

---

## 🆘 Precisa de Ajuda?

### Troubleshooting

1. **Verifique os logs no CloudWatch**

   ```bash
   aws logs tail /ecs/tooldo-api --follow --region us-east-1
   ```

2. **Consulte a seção de Troubleshooting**
   - [DEPLOY_STEP_BY_STEP.md](./docs/DEPLOY_STEP_BY_STEP.md#-troubleshooting)
   - [AWS_DEPLOY.md](./docs/AWS_DEPLOY.md#-troubleshooting)
   - [QUICK_REFERENCE.md](./docs/QUICK_REFERENCE.md#-troubleshooting-rápido)

3. **Verifique configurações**
   - Security Groups e VPC
   - Secrets Manager
   - Task Definition e variáveis de ambiente

### Recursos Adicionais

- [Documentação NestJS](https://docs.nestjs.com)
- [Documentação AWS ECS](https://docs.aws.amazon.com/ecs/)
- [Documentação Prisma](https://www.prisma.io/docs)

---

## ⚡ Comandos Rápidos

```bash
# Build e push
./scripts/build-and-push-ecr.sh latest

# Deploy completo
./scripts/deploy.sh latest tooldo-api tooldo-api

# Ver logs
aws logs tail /ecs/tooldo-api --follow --region us-east-1

# Forçar novo deploy
aws ecs update-service \
  --cluster tooldo-api \
  --service tooldo-api \
  --force-new-deployment \
  --region us-east-1
```

---

**Boa sorte com o deploy! 🚀**
