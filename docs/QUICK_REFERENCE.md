# Guia Rápido de Referência - Deploy AWS

## 🚀 Comandos Rápidos

### 1. Login no ECR

```bash
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  114700956661.dkr.ecr.us-east-1.amazonaws.com
```

### 2. Build e Push

```bash
./scripts/build-and-push-ecr.sh latest
```

### 3. Deploy Completo

```bash
./scripts/deploy.sh latest tooldo-api tooldo-api
```

### 4. Executar Migrações

```bash
./scripts/run-migrations.sh \
  tooldo-api \
  tooldo-api-task \
  subnet-xxxxx \
  subnet-yyyyy \
  sg-zzzzz
```

## 📋 URLs Importantes

- **ECR Repository:** https://us-east-1.console.aws.amazon.com/ecr/repositories/private/114700956661/tooldo-api
- **ECS Clusters:** https://us-east-1.console.aws.amazon.com/ecs/v2/clusters?region=us-east-1
- **Secrets Manager:** https://us-east-1.console.aws.amazon.com/secretsmanager/list?region=us-east-1

## 🔑 Secrets Manager

### Segredo do Banco: `tooldo/db/prod`

```json
{
  "username": "weedu",
  "password": "senha",
  "engine": "postgres",
  "host": "endpoint.rds.amazonaws.com",
  "port": 5432,
  "dbname": "weedu_db"
}
```

### Segredo JWT: `tooldo/jwt/secret`

```
sua-chave-jwt-secreta
```

### Segredo DATABASE_URL (Alternativa): `tooldo/db/url`

```
postgresql://weedu:senha@endpoint:5432/weedu_db?schema=public
```

## 🏷️ Imagem ECR

```
114700956661.dkr.ecr.us-east-1.amazonaws.com/tooldo-api:latest
```

## 🔍 Verificações

### Health Check

```bash
curl https://api.tooldo.com/api/health
```

### Logs CloudWatch

```bash
aws logs tail /ecs/tooldo-api --follow --region us-east-1
```

### Status do Serviço

```bash
aws ecs describe-services \
  --cluster tooldo-api \
  --services tooldo-api \
  --region us-east-1 \
  --query 'services[0].[status,runningCount,desiredCount]' \
  --output table
```

## 📝 Variáveis de Ambiente (ECS)

| Variável          | Valor                                       | Tipo            |
| ----------------- | ------------------------------------------- | --------------- |
| `NODE_ENV`        | `production`                                | Valor           |
| `PORT`            | `3000`                                      | Valor           |
| `ALLOWED_ORIGINS` | `https://www.tooldo.com,https://tooldo.com` | Valor           |
| `FRONTEND_URL`    | `https://www.tooldo.com`                    | Valor           |
| `DATABASE_URL`    | (do Secrets Manager)                        | Secrets Manager |
| `JWT_SECRET`      | (do Secrets Manager)                        | Secrets Manager |

## 🛠️ Troubleshooting Rápido

### Container não inicia

```bash
# Ver logs
aws logs tail /ecs/tooldo-api --follow
```

### Forçar novo deploy

```bash
aws ecs update-service \
  --cluster tooldo-api \
  --service tooldo-api \
  --force-new-deployment \
  --region us-east-1
```

### Ver tasks rodando

```bash
aws ecs list-tasks \
  --cluster tooldo-api \
  --service-name tooldo-api \
  --region us-east-1
```
