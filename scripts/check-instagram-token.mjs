/**
 * Script para verificar o token do Instagram no banco de dados
 */
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL não definida');
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);

try {
  // Verificar se a tabela instagram_config existe
  const [tables] = await connection.execute(
    "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'instagram_config'"
  );
  
  if (tables.length === 0) {
    console.log('Tabela instagram_config não existe');
  } else {
    const [rows] = await connection.execute('SELECT * FROM instagram_config LIMIT 1');
    if (rows.length > 0) {
      const row = rows[0];
      console.log('Config do Instagram no banco:');
      console.log('  accountId:', row.accountId);
      console.log('  token (primeiros 30 chars):', row.accessToken?.substring(0, 30) + '...');
      console.log('  tokenExpiresAt:', row.tokenExpiresAt);
      console.log('  updatedAt:', row.updatedAt);
    } else {
      console.log('Nenhuma config do Instagram no banco');
    }
  }
  
  // Testar o token da variável de ambiente
  const token = process.env.INSTAGRAM_GRAPH_API_TOKEN;
  const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  
  if (token && accountId) {
    console.log('\nTestando token da variável de ambiente...');
    const url = `https://graph.instagram.com/v21.0/${accountId}?fields=username,followers_count&access_token=${token}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log('Resposta da Graph API:', JSON.stringify(data, null, 2));
  }
  
} finally {
  await connection.end();
}
