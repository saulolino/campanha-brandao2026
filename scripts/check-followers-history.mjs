import { createConnection } from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const conn = await createConnection(process.env.DATABASE_URL);

const [rows] = await conn.execute(
  'SELECT snapshot_date, followers FROM instagram_followers_history ORDER BY snapshot_date DESC LIMIT 10'
);
console.log('Últimos 10 snapshots:');
console.table(rows);

const [first] = await conn.execute(
  'SELECT snapshot_date, followers FROM instagram_followers_history ORDER BY snapshot_date ASC LIMIT 1'
);
console.log('Primeiro snapshot:', first);

const [count] = await conn.execute('SELECT COUNT(*) as total FROM instagram_followers_history');
console.log('Total de snapshots:', count);

await conn.end();
