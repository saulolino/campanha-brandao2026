import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Check if drizzle migrations table exists
const [tables] = await conn.execute("SHOW TABLES LIKE '__drizzle_migrations'");
console.log('Drizzle migrations table exists:', tables.length > 0);

if (tables.length > 0) {
  const [migrations] = await conn.execute('SELECT * FROM __drizzle_migrations ORDER BY created_at');
  console.log('Applied migrations:', migrations.map(m => m.hash || m.tag || JSON.stringify(m)).join('\n'));
}

await conn.end();
