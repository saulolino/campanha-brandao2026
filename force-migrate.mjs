import mysql from 'mysql2/promise';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Get applied hashes
const [applied] = await conn.execute('SELECT hash FROM __drizzle_migrations ORDER BY created_at');
const appliedHashes = new Set(applied.map(m => m.hash));

// Get migration files
const migrationsDir = './drizzle';
const files = fs.readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort();

for (const file of files) {
  const content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
  const hash = crypto.createHash('sha256').update(content).digest('hex');
  
  if (appliedHashes.has(hash)) {
    console.log(`⏭️  Already applied: ${file}`);
    continue;
  }
  
  console.log(`\n🔄 Applying: ${file}`);
  
  // Split by --> statement-breakpoint and execute each statement
  const statements = content.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s.length > 0);
  
  let success = true;
  for (const stmt of statements) {
    try {
      await conn.execute(stmt);
      console.log(`  ✅ ${stmt.substring(0, 60)}...`);
    } catch (err) {
      // Some errors are acceptable (column already exists, etc.)
      if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_CANT_DROP_FIELD_OR_KEY' || err.code === 'ER_DUP_KEYNAME') {
        console.log(`  ⚠️  Skipped (already done): ${stmt.substring(0, 60)}...`);
      } else {
        console.error(`  ❌ Error: ${err.message}`);
        console.error(`     Statement: ${stmt.substring(0, 100)}`);
        success = false;
      }
    }
  }
  
  if (success) {
    // Record the migration as applied
    await conn.execute(
      'INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)',
      [hash, Date.now()]
    );
    console.log(`✅ Recorded migration: ${file}`);
  }
}

console.log('\n✅ Migration process complete!');
await conn.end();
