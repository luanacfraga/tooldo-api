#!/bin/bash

# Script de validação pré-deploy
# Executa todas as verificações necessárias antes de publicar a API
# Uso: ./scripts/pre-deploy-check.sh

set -e

echo "🔍 Iniciando validação pré-deploy..."
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para exibir erros
error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Função para exibir sucesso
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Função para exibir aviso
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Função para exibir informação
info() {
    echo -e "ℹ️  $1"
}

# 1. Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    error "Execute este script a partir da raiz do projeto"
fi

# 2. Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    warning "node_modules não encontrado. Instalando dependências..."
    npm install
fi

echo ""
echo "📦 1/7 Verificando dependências..."
if npm list --depth=0 > /dev/null 2>&1; then
    success "Dependências OK"
else
    warning "Algumas dependências podem estar faltando. Continuando..."
fi

echo ""
echo "🔧 2/7 Gerando cliente Prisma..."
if npm run prisma:generate > /dev/null 2>&1; then
    success "Cliente Prisma gerado"
else
    error "Falha ao gerar cliente Prisma"
fi

echo ""
echo "📝 3/7 Verificando tipos TypeScript..."
if npm run typecheck > /dev/null 2>&1; then
    success "TypeScript OK - sem erros de tipo"
else
    error "Erros de tipo encontrados. Execute 'npm run typecheck' para ver detalhes"
fi

echo ""
echo "🧹 4/7 Verificando lint..."
if npm run lint:check > /dev/null 2>&1; then
    success "Lint OK - código está em conformidade"
else
    error "Problemas de lint encontrados. Execute 'npm run lint:fix' para corrigir"
fi

echo ""
echo "💅 5/7 Verificando formatação..."
if npm run format:check > /dev/null 2>&1; then
    success "Formatação OK"
else
    error "Problemas de formatação encontrados. Execute 'npm run format' para corrigir"
fi

echo ""
echo "🧪 6/7 Executando testes..."
if npm run test > /dev/null 2>&1; then
    success "Testes passaram"
else
    error "Testes falharam. Execute 'npm run test' para ver detalhes"
fi

echo ""
echo "🏗️  7/7 Verificando build de produção..."
if npm run build > /dev/null 2>&1; then
    success "Build de produção OK"
    
    # Verificar se o arquivo main.js foi gerado
    if [ -f "dist/main.js" ]; then
        success "Arquivo dist/main.js gerado corretamente"
    else
        error "Arquivo dist/main.js não foi gerado"
    fi
else
    error "Build de produção falhou. Execute 'npm run build' para ver detalhes"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 Todas as validações passaram!${NC}"
echo ""
echo "📋 Checklist completo:"
echo "  ✅ Dependências instaladas"
echo "  ✅ Cliente Prisma gerado"
echo "  ✅ TypeScript sem erros"
echo "  ✅ Lint OK"
echo "  ✅ Formatação OK"
echo "  ✅ Testes passaram"
echo "  ✅ Build de produção OK"
echo ""
echo "🚀 Você está pronto para fazer deploy!"
echo ""
echo "Próximos passos:"
echo "  1. Commit suas alterações: git add . && git commit -m 'mensagem'"
echo "  2. Push para o repositório: git push origin main"
echo "  3. Ou faça deploy manual: ./scripts/deploy.sh latest"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

