import mysql from 'mysql2/promise';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [applied] = await conn.execute('SELECT hash FROM __drizzle_migrations ORDER BY created_at');
const appliedHashes = new Set(applied.map(m => m.hash));

// Get all migration files
const migrationsDir = './drizzle';
const files = fs.readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort();

for (const file of files) {
  const content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
  const hash = crypto.createHash('sha256').update(content).digest('hex');
  const status = appliedHashes.has(hash) ? '✅ Applied' : '❌ NOT Applied';
  console.log(`${status}: ${file} (hash: ${hash.substring(0, 16)}...)`);
}

await conn.end();
