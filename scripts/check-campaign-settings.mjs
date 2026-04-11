/**
 * Script para verificar as configurações da campanha no banco de dados
 */
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL não definida');
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);

try {
  const [rows] = await connection.execute('SELECT * FROM campaign_settings LIMIT 5');
  
  if (rows.length === 0) {
    console.log('Nenhuma configuração de campanha encontrada');
  } else {
    for (const row of rows) {
      console.log('Campaign Settings:');
      console.log('  id:', row.id);
      console.log('  instagramAccessToken (primeiros 30):', row.instagramAccessToken?.substring(0, 30) + '...');
      console.log('  instagramTokenExpiresAt:', row.instagramTokenExpiresAt);
      console.log('  updatedAt:', row.updatedAt);
      
      // Testar o token
      if (row.instagramAccessToken) {
        const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || '17841401389412709';
        const url = `https://graph.instagram.com/v21.0/${accountId}?fields=username,followers_count&access_token=${row.instagramAccessToken}`;
        const response = await fetch(url);
        const data = await response.json();
        console.log('  Teste da Graph API:', JSON.stringify(data));
      }
    }
  }
} finally {
  await connection.end();
}
