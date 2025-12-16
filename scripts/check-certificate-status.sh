#!/bin/bash

# Script para verificar o status do certificado SSL no ACM
# Uso: ./scripts/check-certificate-status.sh

set -e

CERTIFICATE_ARN="arn:aws:acm:us-east-1:114700956661:certificate/57cb1445-d18c-417b-8170-9f90519d68eb"
AWS_REGION="us-east-1"

echo "🔍 Verificando status do certificado SSL..."
echo ""

STATUS=$(aws acm describe-certificate \
  --certificate-arn ${CERTIFICATE_ARN} \
  --region ${AWS_REGION} \
  --query 'Certificate.Status' \
  --output text)

DOMAIN=$(aws acm describe-certificate \
  --certificate-arn ${CERTIFICATE_ARN} \
  --region ${AWS_REGION} \
  --query 'Certificate.DomainName' \
  --output text)

echo "📋 Informações do Certificado:"
echo "   Domínio: ${DOMAIN}"
echo "   Status: ${STATUS}"
echo ""

case ${STATUS} in
  "PENDING_VALIDATION")
    echo "⏳ Certificado aguardando validação DNS"
    echo ""
    echo "📝 Você precisa criar um registro CNAME na GoDaddy:"
    echo ""
    RECORD=$(aws acm describe-certificate \
      --certificate-arn ${CERTIFICATE_ARN} \
      --region ${AWS_REGION} \
      --query 'Certificate.DomainValidationOptions[0].ResourceRecord' \
      --output json)
    
    NAME=$(echo ${RECORD} | jq -r '.Name' | sed 's/\.$//' | sed 's/\.api\.tooldo\.net$//')
    VALUE=$(echo ${RECORD} | jq -r '.Value')
    
    echo "   Nome: ${NAME}"
    echo "   Tipo: CNAME"
    echo "   Valor: ${VALUE}"
    echo ""
    echo "💡 Veja o arquivo CERTIFICADO_SSL_DNS.md para instruções detalhadas"
    ;;
  "ISSUED")
    echo "✅ Certificado validado e pronto para uso!"
    echo ""
    echo "🎉 Você pode agora configurar o listener HTTPS no ALB"
    ;;
  "VALIDATION_TIMED_OUT")
    echo "❌ Validação expirada. Você precisa solicitar um novo certificado."
    ;;
  "FAILED")
    echo "❌ Falha na validação. Verifique os registros DNS."
    ;;
  *)
    echo "ℹ️  Status: ${STATUS}"
    ;;
esac

