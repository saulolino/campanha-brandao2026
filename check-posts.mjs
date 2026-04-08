import mysql from 'mysql2/promise';
const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await conn.execute('SELECT id, title, type, status, scheduledDate FROM instagram_posts ORDER BY id DESC LIMIT 5');
console.log('Posts:', JSON.stringify(rows, null, 2));
await conn.end();
