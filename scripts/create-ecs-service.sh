#!/bin/bash

# Script para criar Serviço ECS
# Uso: ./scripts/create-ecs-service.sh

set -e

AWS_REGION="${AWS_REGION:-us-east-1}"
CLUSTER_NAME="${CLUSTER_NAME:-tooldo-api}"
SERVICE_NAME="${SERVICE_NAME:-tooldo-api}"
TASK_DEFINITION="${TASK_DEFINITION:-tooldo-api-task}"
VPC_ID="${VPC_ID:-vpc-00a0060753dc70f6a}"
DESIRED_COUNT="${DESIRED_COUNT:-1}"

echo "🚀 Criando Serviço ECS..."
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Verificar se o cluster existe
echo -e "${YELLOW}📋 Verificando cluster ECS...${NC}"
if ! aws ecs describe-clusters --clusters ${CLUSTER_NAME} --region ${AWS_REGION} --query 'clusters[0].clusterName' --output text 2>/dev/null | grep -q "${CLUSTER_NAME}"; then
    echo -e "${YELLOW}📦 Cluster não encontrado. Criando cluster: ${CLUSTER_NAME}...${NC}"
    aws ecs create-cluster \
        --cluster-name ${CLUSTER_NAME} \
        --capacity-providers FARGATE FARGATE_SPOT \
        --default-capacity-provider-strategy capacityProvider=FARGATE,weight=1 \
        --region ${AWS_REGION} \
        > /dev/null
    echo -e "${GREEN}✅ Cluster criado!${NC}"
else
    echo -e "${GREEN}✅ Cluster já existe!${NC}"
fi
echo ""

# 2. Obter subnets privadas
echo -e "${YELLOW}🌐 Obtendo subnets privadas...${NC}"
SUBNETS=$(aws ec2 describe-subnets \
    --filters "Name=vpc-id,Values=${VPC_ID}" "Name=tag:Name,Values=*private*" \
    --region ${AWS_REGION} \
    --query 'Subnets[*].SubnetId' \
    --output text | tr '\t' ',')

if [ -z "$SUBNETS" ]; then
    echo -e "${RED}❌ Erro: Não foram encontradas subnets privadas na VPC ${VPC_ID}${NC}"
    exit 1
fi

echo "  Subnets: ${SUBNETS}"
echo ""

# 3. Obter Security Group
echo -e "${YELLOW}🔒 Obtendo Security Group...${NC}"
SECURITY_GROUP=$(aws ec2 describe-security-groups \
    --filters "Name=vpc-id,Values=${VPC_ID}" "Name=group-name,Values=SG_App" \
    --region ${AWS_REGION} \
    --query 'SecurityGroups[0].GroupId' \
    --output text)

if [ -z "$SECURITY_GROUP" ] || [ "$SECURITY_GROUP" == "None" ]; then
    echo -e "${RED}❌ Erro: Security Group SG_App não encontrado na VPC ${VPC_ID}${NC}"
    exit 1
fi

echo "  Security Group: ${SECURITY_GROUP}"
echo ""

# 4. Verificar se a task definition existe
echo -e "${YELLOW}📦 Verificando Task Definition...${NC}"
TASK_DEF_ARN=$(aws ecs describe-task-definition \
    --task-definition ${TASK_DEFINITION} \
    --region ${AWS_REGION} \
    --query 'taskDefinition.taskDefinitionArn' \
    --output text 2>/dev/null || echo "")

if [ -z "$TASK_DEF_ARN" ]; then
    echo -e "${RED}❌ Erro: Task Definition ${TASK_DEFINITION} não encontrada${NC}"
    echo "   Execute primeiro: ./scripts/create-task-definition.sh"
    exit 1
fi

echo "  Task Definition: ${TASK_DEFINITION}"
echo "  ARN: ${TASK_DEF_ARN}"
echo ""

# 5. Verificar se o serviço já existe
echo -e "${YELLOW}🔍 Verificando se o serviço já existe...${NC}"
if aws ecs describe-services \
    --cluster ${CLUSTER_NAME} \
    --services ${SERVICE_NAME} \
    --region ${AWS_REGION} \
    --query 'services[0].serviceName' \
    --output text 2>/dev/null | grep -q "${SERVICE_NAME}"; then
    echo -e "${YELLOW}⚠️  Serviço ${SERVICE_NAME} já existe. Atualizando...${NC}"
    
    aws ecs update-service \
        --cluster ${CLUSTER_NAME} \
        --service ${SERVICE_NAME} \
        --task-definition ${TASK_DEFINITION} \
        --desired-count ${DESIRED_COUNT} \
        --network-configuration "awsvpcConfiguration={subnets=[${SUBNETS}],securityGroups=[${SECURITY_GROUP}],assignPublicIp=DISABLED}" \
        --region ${AWS_REGION} \
        > /dev/null
    
    echo -e "${GREEN}✅ Serviço atualizado com sucesso!${NC}"
else
    echo -e "${YELLOW}📝 Criando novo serviço...${NC}"
    
    aws ecs create-service \
        --cluster ${CLUSTER_NAME} \
        --service-name ${SERVICE_NAME} \
        --task-definition ${TASK_DEFINITION} \
        --desired-count ${DESIRED_COUNT} \
        --launch-type FARGATE \
        --network-configuration "awsvpcConfiguration={subnets=[${SUBNETS}],securityGroups=[${SECURITY_GROUP}],assignPublicIp=DISABLED}" \
        --region ${AWS_REGION} \
        > /dev/null
    
    echo -e "${GREEN}✅ Serviço criado com sucesso!${NC}"
fi

echo ""
echo "📋 Detalhes do Serviço:"
echo "   Cluster: ${CLUSTER_NAME}"
echo "   Serviço: ${SERVICE_NAME}"
echo "   Task Definition: ${TASK_DEFINITION}"
echo "   Desired Count: ${DESIRED_COUNT}"
echo "   Subnets: ${SUBNETS}"
echo "   Security Group: ${SECURITY_GROUP}"
echo ""
echo "💡 Próximos passos:"
echo "   1. Aguardar o serviço iniciar (pode levar alguns minutos)"
echo "   2. Verificar logs: aws logs tail /ecs/tooldo-api --follow --region ${AWS_REGION}"
echo "   3. Verificar status: aws ecs describe-services --cluster ${CLUSTER_NAME} --services ${SERVICE_NAME} --region ${AWS_REGION}"
echo ""
echo "🔍 Verificar status do serviço:"
echo "   aws ecs describe-services --cluster ${CLUSTER_NAME} --services ${SERVICE_NAME} --region ${AWS_REGION} --query 'services[0].[status,runningCount,desiredCount]' --output table"
