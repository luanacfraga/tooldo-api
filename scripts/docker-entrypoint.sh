#!/bin/sh
set -e

# Script de inicialização que constrói DATABASE_URL a partir de variáveis individuais
# Se DB_HOST, DB_USER, DB_PASS, DB_NAME estiverem definidas, constrói DATABASE_URL

if [ -z "$DATABASE_URL" ] && [ -n "$DB_HOST" ] && [ -n "$DB_USER" ] && [ -n "$DB_PASS" ] && [ -n "$DB_NAME" ]; then
    DB_PORT="${DB_PORT:-5432}"
    DB_SCHEMA="${DB_SCHEMA:-public}"
    export DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=${DB_SCHEMA}"
    echo "✅ DATABASE_URL construída a partir de variáveis individuais"
fi

# Executar o comando original
exec "$@"


