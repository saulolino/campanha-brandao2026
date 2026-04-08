import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

const statements = [
  "ALTER TABLE `instagram_posts` ADD COLUMN `type` enum('reels','carrossel','video','story','imagem') DEFAULT 'imagem' NOT NULL",
  "ALTER TABLE `instagram_posts` ADD COLUMN `objective` varchar(255)",
  "ALTER TABLE `instagram_posts` ADD COLUMN `scheduledTime` varchar(5) DEFAULT '12:00'",
  "ALTER TABLE `instagram_posts` ADD COLUMN `description` text",
  "ALTER TABLE `instagram_posts` ADD COLUMN `expectedReach` int DEFAULT 0",
  "ALTER TABLE `instagram_posts` ADD COLUMN `expectedLikes` int DEFAULT 0",
  "ALTER TABLE `instagram_posts` ADD COLUMN `expectedComments` int DEFAULT 0",
  "ALTER TABLE `instagram_posts` ADD COLUMN `budget` decimal(10,2)",
  "ALTER TABLE `instagram_posts` ADD COLUMN `notes` text"
];

for (const sql of statements) {
  try {
    await conn.execute(sql);
    const col = sql.match(/ADD COLUMN `(\w+)`/)[1];
    console.log(`✅ Added column: ${col}`);
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      const col = sql.match(/ADD COLUMN `(\w+)`/)[1];
      console.log(`⚠️  Column already exists: ${col}`);
    } else {
      console.error(`❌ Error: ${err.message}`);
    }
  }
}

const [rows] = await conn.execute('SHOW COLUMNS FROM instagram_posts');
console.log('\nFinal columns:', rows.map(r => r.Field).join(', '));
await conn.end();
