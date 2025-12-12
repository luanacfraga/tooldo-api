#!/bin/bash

# Script completo de deploy: build, push e atualização do serviço ECS
# Uso: ./scripts/deploy.sh [tag] [cluster] [service]
# Exemplo: ./scripts/deploy.sh latest tooldo-api tooldo-api

set -e

# Configurações
AWS_REGION="${AWS_REGION:-us-east-1}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-114700956661}"
ECR_REPOSITORY="${ECR_REPOSITORY:-tooldo-api}"
IMAGE_TAG="${1:-latest}"
CLUSTER_NAME="${2:-tooldo-api}"
SERVICE_NAME="${3:-tooldo-api}"

ECR_IMAGE="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:${IMAGE_TAG}"

echo "🚀 Iniciando deploy completo..."
echo "📦 Repositório: ${ECR_REPOSITORY}"
echo "🏷️  Tag: ${IMAGE_TAG}"
echo "🏗️  Cluster: ${CLUSTER_NAME}"
echo "⚙️  Serviço: ${SERVICE_NAME}"
echo ""

# Executar build e push
echo "📦 Executando build e push..."
./scripts/build-and-push-ecr.sh ${IMAGE_TAG}

# Atualizar serviço ECS
echo "🔄 Atualizando serviço ECS..."
aws ecs update-service \
    --cluster ${CLUSTER_NAME} \
    --service ${SERVICE_NAME} \
    --force-new-deployment \
    --region ${AWS_REGION} \
    > /dev/null

echo ""
echo "✅ Deploy iniciado com sucesso!"
echo "⏳ Aguardando atualização do serviço..."
echo ""

# Aguardar estabilização do serviço (opcional)
read -p "Deseja aguardar a estabilização do serviço? (s/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo "⏳ Aguardando estabilização..."
    aws ecs wait services-stable \
        --cluster ${CLUSTER_NAME} \
        --services ${SERVICE_NAME} \
        --region ${AWS_REGION}
    echo "✅ Serviço estabilizado!"
fi

echo ""
echo "🎉 Deploy concluído!"
