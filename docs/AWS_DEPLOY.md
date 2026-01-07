# Guia de Deploy na AWS - Tooldo API

Este documento descreve o processo completo de deploy da API Tooldo na AWS usando VPC, RDS PostgreSQL, ECR, ECS Fargate e ALB.

## 📋 Pré-requisitos

- AWS CLI configurado com credenciais apropriadas
- Docker instalado e em execução
- Acesso ao console AWS
- Domínio configurado na GoDaddy (ou outro provedor DNS)

## 🏗️ Arquitetura

```
Internet
   ↓
ALB (HTTPS:443)
   ↓
ECS Fargate (Porta 3000)
   ↓
RDS PostgreSQL (Porta 5432)
```

## 📦 Variáveis de Ambiente

### Variáveis Obrigatórias

As seguintes variáveis devem ser configuradas no **AWS Secrets Manager** (chave: `tooldo/db/prod`) ou nas variáveis de ambiente do ECS:

#### Banco de Dados

- `DATABASE_URL` - String de conexão PostgreSQL
  - Formato: `postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public`
  - Exemplo: `postgresql://tooldo:senha123@tooldo-db.xxxxx.us-east-1.rds.amazonaws.com:5432/tooldo_db`

#### Autenticação JWT

- `JWT_SECRET` - Chave secreta para assinatura de tokens JWT
  - **IMPORTANTE**: Use uma string aleatória forte (mínimo 32 caracteres)
  - Exemplo: `your-super-secret-jwt-key-change-this-in-production`

- `JWT_EXPIRES_IN` - Tempo de expiração do token (opcional, padrão: `7d`)
  - Exemplos: `7d`, `24h`, `1h`

#### Opcionais (com fallbacks)

- `JWT_RESET_SECRET` - Chave para tokens de reset de senha (usa `JWT_SECRET` se não definido)
- `JWT_INVITE_SECRET` - Chave para tokens de convite (usa `JWT_SECRET` se não definido)
- `FRONTEND_URL` - URL do frontend para links de email (padrão: `http://localhost:3001`)
- `EMAIL_ASSETS_BASE_URL` - URL base de assets para emails (logo/imagens). Se não definido, usa `FRONTEND_URL`.
- `EMAIL_LOGO_URL` - URL absoluta da logo no email. Se não definido, usa `EMAIL_ASSETS_BASE_URL + /images/logo.png`.

#### Configuração de Email (Opcional)

Para habilitar o envio real de emails, configure as seguintes variáveis. **Se não configuradas, os emails serão apenas logados no console.**

**Variáveis obrigatórias para envio de email:**

- `SMTP_USER` - Usuário do servidor SMTP
- `SMTP_PASSWORD` - Senha do servidor SMTP

**Variáveis opcionais de configuração SMTP:**

- `EMAIL_PROVIDER` - Provedor de email (`smtp`, `aws-ses` ou `resend`, padrão: `smtp`)
- `SMTP_HOST` - Host do servidor SMTP
  - Para AWS SES: `email-smtp.us-east-1.amazonaws.com` (ajuste a região)
  - Para Gmail: `smtp.gmail.com`
  - Para outros: consulte a documentação do seu provedor
- `SMTP_PORT` - Porta do servidor SMTP (padrão: `587`)
  - `587` - TLS/STARTTLS (recomendado)
  - `465` - SSL (requer `SMTP_SECURE=true`)
  - `25` - Não recomendado (muitos provedores bloqueiam)
- `SMTP_SECURE` - Usar SSL (`true` ou `false`, padrão: `false`)
  - `true` para porta 465
  - `false` para porta 587 com STARTTLS
- `SMTP_REQUIRE_TLS` - Exigir TLS (`true` ou `false`, padrão: `false`)
- `EMAIL_FROM` - Email remetente (padrão: usa `SMTP_USER` ou `noreply@tooldo.com`)
- `EMAIL_FROM_NAME` - Nome do remetente (padrão: `Tooldo`)
- `RESEND_API_KEY` - Chave da API do Resend (obrigatória quando `EMAIL_PROVIDER=resend` em produção)

**Exemplo de configuração para AWS SES:**

```bash
EMAIL_PROVIDER=aws-ses
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=AKIAIOSFODNN7EXAMPLE
SMTP_PASSWORD=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
SMTP_SECURE=false
EMAIL_FROM=noreply@tooldo.com
EMAIL_FROM_NAME=Tooldo
```

**Exemplo de configuração para Gmail:**

```bash
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-de-app  # Use "Senha de app" do Google
SMTP_SECURE=false
SMTP_REQUIRE_TLS=true
EMAIL_FROM=seu-email@gmail.com
EMAIL_FROM_NAME=Tooldo
```

**Nota:** Para AWS SES, você precisará:

1. Verificar seu domínio ou email no AWS SES
2. Criar credenciais SMTP no console AWS SES
3. Usar as credenciais SMTP (não as credenciais IAM) nas variáveis acima

#### Configuração da Aplicação

- `NODE_ENV` - Ambiente de execução (deve ser `production`)
- `PORT` - Porta da aplicação (padrão: `3000`)
- `ALLOWED_ORIGINS` - Origens permitidas para CORS (separadas por vírgula)
  - Exemplo: `https://www.tooldo.com,https://tooldo.com`

## 🔧 Passo a Passo de Configuração

### 1. VPC e Rede

Siga o passo a passo fornecido para criar:

- VPC: `vpc-tooldo` (CIDR: 10.0.0.0/16)
- Subnets privadas: 10.0.1.0/24, 10.0.2.0/24
- Subnets públicas: 10.0.101.0/24, 10.0.102.0/24
- Internet Gateway
- NAT Gateway
- Security Groups:
  - `SG-ALB`: Inbound 443/tcp de 0.0.0.0/0
  - `SG-App`: Inbound 3000/tcp de SG-ALB
  - `SG-DB`: Inbound 5432/tcp de SG-App

### 2. RDS PostgreSQL

1. Criar instância PostgreSQL no RDS
2. Configurar:
   - VPC: `vpc-tooldo`
   - Subnet group: subnets privadas
   - Security Group: `SG-DB`
   - Público: **Desativado**
   - Backup automático: Habilitado
   - Criptografia: KMS padrão
3. Anotar o endpoint do RDS
4. Criar usuário e senha do banco

### 3. Secrets Manager

Criar segredo no AWS Secrets Manager:

**Nome do segredo**: `tooldo/db/prod`

**Conteúdo (JSON)**:

```json
{
  "username": "tooldo",
  "password": "sua-senha-segura",
  "engine": "postgres",
  "host": "tooldo-db.xxxxx.us-east-1.rds.amazonaws.com",
  "port": 5432,
  "dbname": "tooldo_db"
}
```

**Variáveis adicionais** (criar como segredos separados ou variáveis de ambiente no ECS):

- `JWT_SECRET`: Criar como segredo separado ou variável de ambiente
- `ALLOWED_ORIGINS`: Variável de ambiente no ECS
- `FRONTEND_URL`: Variável de ambiente no ECS

### 4. ECR - Repositório de Imagens

#### Criar repositório (via console ou CLI)

```bash
aws ecr create-repository \
  --repository-name tooldo-api \
  --region us-east-1 \
  --image-scanning-configuration scanOnPush=true \
  --encryption-configuration encryptionType=AES256
```

#### Build e Push da Imagem

Use o script fornecido:

```bash
# Build e push com tag latest
./scripts/build-and-push-ecr.sh latest

# Ou com uma tag específica
./scripts/build-and-push-ecr.sh v1.0.0
```

O script irá:

1. Fazer login no ECR
2. Verificar/criar o repositório
3. Fazer build da imagem Docker
4. Fazer push para o ECR

**URI da imagem**: `114700956661.dkr.ecr.us-east-1.amazonaws.com/tooldo-api:latest`

### 5. ECS Fargate

#### Criar Cluster

No console ECS:

1. Criar cluster: `tooldo-api`
2. Tipo: Fargate

#### Criar Task Definition

1. Nome: `tooldo-api-task`
2. Tipo: Fargate
3. CPU/Memória: 0.5 vCPU / 1 GB (ajustar conforme necessário)
4. Container:
   - Nome: `tooldo-api`
   - Imagem: `114700956661.dkr.ecr.us-east-1.amazonaws.com/tooldo-api:latest`
   - Porta: `3000`
   - Protocolo: `tcp`
5. Logging: CloudWatch Logs habilitado
6. Networking:
   - Subnets: Subnets privadas
   - Security Group: `SG-App`
7. Task Role: Criar role com permissão para ler Secrets Manager
   - Policy necessária: `SecretsManagerReadWrite` ou custom policy para `tooldo/db/prod`

#### Variáveis de Ambiente na Task Definition

Configurar as seguintes variáveis:

**Variáveis simples**:

- `NODE_ENV`: `production`
- `PORT`: `3000`
- `ALLOWED_ORIGINS`: `https://www.tooldo.com,https://tooldo.com`
- `FRONTEND_URL`: `https://www.tooldo.com`

**Variáveis do Secrets Manager** (usar referência):

- `DATABASE_URL`: Referência ao segredo `tooldo/db/prod` (campo `host`, `username`, `password`, `dbname`)
  - **Nota**: Você precisará construir a `DATABASE_URL` manualmente ou criar um script de inicialização
  - Alternativa: Usar variáveis separadas e construir no código
  - Ou: Criar um segredo completo com `DATABASE_URL` já formatada

**JWT_SECRET**:

- Criar como segredo separado: `tooldo/jwt/secret`
- Ou adicionar como variável de ambiente (menos seguro)

#### Criar Serviço

1. Nome: `tooldo-api`
2. Cluster: `tooldo-api`
3. Task Definition: `tooldo-api-task`
4. Strategy: `REPLICA`
5. Desired tasks: `1`
6. Balanceador: Deixar vazio por enquanto (configurar no próximo passo)

### 6. Application Load Balancer (ALB)

#### Criar ALB

1. Nome: `tooldo-api-alb`
2. Tipo: Application Load Balancer
3. Subnets: Subnets públicas
4. Security Group: `SG-ALB`

#### Criar Target Group

1. Nome: `tooldo-api-tg`
2. Tipo: IP
3. Porta: `3000`
4. Protocolo: HTTP
5. Health check:
   - Path: `/api/health`
   - Matcher: `200`
   - Interval: 30s
   - Timeout: 5s
   - Healthy threshold: 2
   - Unhealthy threshold: 3

#### Configurar Listener HTTPS

1. Listener: HTTPS:443
2. Certificado: Certificado ACM para `api.tooldo.com`
   - **Nota**: Solicitar certificado no ACM antes (deve estar na região us-east-1)
3. Default action: Forward para `tooldo-api-tg`

#### Associar ALB ao Serviço ECS

1. No serviço ECS `tooldo-api`
2. Atualizar serviço
3. Ativar balanceamento de carga
4. Target group: `tooldo-api-tg`
5. Listener: HTTPS:443
6. Salvar

### 7. DNS na GoDaddy

1. Acessar o painel DNS do domínio na GoDaddy
2. Criar registro CNAME:
   - Nome: `api`
   - Valor: DNS name do ALB (ex: `tooldo-api-alb-xxxxxxxx.us-east-1.elb.amazonaws.com`)
3. Aguardar propagação (alguns minutos)

### 8. Migrações do Banco de Dados

Após o deploy, executar as migrações do Prisma:

```bash
# Conectar ao container ECS ou usar AWS Systems Manager Session Manager
# Ou criar uma task one-off no ECS

# Dentro do container:
npm run prisma:migrate:deploy
```

**Alternativa**: Criar uma task ECS one-off para executar migrações:

```bash
aws ecs run-task \
  --cluster tooldo-api \
  --task-definition tooldo-api-task \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=DISABLED}" \
  --overrides '{
    "containerOverrides": [{
      "name": "tooldo-api",
      "command": ["sh", "-c", "npm run prisma:migrate:deploy && exit"]
    }]
  }'
```

## 🚀 Deploy Contínuo

### Script de Deploy Completo

Use o script `deploy.sh` para fazer build, push e atualizar o serviço:

```bash
./scripts/deploy.sh [tag] [cluster] [service]

# Exemplo:
./scripts/deploy.sh latest tooldo-api tooldo-api
```

### Deploy Manual

1. Build e push:

   ```bash
   ./scripts/build-and-push-ecr.sh latest
   ```

2. Atualizar serviço ECS:
   ```bash
   aws ecs update-service \
     --cluster tooldo-api \
     --service tooldo-api \
     --force-new-deployment \
     --region us-east-1
   ```

## ✅ Verificação

1. **Health Check**:

   ```bash
   curl https://api.tooldo.com/api/health
   ```

   Deve retornar: `{"status":"ok","timestamp":"...","service":"tooldo-api"}`

2. **Logs CloudWatch**:
   - Verificar logs do container no CloudWatch Logs
   - Grupo: `/ecs/tooldo-api`

3. **Target Group Health**:
   - Verificar saúde dos targets no ALB
   - Todos devem estar "healthy"

## 🔒 Segurança

- ✅ RDS em subnets privadas
- ✅ ECS em subnets privadas
- ✅ Security Groups restritivos
- ✅ Secrets no Secrets Manager
- ✅ HTTPS via ALB com certificado ACM
- ✅ CORS configurado para domínios específicos

## 📊 Monitoramento

### CloudWatch

- Logs: `/ecs/tooldo-api`
- Métricas: CPU, memória, requisições HTTP

### Alarmes Recomendados

1. **HTTP 5xx alto**:
   - Métrica: `HTTPCode_Target_5XX_Count`
   - Threshold: > 10 em 5 minutos

2. **CPU alta**:
   - Métrica: `CPUUtilization`
   - Threshold: > 80%

3. **Memória alta**:
   - Métrica: `MemoryUtilization`
   - Threshold: > 80%

## 🐛 Troubleshooting

### Container não inicia

1. Verificar logs no CloudWatch
2. Verificar variáveis de ambiente
3. Verificar conectividade com RDS (Security Groups)

### Health check falhando

1. Verificar se o endpoint `/api/health` está acessível
2. Verificar Security Groups (SG-App deve permitir tráfego do ALB)
3. Verificar logs do container

### Erro de conexão com banco

1. Verificar `DATABASE_URL` ou variáveis do Secrets Manager
2. Verificar Security Group do RDS (deve permitir 5432 de SG-App)
3. Verificar se o RDS está em subnets privadas acessíveis

## 📝 Notas Importantes

1. **DATABASE_URL**: O ECS não constrói automaticamente a `DATABASE_URL` a partir do segredo do Secrets Manager. Você pode:
   - Criar um script de inicialização que constrói a URL
   - Ou criar um segredo completo com a URL já formatada
   - Ou usar variáveis separadas e construir no código

2. **Migrações**: Execute as migrações do Prisma após o primeiro deploy

3. **Custos**: NAT Gateway tem custo por hora e por GB transferido. Monitore os custos.

4. **Escalabilidade**: Ajuste CPU/memória e número de tasks conforme necessário
