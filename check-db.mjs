import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await conn.execute('SHOW COLUMNS FROM instagram_posts');
console.log('Columns:', rows.map(r => r.Field).join(', '));
await conn.end();
