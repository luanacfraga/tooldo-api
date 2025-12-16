# 📊 Status AWS - Tooldo API

**Última atualização:** 16/12/2024

## ✅ Status Geral

| Componente              | Status      | Observação                          |
| ----------------------- | ----------- | ----------------------------------- |
| **VPC e Rede**          | ✅ Completo | VPC, subnets, gateways configurados |
| **RDS PostgreSQL**      | ✅ Completo | Instância `tooldo-db` rodando       |
| **Secrets Manager**     | ✅ Completo | Todos os secrets configurados       |
| **ECR**                 | ✅ Completo | Repositório `tooldo-api` criado     |
| **ECS Cluster**         | ✅ Completo | Cluster `tooldo-api` ativo          |
| **ECS Task Definition** | ✅ Completo | Revisão `tooldo-api-task:5`         |
| **ECS Service**         | ✅ Completo | 1/1 tasks rodando e healthy         |
| **ALB**                 | ✅ Completo | HTTPS:443 configurado               |
| **Target Group**        | ✅ Completo | Health check healthy                |
| **Certificado SSL**     | ✅ Completo | ISSUED para `api.tooldo.net`        |
| **DNS**                 | ✅ Completo | CNAME configurado na GoDaddy        |

---

## 🌐 Informações de Acesso

### Base URL da API

```
https://api.tooldo.net
```

### ALB DNS (backup)

```
https://tooldo-api-alb-155596415.us-east-1.elb.amazonaws.com
```

---

## 📋 Recursos AWS

### VPC e Rede

- **VPC:** `vpc-tooldo` (ID: `vpc-00a0060753dc70f6a`)
- **Subnets Privadas:**
  - `subnet-09ab5020804730fad` - `10.0.1.0/24` (us-east-1a)
  - `subnet-0fa1ecd517dc8fef4` - `10.0.2.0/24` (us-east-1b)
- **Subnets Públicas:**
  - `subnet-050b564c54802f97b` - `10.0.101.0/24` (us-east-1a)
  - `subnet-0493a6ead958c2040` - `10.0.102.0/24` (us-east-1b)
- **Internet Gateway:** `igw-054c43f3717ace63f`
- **NAT Gateway:** `nat-1c31fc6de1fa1b9f4`
- **Security Groups:**
  - `SG_ALB` (sg-04a09939b7e1140fc)
  - `SG_App` (sg-076a3eb059fcdc88e)
  - `SG_DB` (sg-03e44e98376ded12f)

### RDS PostgreSQL

- **Instância:** `tooldo-db`
- **Endpoint:** `tooldo-db.cmvj2jytztco.us-east-1.rds.amazonaws.com`
- **Status:** `available`

### ECS

- **Cluster:** `tooldo-api`
- **Service:** `tooldo-api`
- **Task Definition:** `tooldo-api-task:5`
- **Status:** `ACTIVE` (1/1 tasks running)

### ALB

- **Nome:** `tooldo-api-alb`
- **DNS:** `tooldo-api-alb-155596415.us-east-1.elb.amazonaws.com`
- **Status:** `active`
- **Listeners:**
  - ✅ HTTPS:443 (com certificado SSL)
  - ✅ HTTP:80

### Target Group

- **Nome:** `tooldo-api-tg`
- **Porta:** 3000
- **Health Check:** `/api/v1/health`
- **Status:** ✅ Healthy

### Certificado SSL

- **Domínio:** `api.tooldo.net`
- **Status:** `ISSUED` ✅
- **ARN:** `arn:aws:acm:us-east-1:114700956661:certificate/57cb1445-d18c-417b-8170-9f90519d68eb`
- **Validade até:** 14/01/2027

### DNS

- **Domínio:** `api.tooldo.net`
- **CNAME:** `tooldo-api-alb-155596415.us-east-1.elb.amazonaws.com`
- **Status:** ✅ Configurado na GoDaddy

---

## 🔧 Scripts Úteis

### Verificar Status do Certificado

```bash
./scripts/check-certificate-status.sh
```

### Verificar Status do DNS

```bash
./scripts/check-dns-status.sh
```

### Verificar Health do Target Group

```bash
aws elbv2 describe-target-health \
  --target-group-arn $(aws elbv2 describe-target-groups --names tooldo-api-tg --region us-east-1 --query 'TargetGroups[0].TargetGroupArn' --output text) \
  --region us-east-1
```

### Verificar Status do ECS Service

```bash
aws ecs describe-services \
  --cluster tooldo-api \
  --services tooldo-api \
  --region us-east-1
```

---

## 🧪 Testes

### Health Check

```bash
curl https://api.tooldo.net/api/v1/health
```

### Verificar Certificado SSL

```bash
openssl s_client -connect api.tooldo.net:443 -servername api.tooldo.net
```

---

## 📝 Variáveis de Ambiente (Task Definition)

- `NODE_ENV`: `production`
- `PORT`: `3000`
- `ALLOWED_ORIGINS`: `https://www.tooldo.net,https://tooldo.net`
- `FRONTEND_URL`: `https://www.tooldo.net`
- `DB_HOST`: (do Secrets Manager)
- `JWT_SECRET`: (do Secrets Manager)

---

## 🚀 Deploy

### Deploy Automático (GitHub Actions) ⭐ Recomendado

A pipeline de CI/CD está configurada para fazer deploy automaticamente:

- **Push para `main`/`master`**: Deploy automático
- **Criação de tag `v*`**: Deploy da versão específica
- **Manual**: Via GitHub Actions → `Run workflow`

Veja [.github/README.md](./.github/README.md) para mais detalhes.

### Deploy Manual

Para fazer deploy manualmente:

```bash
# Build e push
./scripts/build-and-push-ecr.sh latest

# Deploy
./scripts/deploy.sh latest tooldo-api tooldo-api
```

---

**Status:** ✅ **TUDO FUNCIONANDO**
