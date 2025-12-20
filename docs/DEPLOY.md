# Deploy Manual (Infraestrutura já Pronta)

> **💡 Prefira usar o deploy automático via Git!**  
> Este guia é para deploy manual. Se você tem acesso ao repositório, use a **[pipeline CI/CD](./CICD.md)** que faz deploy automaticamente ao fazer push para `main` ou `master`.

Este guia é para **atualizar a aplicação manualmente** em uma infraestrutura AWS que já existe (ECR/ECS/ALB/RDS já criados).

## 📋 Pré-requisitos

- AWS CLI configurado e com acesso
- Docker instalado e rodando
- Secrets já configurados (ver **[AWS_ACCESS.md](./AWS_ACCESS.md)**)
- Acesso ao cluster ECS `tooldo-api`

## 🚀 Passo a Passo

### 1) Build + Push para ECR

```bash
./scripts/build-and-push-ecr.sh latest
```

Este script:
- Faz login no ECR automaticamente
- Faz build da imagem Docker
- Faz push para o repositório `tooldo-api` com tag `latest`

**Verificar:** Acesse o console ECR e confirme que a imagem está disponível.

### 2) Atualizar serviço ECS

```bash
./scripts/deploy.sh latest tooldo-api tooldo-api
```

Parâmetros:
- `latest`: Tag da imagem
- `tooldo-api`: Nome do cluster ECS
- `tooldo-api`: Nome do serviço ECS

Este script força um novo deployment do serviço ECS.

### 3) Migrações (quando necessário)

Quando houver migrações novas do Prisma, execute via task one-off:

```bash
./scripts/run-migrations.sh \
  tooldo-api \
  tooldo-api-task \
  subnet-xxxxx \
  subnet-yyyyy \
  sg-zzzzz
```

**Como encontrar os IDs necessários:**

```bash
# Encontrar subnets privadas
aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=vpc-xxxxx" "Name=tag:Name,Values=*private*" \
  --query 'Subnets[*].[SubnetId,Tags[?Key==`Name`].Value|[0]]' \
  --output table

# Encontrar security group
aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=SG-App" \
  --query 'SecurityGroups[*].[GroupId,GroupName]' \
  --output table
```

### 4) Verificar saúde

```bash
curl https://api.tooldo.net/api/v1/health
```

Deve retornar:

```json
{
  "status": "ok",
  "timestamp": "...",
  "service": "tooldo-api"
}
```

### 5) Ver logs

```bash
aws logs tail /ecs/tooldo-api --follow --region us-east-1
```

## 🔍 Verificação do Deploy

### Console AWS

1. **ECS Console** → Cluster `tooldo-api` → Service `tooldo-api`
   - Verificar se as tasks estão rodando e healthy
   - Verificar eventos do serviço

2. **Target Group** → Health checks
   - Verificar se os targets estão healthy

3. **CloudWatch Logs** → `/ecs/tooldo-api`
   - Verificar logs da aplicação

### Comandos CLI

```bash
# Status do serviço
aws ecs describe-services \
  --cluster tooldo-api \
  --services tooldo-api \
  --region us-east-1

# Tasks rodando
aws ecs list-tasks \
  --cluster tooldo-api \
  --service-name tooldo-api \
  --region us-east-1
```

## 🆘 Troubleshooting

### Deploy não estabiliza (services-stable timeout)

Quando o GitHub Actions ou o deploy mostra:

```
Waiter ServicesStable failed: Max attempts exceeded
```

Isso significa que o ECS **não conseguiu deixar o serviço saudável** dentro do tempo.

**Checklist:**

1. Verifique **[STATUS_AWS.md](../STATUS_AWS.md)** e confirme o **health check**: `/api/v1/health`
2. Verifique logs no CloudWatch:
   ```bash
   aws logs tail /ecs/tooldo-api --follow --region us-east-1
   ```
3. Verifique eventos do serviço (Console ECS → Service → Events)
4. Verifique se as tasks estão reiniciando (pode indicar erro na aplicação)
5. Verifique configuração do Target Group e health check

### Tasks não iniciam

- Verifique logs do CloudWatch
- Verifique configuração da Task Definition
- Verifique variáveis de ambiente e secrets
- Verifique permissões IAM da task

### Health check falha

- Verifique se o endpoint `/api/v1/health` está respondendo
- Verifique configuração do Target Group
- Verifique security groups (porta 3000 deve estar acessível)
- Verifique se a aplicação está rodando na porta correta

### Migrações falham

- Verifique `DATABASE_URL` nos secrets
- Verifique conectividade da task com o RDS
- Verifique security groups do RDS
- Verifique logs da task de migração

## 🔗 Próximos Passos

- **⭐ Deploy automático**: Consulte **[CICD.md](./CICD.md)** - Use a pipeline CI/CD para deploy automático via Git
- **Criar infra do zero**: Consulte **[AWS_DEPLOY.md](./AWS_DEPLOY.md)**
- **Scripts disponíveis**: Consulte **[SCRIPTS.md](./SCRIPTS.md)**
- **Status AWS**: Consulte **[STATUS_AWS.md](../STATUS_AWS.md)**

## 📚 Documentação Relacionada

- **[AWS_ACCESS.md](./AWS_ACCESS.md)**: Configuração de acesso AWS
- **[PRE_DEPLOY_CHECKLIST.md](./PRE_DEPLOY_CHECKLIST.md)**: Checklist pré-deploy
- **[SCRIPTS.md](./SCRIPTS.md)**: Documentação dos scripts

---

**Deploy realizado com sucesso! 🎉**
