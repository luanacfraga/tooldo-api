const { Client } = require('pg');

const client = new Client({
  host: 'tooldo-db.cmvj2jytztco.us-east-1.rds.amazonaws.com',
  port: 5432,
  database: 'tooldo-db',
  user: 'postgres',
  password: 'JSB?8*K5m6(]XWz$oLVI8]ey36)N',
});

async function testConnection() {
  try {
    console.log('Tentando conectar ao banco...');
    await client.connect();
    console.log('✅ Conectado com sucesso!');

    const result = await client.query('SELECT COUNT(*) FROM users');
    console.log(`Total de usuários no banco: ${result.rows[0].count}`);

    await client.end();
    console.log('Conexão encerrada');
  } catch (error) {
    console.error('❌ Erro ao conectar:', error.message);
    console.error('Código do erro:', error.code);
    process.exit(1);
  }
}

testConnection();
