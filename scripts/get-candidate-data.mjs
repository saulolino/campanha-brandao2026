import mysql2 from 'mysql2/promise';
import { config } from 'dotenv';
config();

const conn = await mysql2.createConnection(process.env.DATABASE_URL);

const [settings] = await conn.execute('SELECT * FROM campaign_settings LIMIT 1');
console.log('=== CANDIDATE SETTINGS ===');
console.log(JSON.stringify(settings[0] || {}, null, 2));

const [competitors] = await conn.execute('SELECT * FROM competitors LIMIT 10');
console.log('\n=== COMPETITORS ===');
console.log(JSON.stringify(competitors, null, 2));

const [metrics] = await conn.execute('SELECT * FROM instagram_metrics ORDER BY createdAt DESC LIMIT 3');
console.log('\n=== INSTAGRAM METRICS ===');
console.log(JSON.stringify(metrics, null, 2));

const [posts] = await conn.execute('SELECT title, type, status, scheduledDate, realLikes, realComments, realReach, aiAnalysis FROM instagram_posts WHERE status = "published" ORDER BY scheduledDate DESC LIMIT 15');
console.log('\n=== PUBLISHED POSTS ===');
console.log(JSON.stringify(posts, null, 2));

await conn.end();
