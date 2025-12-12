#!/bin/bash

# Script para build e push da imagem Docker para ECR
# Uso: ./scripts/build-and-push-ecr.sh [tag]
# Exemplo: ./scripts/build-and-push-ecr.sh latest
# Exemplo: ./scripts/build-and-push-ecr.sh v1.0.0

set -e

# Configurações
AWS_REGION="${AWS_REGION:-us-east-1}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-114700956661}"
ECR_REPOSITORY="${ECR_REPOSITORY:-tooldo-api}"
IMAGE_TAG="${1:-latest}"

# Nome completo da imagem
ECR_IMAGE="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:${IMAGE_TAG}"

echo "🚀 Iniciando build e push da imagem para ECR..."
echo "📦 Repositório: ${ECR_REPOSITORY}"
echo "🏷️  Tag: ${IMAGE_TAG}"
echo "🌍 Região: ${AWS_REGION}"
echo ""

# Verificar se AWS CLI está instalado
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI não está instalado. Por favor, instale o AWS CLI."
    exit 1
fi

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Por favor, instale o Docker."
    exit 1
fi

# Fazer login no ECR
echo "🔐 Fazendo login no ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Verificar se o repositório existe, se não, criar
echo "📋 Verificando se o repositório existe..."
if ! aws ecr describe-repositories --repository-names ${ECR_REPOSITORY} --region ${AWS_REGION} &> /dev/null; then
    echo "📦 Criando repositório ${ECR_REPOSITORY}..."
    aws ecr create-repository \
        --repository-name ${ECR_REPOSITORY} \
        --region ${AWS_REGION} \
        --image-scanning-configuration scanOnPush=true \
        --encryption-configuration encryptionType=AES256
fi

# Build da imagem (sem attestations para evitar manifest lists)
# Usando --platform linux/amd64 para compatibilidade com ECS Fargate
echo "🔨 Construindo a imagem Docker para linux/amd64..."
DOCKER_BUILDKIT=1 docker build --platform linux/amd64 --provenance=false --sbom=false -t ${ECR_REPOSITORY}:${IMAGE_TAG} -t ${ECR_IMAGE} .

# Push da imagem
echo "📤 Enviando imagem para ECR..."
docker push ${ECR_IMAGE}

# Se a tag for 'latest', também fazer push com tag latest explícita
if [ "${IMAGE_TAG}" != "latest" ]; then
    echo "📤 Enviando também como 'latest'..."
    docker tag ${ECR_IMAGE} ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:latest
    docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:latest
fi

echo ""
echo "✅ Imagem enviada com sucesso!"
echo "📍 URI da imagem: ${ECR_IMAGE}"
echo ""
echo "💡 Para usar esta imagem no ECS, use a URI: ${ECR_IMAGE}"
