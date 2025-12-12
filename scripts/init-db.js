#!/usr/bin/env node

// Script para inicializar o banco de dados no ECS
// Constrói DATABASE_URL e executa Prisma db push

const { execSync } = require('child_process');

console.log('🔧 Construindo DATABASE_URL a partir das variáveis de ambiente...');

// Verificar variáveis necessárias
const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const dbName = process.env.DB_NAME;
const dbPort = process.env.DB_PORT || '5432';
const dbSchema = process.env.DB_SCHEMA || 'public';

if (!dbHost || !dbUser || !dbPass || !dbName) {
  console.error('❌ Erro: Variáveis DB_HOST, DB_USER, DB_PASS e DB_NAME devem estar definidas');
  process.exit(1);
}

// Fazer URL encoding das credenciais
const encodedUser = encodeURIComponent(dbUser);
const encodedPass = encodeURIComponent(dbPass);
const encodedDbName = encodeURIComponent(dbName);

// Construir DATABASE_URL
const databaseUrl = `postgresql://${encodedUser}:${encodedPass}@${dbHost}:${dbPort}/${encodedDbName}?schema=${dbSchema}`;

console.log('✅ DATABASE_URL construída com sucesso');
console.log(`🗄️  Host: ${dbHost}`);
console.log(`📦 Database: ${dbName}`);
console.log('');

// Definir DATABASE_URL como variável de ambiente
process.env.DATABASE_URL = databaseUrl;

console.log('🚀 Executando prisma db push...');

try {
  execSync(
    'npx prisma db push --schema=src/infra/database/prisma/schema.prisma --accept-data-loss --skip-generate',
    {
      stdio: 'inherit',
      env: process.env
    }
  );

  console.log('');
  console.log('✅ Banco de dados inicializado com sucesso!');
} catch (error) {
  console.error('❌ Erro ao inicializar banco de dados');
  process.exit(1);
}
