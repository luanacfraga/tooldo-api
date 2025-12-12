# Guia: Configurar Secrets Manager

Este guia mostra como criar os segredos necessários no AWS Secrets Manager para a aplicação.

## 📋 Segredos Necessários

Você precisa criar 3 segredos:

1. **`tooldo/db/prod`** - Credenciais do RDS (JSON)
2. **`tooldo/db/url`** - DATABASE_URL completa (texto simples) - **Recomendado**
3. **`tooldo/jwt/secret`** - Chave JWT (texto simples)

## 🚀 Opção 1: Usar o Script Automatizado (Recomendado)

Execute o script interativo:

```bash
./scripts/create-secrets.sh
```

O script irá:

- Pedir as informações do RDS
- Criar/atualizar os segredos automaticamente
- Gerar um JWT secret aleatório se você não fornecer um

## 📝 Opção 2: Criar Manualmente no Console AWS

### 1. Criar Segredo do Banco de Dados

1. Acesse: https://us-east-1.console.aws.amazon.com/secretsmanager/list?region=us-east-1
2. Clique em **"Store a new secret"**
3. Selecione **"Other type of secret"**
4. Em **"Plaintext"**, cole o seguinte JSON (substitua pelos seus valores):

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

5. Clique em **"Next"**
6. **Secret name:** `tooldo/db/prod`
7. **Description:** `Credenciais do banco de dados PostgreSQL para produção`
8. Clique em **"Next"** e depois **"Store"**

### 2. Criar Segredo DATABASE_URL (Recomendado)

1. Clique em **"Store a new secret"**
2. Selecione **"Other type of secret"**
3. Em **"Plaintext"**, cole a string de conexão completa:

```
postgresql://weedu:SUA_SENHA@SEU_RDS_ENDPOINT:5432/weedu_db?schema=public
```

**Exemplo real:**

```
postgresql://weedu:MinhaSenhaSegura123!@tooldo-db.abc123xyz.us-east-1.rds.amazonaws.com:5432/weedu_db?schema=public
```

4. Clique em **"Next"**
5. **Secret name:** `tooldo/db/url`
6. **Description:** `String de conexão completa do PostgreSQL`
7. Clique em **"Next"** e depois **"Store"**

### 3. Criar Segredo JWT

1. Clique em **"Store a new secret"**
2. Selecione **"Other type of secret"**
3. Em **"Plaintext"**, cole uma string aleatória forte (mínimo 32 caracteres)

**Exemplo:**

```
sua-chave-jwt-super-secreta-com-pelo-menos-32-caracteres-aleatorios
```

**Para gerar uma chave aleatória:**

```bash
openssl rand -base64 32
```

4. Clique em **"Next"**
5. **Secret name:** `tooldo/jwt/secret`
6. **Description:** `Chave secreta para assinatura de tokens JWT`
7. Clique em **"Next"** e depois **"Store"**

## 🔧 Opção 3: Criar via AWS CLI

### Segredo do Banco (JSON)

```bash
aws secretsmanager create-secret \
  --name tooldo/db/prod \
  --description "Credenciais do banco de dados PostgreSQL para produção" \
  --secret-string '{
    "username": "weedu",
    "password": "SUA_SENHA",
    "engine": "postgres",
    "host": "SEU_RDS_ENDPOINT.us-east-1.rds.amazonaws.com",
    "port": 5432,
    "dbname": "weedu_db"
  }' \
  --region us-east-1
```

### DATABASE_URL

```bash
aws secretsmanager create-secret \
  --name tooldo/db/url \
  --description "String de conexão completa do PostgreSQL" \
  --secret-string "postgresql://weedu:SUA_SENHA@SEU_RDS_ENDPOINT:5432/weedu_db?schema=public" \
  --region us-east-1
```

### JWT Secret

```bash
# Gerar chave aleatória
JWT_SECRET=$(openssl rand -base64 32)

# Criar segredo
aws secretsmanager create-secret \
  --name tooldo/jwt/secret \
  --description "Chave secreta para assinatura de tokens JWT" \
  --secret-string "${JWT_SECRET}" \
  --region us-east-1
```

## ✅ Verificar Segredos Criados

```bash
# Listar todos os segredos
aws secretsmanager list-secrets \
  --region us-east-1 \
  --query 'SecretList[?contains(Name, `tooldo`)].Name' \
  --output table

# Ver detalhes de um segredo (sem mostrar o valor)
aws secretsmanager describe-secret \
  --secret-id tooldo/db/prod \
  --region us-east-1
```

## 🔒 Permissões Necessárias

A Task Role do ECS precisa ter permissão para ler esses segredos. Adicione esta política:

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
        "arn:aws:secretsmanager:us-east-1:114700956661:secret:tooldo/db/url-*",
        "arn:aws:secretsmanager:us-east-1:114700956661:secret:tooldo/jwt/secret-*"
      ]
    }
  ]
}
```

## 📝 Notas Importantes

1. **DATABASE_URL vs JSON**: Recomendamos usar `tooldo/db/url` porque é mais simples de referenciar no ECS
2. **JWT Secret**: Use uma chave forte e aleatória. Nunca compartilhe ou commite no código
3. **Rotação**: Considere habilitar rotação automática para o segredo do banco
4. **Custos**: Secrets Manager cobra $0.40 por segredo por mês + $0.05 por 10.000 chamadas de API

## 🆘 Troubleshooting

### Erro: "AccessDeniedException"

- Verifique se você tem permissões IAM para criar segredos
- Verifique se está na região correta (us-east-1)

### Erro: "ResourceExistsException"

- O segredo já existe. Use `update-secret` ou delete primeiro

### Como atualizar um segredo existente

```bash
aws secretsmanager update-secret \
  --secret-id tooldo/db/prod \
  --secret-string '{"username":"...","password":"..."}' \
  --region us-east-1
```
