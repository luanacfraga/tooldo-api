#!/bin/bash

# Script para criar Task Definition no ECS
# Uso: ./scripts/create-task-definition.sh

set -e

AWS_REGION="${AWS_REGION:-us-east-1}"
TASK_FAMILY="${TASK_FAMILY:-tooldo-api-task}"
LOG_GROUP="/ecs/tooldo-api"
EXECUTION_ROLE="ecs_tasks_execution_role-weedu-weedu-api-prod"

echo "🚀 Criando Task Definition no ECS..."
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Criar CloudWatch Log Group se não existir
echo -e "${YELLOW}📋 Verificando CloudWatch Log Group...${NC}"
if ! aws logs describe-log-groups --log-group-name-prefix "${LOG_GROUP}" --region ${AWS_REGION} --query "logGroups[?logGroupName=='${LOG_GROUP}'].logGroupName" --output text | grep -q "${LOG_GROUP}"; then
    echo "📝 Criando log group: ${LOG_GROUP}"
    aws logs create-log-group \
        --log-group-name "${LOG_GROUP}" \
        --region ${AWS_REGION} \
        > /dev/null
    echo -e "${GREEN}✅ Log group criado!${NC}"
else
    echo -e "${GREEN}✅ Log group já existe!${NC}"
fi
echo ""

# 2. Obter ARNs dos segredos
echo -e "${YELLOW}🔐 Obtendo ARNs dos segredos...${NC}"
RDS_SECRET_ARN=$(aws secretsmanager describe-secret --secret-id "rds!db-88e2c3ab-7e5b-4a52-835b-83d97a389c6b" --region ${AWS_REGION} --query 'ARN' --output text)
JWT_SECRET_ARN=$(aws secretsmanager describe-secret --secret-id tooldo/jwt/secret --region ${AWS_REGION} --query 'ARN' --output text)
DB_URL_SECRET_ARN=$(aws secretsmanager describe-secret --secret-id tooldo/db/url --region ${AWS_REGION} --query 'ARN' --output text)
EXECUTION_ROLE_ARN=$(aws iam get-role --role-name ${EXECUTION_ROLE} --query 'Role.Arn' --output text)

echo "  RDS Secret (auto-rotated): ${RDS_SECRET_ARN}"
echo "  JWT_SECRET: ${JWT_SECRET_ARN}"
echo "  DB_URL (tooldo/db/url): ${DB_URL_SECRET_ARN}"
echo "  Execution Role: ${EXECUTION_ROLE_ARN}"
echo ""

# 3. Criar arquivo JSON temporário da task definition
TASK_DEF_FILE=$(mktemp)
cat > ${TASK_DEF_FILE} <<EOF
{
  "family": "${TASK_FAMILY}",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "tooldo-api",
      "image": "114700956661.dkr.ecr.us-east-1.amazonaws.com/tooldo-api:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3000"
        },
        {
          "name": "ALLOWED_ORIGINS",
          "value": "https://www.tooldo.app,https://tooldo.app,https://www.tooldo.net,https://tooldo.net"
        },
        {
          "name": "FRONTEND_URL",
          "value": "https://www.tooldo.app"
        },
        {
          "name": "EMAIL_ASSETS_BASE_URL",
          "value": "https://www.tooldo.app"
        },
        {
          "name": "EMAIL_LOGO_URL",
          "value": "https://www.tooldo.app/images/logo.png"
        },
        {
          "name": "DB_HOST",
          "value": "tooldo-db.cmvj2jytztco.us-east-1.rds.amazonaws.com"
        },
        {
          "name": "DB_PORT",
          "value": "5432"
        },
        {
          "name": "DB_NAME",
          "value": "tooldo-db"
        },
        {
          "name": "RESEND_API_KEY",
          "value": "re_UbMqLgSQ_FTEiueLoDDfkrHGPCk8sZ51j"
        },
        {
          "name": "EMAIL_FROM",
          "value": "luana.cam20@gmail.com"
        },
        {
          "name": "EMAIL_FROM_NAME",
          "value": "Tooldo"
        }
      ],
      "secrets": [
        {
          "name": "DB_USER",
          "valueFrom": "${RDS_SECRET_ARN}:username::"
        },
        {
          "name": "DB_PASS",
          "valueFrom": "${RDS_SECRET_ARN}:password::"
        },
        {
          "name": "DATABASE_URL",
          "valueFrom": "${DB_URL_SECRET_ARN}"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "${JWT_SECRET_ARN}"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "${LOG_GROUP}",
          "awslogs-region": "${AWS_REGION}",
          "awslogs-stream-prefix": "tooldo-api"
        }
      },
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "node -e \"require('http').get('http://localhost:3000/api/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})\""
        ],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 40
      }
    }
  ],
  "executionRoleArn": "${EXECUTION_ROLE_ARN}",
  "taskRoleArn": "${EXECUTION_ROLE_ARN}"
}
EOF

echo -e "${YELLOW}📦 Criando Task Definition: ${TASK_FAMILY}...${NC}"
echo ""

# 4. Registrar task definition
aws ecs register-task-definition \
    --cli-input-json file://${TASK_DEF_FILE} \
    --region ${AWS_REGION} \
    > /dev/null

echo -e "${GREEN}✅ Task Definition criada com sucesso!${NC}"
echo ""
echo "📋 Detalhes:"
echo "   Family: ${TASK_FAMILY}"
echo "   CPU: 0.5 vCPU (512)"
echo "   Memory: 1 GB (1024)"
echo "   Image: 114700956661.dkr.ecr.us-east-1.amazonaws.com/tooldo-api:latest"
echo ""
echo "💡 Próximos passos:"
echo "   1. Verificar se a Execution Role tem permissões para Secrets Manager"
echo "   2. Criar o Serviço ECS usando esta Task Definition"
echo ""
echo "🔍 Verificar Task Definition:"
echo "   aws ecs describe-task-definition --task-definition ${TASK_FAMILY} --region ${AWS_REGION}"

# Limpar arquivo temporário
rm -f ${TASK_DEF_FILE}
