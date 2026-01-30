#!/bin/sh
set -e

# Script de inicialização que constrói DATABASE_URL a partir de variáveis individuais.
# Se DB_HOST, DB_USER, DB_PASS, DB_NAME estiverem definidas, constrói DATABASE_URL,
# mas apenas se DATABASE_URL ainda não estiver definida (produção pode usar Secrets).

if [ -z "$DATABASE_URL" ] && [ -n "$DB_HOST" ] && [ -n "$DB_USER" ] && [ -n "$DB_PASS" ] && [ -n "$DB_NAME" ]; then
    DB_PORT="${DB_PORT:-5432}"
    DB_SCHEMA="${DB_SCHEMA:-public}"
    # Usamos o Node (presente na imagem) para fazer o URL-encode seguro da senha,
    # evitando erros de parsing no Prisma quando a senha tem caracteres especiais.
    ENCODED_DB_PASS=$(node -e "console.log(encodeURIComponent(process.env.DB_PASS || ''))")
    export DATABASE_URL="postgresql://${DB_USER}:${ENCODED_DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=${DB_SCHEMA}"
    echo "✅ DATABASE_URL construída a partir de variáveis individuais (com senha encodada)"
fi

# Rodar migrações do Prisma antes de subir a aplicação (idempotente; seguro com múltiplas réplicas)
if [ -n "$DATABASE_URL" ]; then
    echo "🔄 Aplicando migrações do banco..."
    npm run prisma:migrate:deploy
    echo "✅ Migrações aplicadas."
fi

# Executar o comando original
exec "$@"


