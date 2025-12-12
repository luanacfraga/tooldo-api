#!/bin/bash

# Script para criar segredos no AWS Secrets Manager
# Uso: ./scripts/create-secrets.sh

set -e

AWS_REGION="${AWS_REGION:-us-east-1}"

echo "🔐 Criando segredos no AWS Secrets Manager..."
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para criar segredo
create_secret() {
    local secret_name=$1
    local secret_value=$2
    local description=$3
    
    echo -e "${YELLOW}📝 Criando segredo: ${secret_name}${NC}"
    
    # Verificar se o segredo já existe
    if aws secretsmanager describe-secret --secret-id "${secret_name}" --region ${AWS_REGION} &> /dev/null; then
        echo "⚠️  Segredo ${secret_name} já existe. Atualizando..."
        aws secretsmanager update-secret \
            --secret-id "${secret_name}" \
            --secret-string "${secret_value}" \
            --region ${AWS_REGION} \
            > /dev/null
        echo -e "${GREEN}✅ Segredo ${secret_name} atualizado com sucesso!${NC}"
    else
        aws secretsmanager create-secret \
            --name "${secret_name}" \
            --description "${description}" \
            --secret-string "${secret_value}" \
            --region ${AWS_REGION} \
            > /dev/null
        echo -e "${GREEN}✅ Segredo ${secret_name} criado com sucesso!${NC}"
    fi
    echo ""
}

# 1. Segredo do Banco de Dados (JSON)
echo "📋 Você precisará fornecer as seguintes informações do RDS:"
echo "   - Host (endpoint do RDS)"
echo "   - Username"
echo "   - Password"
echo "   - Database name"
echo ""

read -p "Host do RDS (ex: tooldo-db.xxxxx.us-east-1.rds.amazonaws.com): " DB_HOST
read -p "Username do banco: " DB_USER
read -s -p "Password do banco: " DB_PASS
echo ""
read -p "Database name: " DB_NAME

DB_SECRET_JSON=$(cat <<EOF
{
  "username": "${DB_USER}",
  "password": "${DB_PASS}",
  "engine": "postgres",
  "host": "${DB_HOST}",
  "port": 5432,
  "dbname": "${DB_NAME}"
}
EOF
)

create_secret "tooldo/db/prod" "${DB_SECRET_JSON}" "Credenciais do banco de dados PostgreSQL para produção"

# 2. DATABASE_URL completa
read -p "Deseja criar o segredo DATABASE_URL completa? (s/N): " CREATE_URL
if [[ $CREATE_URL =~ ^[Ss]$ ]]; then
    DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:5432/${DB_NAME}?schema=public"
    create_secret "tooldo/db/url" "${DATABASE_URL}" "String de conexão completa do PostgreSQL"
fi

# 3. JWT Secret
echo ""
read -s -p "JWT Secret (deixe em branco para gerar automaticamente): " JWT_SECRET
echo ""

if [ -z "$JWT_SECRET" ]; then
    # Gerar JWT secret aleatório
    JWT_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    echo "🔑 JWT Secret gerado automaticamente"
fi

create_secret "tooldo/jwt/secret" "${JWT_SECRET}" "Chave secreta para assinatura de tokens JWT"

echo ""
echo -e "${GREEN}✅ Todos os segredos foram criados/atualizados com sucesso!${NC}"
echo ""
echo "📋 Segredos criados:"
echo "   - tooldo/db/prod"
if [[ $CREATE_URL =~ ^[Ss]$ ]]; then
    echo "   - tooldo/db/url"
fi
echo "   - tooldo/jwt/secret"
echo ""
echo "💡 Você pode visualizar os segredos no console AWS:"
echo "   https://us-east-1.console.aws.amazon.com/secretsmanager/list?region=us-east-1"
