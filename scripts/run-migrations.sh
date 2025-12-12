#!/bin/bash

# Script para executar migrações do Prisma em uma task ECS one-off
# Uso: ./scripts/run-migrations.sh [cluster] [task-definition] [subnet-id-1] [subnet-id-2] [security-group-id]

set -e

AWS_REGION="${AWS_REGION:-us-east-1}"
CLUSTER_NAME="${1:-tooldo-api}"
TASK_DEFINITION="${2:-tooldo-api-task}"
SUBNET_1="${3}"
SUBNET_2="${4}"
SECURITY_GROUP="${5}"

if [ -z "$SUBNET_1" ] || [ -z "$SUBNET_2" ] || [ -z "$SECURITY_GROUP" ]; then
    echo "❌ Erro: Você precisa fornecer os IDs das subnets e do security group"
    echo ""
    echo "Uso: ./scripts/run-migrations.sh [cluster] [task-definition] [subnet-id-1] [subnet-id-2] [security-group-id]"
    echo ""
    echo "Exemplo:"
    echo "  ./scripts/run-migrations.sh tooldo-api tooldo-api-task subnet-xxxxx subnet-yyyyy sg-zzzzz"
    echo ""
    echo "Para encontrar os IDs:"
    echo "  - Subnets: aws ec2 describe-subnets --filters \"Name=tag:Name,Values=*private*\" --query 'Subnets[*].[SubnetId,Tags[?Key==\`Name\`].Value|[0]]' --output table"
    echo "  - Security Group: aws ec2 describe-security-groups --filters \"Name=group-name,Values=SG-App\" --query 'SecurityGroups[*].[GroupId,GroupName]' --output table"
    exit 1
fi

echo "🚀 Executando migrações do Prisma no ECS..."
echo "🏗️  Cluster: ${CLUSTER_NAME}"
echo "📦 Task Definition: ${TASK_DEFINITION}"
echo "🌐 Subnets: ${SUBNET_1}, ${SUBNET_2}"
echo "🔒 Security Group: ${SECURITY_GROUP}"
echo ""

# Executar task one-off
TASK_ARN=$(aws ecs run-task \
    --cluster ${CLUSTER_NAME} \
    --task-definition ${TASK_DEFINITION} \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[${SUBNET_1},${SUBNET_2}],securityGroups=[${SECURITY_GROUP}],assignPublicIp=DISABLED}" \
    --overrides '{
        "containerOverrides": [{
            "name": "weedu-api",
            "command": ["sh", "-c", "npm run prisma:migrate:deploy"]
        }]
    }' \
    --region ${AWS_REGION} \
    --query 'tasks[0].taskArn' \
    --output text)

if [ -z "$TASK_ARN" ] || [ "$TASK_ARN" == "None" ]; then
    echo "❌ Erro ao iniciar a task"
    exit 1
fi

echo "✅ Task iniciada: ${TASK_ARN}"
echo "⏳ Aguardando conclusão..."

# Aguardar conclusão da task
aws ecs wait tasks-stopped \
    --cluster ${CLUSTER_NAME} \
    --tasks ${TASK_ARN} \
    --region ${AWS_REGION}

# Verificar status
EXIT_CODE=$(aws ecs describe-tasks \
    --cluster ${CLUSTER_NAME} \
    --tasks ${TASK_ARN} \
    --region ${AWS_REGION} \
    --query 'tasks[0].containers[0].exitCode' \
    --output text)

if [ "$EXIT_CODE" == "0" ]; then
    echo "✅ Migrações executadas com sucesso!"
else
    echo "❌ Erro ao executar migrações. Exit code: ${EXIT_CODE}"
    echo ""
    echo "Para ver os logs:"
    echo "  aws logs tail /ecs/${TASK_DEFINITION} --follow --region ${AWS_REGION}"
    exit 1
fi
