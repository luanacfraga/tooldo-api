# Deploy Passo a Passo - ECR e ECS

Guia prático para fazer deploy da API Weedu (NestJS) no ECR e ECS.

## ✅ Pré-requisitos Verificados

- ✅ Dockerfile criado e otimizado para NestJS
- ✅ Endpoint de health check em `/api/health`
- ✅ Scripts de build e push prontos

## 📋 Passo 1: Login no ECR

Execute o comando para fazer login no ECR:

```bash
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  114700956661.dkr.ecr.us-east-1.amazonaws.com
```

**Verificação:**

```bash
# Deve retornar "Login Succeeded"
```

**Alternativa:** Use o script que já faz isso automaticamente:

```bash
./scripts/build-and-push-ecr.sh latest
```

---

## 📦 Passo 2: Build e Push da Imagem

### Opção A: Usando o Script (Recomendado)

```bash
./scripts/build-and-push-ecr.sh latest
```

### Opção B: Manual

```bash
# 1. Build da imagem
docker build -t tooldo-api:latest .

# 2. Tag para ECR
docker tag tooldo-api:latest \
  114700956661.dkr.ecr.us-east-1.amazonaws.com/tooldo-api:latest

# 3. Push para ECR
docker push \
  114700956661.dkr.ecr.us-east-1.amazonaws.com/tooldo-api:latest
```

**Verificação:**

- Acesse: https://us-east-1.console.aws.amazon.com/ecr/repositories/private/114700956661/tooldo-api
- Deve aparecer a imagem com tag `latest`

---

## 🔐 Passo 3: Configurar Secrets Manager

### 3.1 Criar Segredo do Banco de Dados

No console AWS → Secrets Manager → Criar segredo:

**Nome:** `tooldo/db/prod`

**Tipo:** Outros tipos de segredos (JSON)

**Conteúdo:**

```json
{
  "username": "weedu",
  "password": "SUA_SENHA_AQUI",
  "engine": "postgres",
  "host": "SEU_RDS_ENDPOINT.us-east-1.rds.amazonaws.com",
  "port": 5432,
  "dbname": "weedu_db"
}
```

**Exemplo real:**

```json
{
  "username": "weedu",
  "password": "MinhaSenhaSegura123!",
  "engine": "postgres",
  "host": "tooldo-db.abc123xyz.us-east-1.rds.amazonaws.com",
  "port": 5432,
  "dbname": "weedu_db"
}
```

### 3.2 Criar Segredo do JWT (Opcional mas Recomendado)

**Nome:** `tooldo/jwt/secret`

**Tipo:** Texto simples

**Conteúdo:**

```
sua-chave-jwt-super-secreta-com-pelo-menos-32-caracteres
```

**Ou** você pode usar variável de ambiente diretamente no ECS (menos seguro).

---

## 🏗️ Passo 4: Criar Task Definition no ECS

No console AWS → ECS → Task Definitions → Criar nova:

### 4.1 Configurações Básicas

- **Nome da família:** `tooldo-api-task`
- **Tipo de inicialização:** Fargate
- **Sistema operacional:** Linux/X86_64
- **CPU:** 0.5 vCPU
- **Memória:** 1 GB

### 4.2 Container

**Nome do container:** `weedu-api`

**URI da imagem:**

```
114700956661.dkr.ecr.us-east-1.amazonaws.com/tooldo-api:latest
```

**Porta do container:**

- **Porta do container:** `3000`
- **Protocolo:** `tcp`

**Variáveis de ambiente:**

Adicione as seguintes variáveis:

| Chave             | Valor                                       | Tipo  |
| ----------------- | ------------------------------------------- | ----- |
| `NODE_ENV`        | `production`                                | Valor |
| `PORT`            | `3000`                                      | Valor |
| `ALLOWED_ORIGINS` | `https://www.tooldo.com,https://tooldo.com` | Valor |
| `FRONTEND_URL`    | `https://www.tooldo.com`                    | Valor |

**Para DATABASE_URL:**

Como o ECS não constrói automaticamente a `DATABASE_URL` a partir do segredo, você tem 3 opções:

#### Opção 1: Criar segredo completo com DATABASE_URL (Mais Simples)

Criar um novo segredo `tooldo/db/url` com:

```
postgresql://weedu:senha@host:5432/weedu_db?schema=public
```

E referenciar no ECS como variável de ambiente do tipo "Valor do Secrets Manager".

#### Opção 2: Usar variáveis separadas e construir no código

Adicionar variáveis individuais e modificar o código para construir a URL (requer mudança no código).

#### Opção 3: Script de inicialização (Recomendado para produção)

Criar um script que lê do Secrets Manager e constrói a URL. (Veja script abaixo)

**Para JWT_SECRET:**

Adicionar como variável de ambiente do tipo "Valor do Secrets Manager":

- **Segredo:** `tooldo/jwt/secret`
- **Chave:** (deixar vazio se for texto simples, ou usar a chave se for JSON)

### 4.3 Logging

**Log driver:** awslogs

**Opções de log:**

- **Grupo de logs do awslogs:** `/ecs/tooldo-api`
- **Região do awslogs:** `us-east-1`
- **Stream prefix do awslogs:** `weedu-api`

### 4.4 Networking

**VPC:** `vpc-tooldo`

**Subnets:** Selecionar as subnets **privadas** (10.0.1.0/24 e 10.0.2.0/24)

**Security Group:** `SG-App`

**Auto-assign public IP:** Desabilitado

### 4.5 Roles

**Task execution role:** Criar nova role ou usar existente com:

- `AmazonECSTaskExecutionRolePolicy`
- Permissão para ler Secrets Manager (política customizada)

**Task role:** Pode ser a mesma ou diferente, dependendo se a aplicação precisa acessar outros serviços AWS.

**Criar política customizada para Secrets Manager:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": [
        "arn:aws:secretsmanager:us-east-1:114700956661:secret:tooldo/db/prod-*",
        "arn:aws:secretsmanager:us-east-1:114700956661:secret:tooldo/jwt/secret-*"
      ]
    }
  ]
}
```

### 4.6 Salvar

Clique em "Criar" para salvar a task definition.

---

## 🚀 Passo 5: Criar Serviço ECS

No console AWS → ECS → Clusters → `tooldo-api` → Criar serviço:

### 5.1 Configurações Básicas

- **Nome do serviço:** `tooldo-api`
- **Task Definition:** `tooldo-api-task` (última revisão)
- **Tipo de inicialização:** Fargate
- **Número de tarefas:** `1`

### 5.2 Networking

- **VPC:** `vpc-tooldo`
- **Subnets:** Subnets privadas
- **Security Group:** `SG-App`
- **Auto-assign public IP:** Desabilitado

### 5.3 Load Balancing (Por enquanto, deixar vazio)

- **Balanceador de carga:** Nenhum

Podemos adicionar o ALB depois.

### 5.4 Service Auto Scaling (Opcional)

Por enquanto, deixar desabilitado.

### 5.5 Criar

Clique em "Criar" e aguarde o serviço iniciar.

**Verificação:**

- O serviço deve aparecer como "Ativo"
- A task deve estar em estado "Running"
- Verificar logs no CloudWatch: `/ecs/tooldo-api`

---

## 🔗 Passo 6: Criar ALB e Conectar

### 6.1 Criar Application Load Balancer

No console AWS → EC2 → Load Balancers → Criar:

**Tipo:** Application Load Balancer

**Nome:** `tooldo-api-alb`

**Esquema:** Internet-facing

**VPC:** `vpc-tooldo`

**Subnets:** Selecionar as subnets **públicas** (10.0.101.0/24 e 10.0.102.0/24)

**Security Group:** `SG-ALB`

### 6.2 Criar Target Group

No console AWS → EC2 → Target Groups → Criar:

**Tipo:** IP

**Nome:** `tooldo-api-tg`

**VPC:** `vpc-tooldo`

**Protocolo:** HTTP

**Porta:** `3000`

**Health check:**

- **Protocolo:** HTTP
- **Caminho:** `/api/health`
- **Código de sucesso:** `200`
- **Intervalo:** 30 segundos
- **Timeout:** 5 segundos
- **Limiar saudável:** 2
- **Limiar não saudável:** 3

**Registrar targets:** Por enquanto, deixar vazio. Vamos registrar via ECS.

### 6.3 Configurar Listener HTTPS

No ALB criado → Aba "Listeners" → Adicionar listener:

**Protocolo:** HTTPS

**Porta:** `443`

**Default action:** Forward para `tooldo-api-tg`

**Certificado SSL:** Selecionar certificado do ACM para `api.tooldo.com`

**Nota:** Se ainda não tiver o certificado, solicite no ACM primeiro.

### 6.4 Conectar Serviço ECS ao Target Group

No console AWS → ECS → Clusters → `tooldo-api` → Serviço `tooldo-api` → Atualizar:

**Balanceamento de carga:**

- ✅ Ativar balanceamento de carga
- **Tipo de balanceador:** Application Load Balancer
- **Balanceador de carga:** `tooldo-api-alb`
- **Nome do container:** `weedu-api:3000`
- **Target group:** `tooldo-api-tg`
- **Listener:** `HTTPS:443`

Salvar e aguardar atualização.

---

## 🌐 Passo 7: Configurar DNS na GoDaddy

1. Acesse o painel DNS do seu domínio na GoDaddy
2. Encontre o DNS name do ALB (no console do ALB, aba "Description")
3. Crie um registro CNAME:
   - **Nome:** `api`
   - **Valor:** `tooldo-api-alb-xxxxxxxx.us-east-1.elb.amazonaws.com`
   - **TTL:** 600 (ou padrão)

4. Aguarde a propagação (alguns minutos)

---

## 🗄️ Passo 8: Executar Migrações do Banco

Após o primeiro deploy, execute as migrações do Prisma:

```bash
./scripts/run-migrations.sh \
  tooldo-api \
  tooldo-api-task \
  subnet-xxxxx \
  subnet-yyyyy \
  sg-zzzzz
```

**Para encontrar os IDs:**

```bash
# Subnets privadas
aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=vpc-xxxxx" "Name=tag:Name,Values=*private*" \
  --query 'Subnets[*].[SubnetId,Tags[?Key==`Name`].Value|[0]]' \
  --output table

# Security Group SG-App
aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=SG-App" \
  --query 'SecurityGroups[*].[GroupId,GroupName]' \
  --output table
```

---

## ✅ Passo 9: Verificação Final

### 9.1 Health Check

```bash
curl https://api.tooldo.com/api/health
```

**Esperado:**

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "weedu-api"
}
```

### 9.2 Verificar Logs

No CloudWatch Logs → `/ecs/tooldo-api`:

- Verificar se não há erros
- Verificar se a conexão com o banco foi estabelecida

### 9.3 Verificar Target Group

No console EC2 → Target Groups → `tooldo-api-tg`:

- Target deve estar "healthy"
- Health check deve estar passando

### 9.4 Testar Endpoint da API

```bash
# Exemplo: testar login (se tiver endpoint)
curl -X POST https://api.tooldo.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

---

## 🔄 Deploy de Atualizações

Para fazer deploy de uma nova versão:

```bash
# 1. Build e push
./scripts/build-and-push-ecr.sh v1.0.1

# 2. Atualizar task definition com nova tag (ou usar latest)
# 3. Forçar novo deploy do serviço
aws ecs update-service \
  --cluster tooldo-api \
  --service tooldo-api \
  --force-new-deployment \
  --region us-east-1
```

Ou use o script completo:

```bash
./scripts/deploy.sh v1.0.1 tooldo-api tooldo-api
```

---

## 🐛 Troubleshooting

### Container não inicia

1. Verificar logs no CloudWatch: `/ecs/tooldo-api`
2. Verificar variáveis de ambiente na task definition
3. Verificar Security Groups (SG-App deve permitir tráfego do ALB)

### Health check falhando

1. Verificar se o endpoint `/api/health` está acessível
2. Verificar Security Groups
3. Verificar logs do container

### Erro de conexão com banco

1. Verificar `DATABASE_URL` ou variáveis do Secrets Manager
2. Verificar Security Group do RDS (deve permitir 5432 de SG-App)
3. Verificar se o RDS está acessível das subnets privadas

### Target Group unhealthy

1. Verificar se o container está rodando
2. Verificar health check path (`/api/health`)
3. Verificar Security Groups entre ALB e ECS

---

## 📝 Notas Importantes

1. **DATABASE_URL**: Se usar a Opção 1 (segredo completo), crie o segredo com a URL já formatada
2. **Tags**: Para produção, use tags versionadas (ex: `v1.0.0`) em vez de `latest`
3. **Custos**: Monitore custos do NAT Gateway e ECS Fargate
4. **Backups**: Certifique-se de que o RDS tem backups automáticos habilitados
