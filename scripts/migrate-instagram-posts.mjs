/**
 * Script de migração: Instagram JSON → MySQL
 * Migra os posts do arquivo instagram_real_data.json para a tabela instagram_published_posts
 * Uso: node scripts/migrate-instagram-posts.mjs
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

const JSON_PATH = resolve(__dirname, '../server/data/instagram_real_data.json');
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não definida no .env');
  process.exit(1);
}

async function migrate() {
  console.log('📂 Lendo JSON do Instagram...');
  const raw = readFileSync(JSON_PATH, 'utf-8');
  const data = JSON.parse(raw);
  const posts = data.posts || [];
  console.log(`📊 Total de posts no JSON: ${posts.length}`);

  const pool = mysql.createPool({
    uri: DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 3,
    connectTimeout: 15000,
  });

  let inserted = 0;
  let updated = 0;
  let errors = 0;

  for (const post of posts) {
    try {
      const instagramId = post.id || post.instagramId;
      if (!instagramId) {
        console.warn(`⚠️  Post sem ID ignorado: ${post.caption?.slice(0, 40)}`);
        continue;
      }

      // Converter timestamp para Date
      const postedAt = new Date(post.timestamp || post.postedAt || Date.now());

      const [existing] = await pool.query(
        'SELECT id FROM instagram_published_posts WHERE instagramId = ? LIMIT 1',
        [instagramId]
      );

      const values = {
        instagramId,
        caption: post.caption || null,
        mediaType: post.mediaType || 'IMAGE',
        mediaProductType: post.mediaProductType || 'FEED',
        permalink: post.permalink || null,
        thumbnailUrl: post.thumbnailUrl || null,
        mediaUrl: post.mediaUrl || post.thumbnailUrl || null,
        likes: post.likes || 0,
        comments: post.comments || 0,
        shares: post.shares || 0,
        saves: post.saves || 0,
        reach: post.reach || 0,
        views: post.views || 0,
        postedAt,
        syncSource: 'json',
        lastSyncedAt: new Date(),
      };

      if (existing.length > 0) {
        await pool.query(
          `UPDATE instagram_published_posts SET
            caption=?, mediaType=?, mediaProductType=?, permalink=?,
            thumbnailUrl=?, mediaUrl=?, likes=?, comments=?, shares=?,
            saves=?, reach=?, views=?, syncSource=?, lastSyncedAt=?
          WHERE instagramId=?`,
          [
            values.caption, values.mediaType, values.mediaProductType, values.permalink,
            values.thumbnailUrl, values.mediaUrl, values.likes, values.comments, values.shares,
            values.saves, values.reach, values.views, values.syncSource, values.lastSyncedAt,
            instagramId
          ]
        );
        updated++;
      } else {
        await pool.query(
          `INSERT INTO instagram_published_posts
            (instagramId, caption, mediaType, mediaProductType, permalink, thumbnailUrl, mediaUrl,
             likes, comments, shares, saves, reach, views, postedAt, syncSource, lastSyncedAt)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            values.instagramId, values.caption, values.mediaType, values.mediaProductType,
            values.permalink, values.thumbnailUrl, values.mediaUrl,
            values.likes, values.comments, values.shares, values.saves, values.reach, values.views,
            values.postedAt, values.syncSource, values.lastSyncedAt
          ]
        );
        inserted++;
      }
    } catch (err) {
      console.error(`❌ Erro ao migrar post ${post.id}:`, err.message);
      errors++;
    }
  }

  await pool.end();

  console.log('\n✅ Migração concluída:');
  console.log(`   Inseridos: ${inserted}`);
  console.log(`   Atualizados: ${updated}`);
  console.log(`   Erros: ${errors}`);
  console.log(`   Total processados: ${inserted + updated + errors} / ${posts.length}`);
}

migrate().catch((err) => {
  console.error('❌ Falha na migração:', err);
  process.exit(1);
});
