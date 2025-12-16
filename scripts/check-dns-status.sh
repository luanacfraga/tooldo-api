#!/bin/bash

# Script para verificar o status do DNS para api.tooldo.net
# Uso: ./scripts/check-dns-status.sh

set -e

DOMAIN="api.tooldo.net"
ALB_DNS="tooldo-api-alb-155596415.us-east-1.elb.amazonaws.com"

echo "🔍 Verificando status do DNS para ${DOMAIN}..."
echo ""

# Verificar usando dig
echo "📋 Verificação com dig:"
DIG_RESULT=$(dig +short ${DOMAIN} 2>&1 || echo "")

if [ -z "$DIG_RESULT" ]; then
  echo "   ❌ DNS ainda não está resolvendo"
  echo ""
  echo "   ⏳ Isso pode significar:"
  echo "   1. O DNS ainda não propagou (aguarde alguns minutos)"
  echo "   2. O registro CNAME não foi criado corretamente na GoDaddy"
  echo ""
  echo "   📝 Verifique na GoDaddy se o registro está correto:"
  echo "      Nome: api"
  echo "      Tipo: CNAME"
  echo "      Valor: ${ALB_DNS}"
else
  echo "   ✅ DNS está resolvendo!"
  echo "   Resultado: ${DIG_RESULT}"
  echo ""
  
  # Verificar se está apontando para o ALB correto
  if [[ "$DIG_RESULT" == *"$ALB_DNS"* ]] || [[ "$DIG_RESULT" == *"elb.amazonaws.com"* ]]; then
    echo "   ✅ DNS está apontando para o ALB correto"
  else
    echo "   ⚠️  DNS está resolvendo, mas pode não estar apontando para o ALB correto"
    echo "   Esperado: ${ALB_DNS}"
    echo "   Encontrado: ${DIG_RESULT}"
  fi
fi

echo ""
echo "📋 Verificação com nslookup:"
NSLOOKUP_RESULT=$(nslookup ${DOMAIN} 8.8.8.8 2>&1)

if echo "$NSLOOKUP_RESULT" | grep -q "Can't find\|No answer"; then
  echo "   ❌ DNS ainda não está resolvendo (nslookup)"
else
  echo "   ✅ DNS está resolvendo (nslookup)"
  echo "$NSLOOKUP_RESULT" | grep -A 3 "Name:" | head -5
fi

echo ""
echo "🧪 Testando conectividade HTTPS:"
HTTPS_TEST=$(curl -I -s -o /dev/null -w "%{http_code}" --max-time 5 https://${DOMAIN}/api/v1/health 2>&1 || echo "000")

if [ "$HTTPS_TEST" == "200" ]; then
  echo "   ✅ HTTPS está funcionando! Status: ${HTTPS_TEST}"
  echo ""
  echo "   🎉 Tudo configurado e funcionando!"
elif [ "$HTTPS_TEST" == "000" ]; then
  echo "   ❌ Não foi possível conectar (DNS não propagou ou erro de conexão)"
else
  echo "   ⚠️  Conectou, mas retornou status: ${HTTPS_TEST}"
fi

echo ""
echo "📝 Resumo:"
echo "   Domínio: ${DOMAIN}"
echo "   ALB DNS: ${ALB_DNS}"
echo "   Status DNS: $([ -z "$DIG_RESULT" ] && echo "❌ Não resolvendo" || echo "✅ Resolvendo")"
echo "   Status HTTPS: $([ "$HTTPS_TEST" == "200" ] && echo "✅ Funcionando" || echo "❌ Não funcionando")"
