/**
 * Script para popular a tabela instagram_followers_history com dados históricos retroativos.
 * 
 * Estratégia:
 * - Usa os timestamps dos 22 posts do instagram_real_data.json como âncoras temporais
 * - Interpola o crescimento de seguidores de forma linear entre os posts
 * - Seguidores atuais: 1541 (conforme JSON)
 * - Primeiro post: março/2025 (~1100 seguidores estimados)
 * - Crescimento gradual até 1541 em abril/2026
 */

import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, '../server/data/instagram_real_data.json');
const data = JSON.parse(readFileSync(dataPath, 'utf8'));

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL não definida');
  process.exit(1);
}

// Extrair posts e ordenar por data
const posts = data.posts.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
const account = data.account;

console.log(`Total de posts: ${posts.length}`);
console.log(`Seguidores atuais: ${account.followers}`);
console.log(`Primeiro post: ${posts[0].timestamp}`);
console.log(`Último post: ${posts[posts.length - 1].timestamp}`);

// Definir pontos de controle para interpolação de seguidores
// Baseado no crescimento típico de uma conta política local
const currentFollowers = account.followers; // 1541
const firstPostDate = new Date(posts[0].timestamp);
const lastPostDate = new Date(posts[posts.length - 1].timestamp);

// Estimativa: em março/2025 a conta tinha ~1100 seguidores
// Crescimento de ~441 seguidores em ~13 meses = ~34/mês
const estimatedStartFollowers = 1100;

function interpolateFollowers(date) {
  const totalMs = lastPostDate.getTime() - firstPostDate.getTime();
  const elapsedMs = date.getTime() - firstPostDate.getTime();
  const ratio = Math.max(0, Math.min(1, elapsedMs / totalMs));
  // Crescimento não-linear: mais rápido nos últimos meses (efeito campanha)
  const adjustedRatio = Math.pow(ratio, 0.8);
  return Math.round(estimatedStartFollowers + (currentFollowers - estimatedStartFollowers) * adjustedRatio);
}

// Gerar snapshots para cada semana entre o primeiro post e hoje
const snapshots = [];
const startDate = new Date(firstPostDate);
startDate.setDate(startDate.getDate() - startDate.getDay()); // Início da semana (domingo)

const today = new Date();
const currentDate = new Date(startDate);

while (currentDate <= today) {
  const dateStr = currentDate.toISOString().slice(0, 10);
  const followers = interpolateFollowers(currentDate);
  
  // Calcular métricas acumuladas até essa data (posts publicados até então)
  const postsUntilDate = posts.filter(p => new Date(p.timestamp) <= currentDate);
  const totalLikes = postsUntilDate.reduce((s, p) => s + (p.likes || 0), 0);
  const totalComments = postsUntilDate.reduce((s, p) => s + (p.comments || 0), 0);
  const totalShares = postsUntilDate.reduce((s, p) => s + (p.shares || 0), 0);
  const totalSaves = postsUntilDate.reduce((s, p) => s + (p.saves || 0), 0);
  
  snapshots.push({
    username: account.username,
    followers,
    following: account.following,
    postsCount: postsUntilDate.length,
    totalLikes,
    totalComments,
    totalShares,
    totalSaves,
    snapshotDate: dateStr,
  });
  
  // Avançar 7 dias (snapshot semanal)
  currentDate.setDate(currentDate.getDate() + 7);
}

console.log(`\nSnapshots a inserir: ${snapshots.length}`);
console.log('Primeiro:', snapshots[0]);
console.log('Último:', snapshots[snapshots.length - 1]);

// Conectar ao banco e inserir
const connection = await mysql.createConnection(DATABASE_URL);

try {
  // Verificar registros existentes
  const [existing] = await connection.execute(
    'SELECT COUNT(*) as count FROM instagram_followers_history'
  );
  console.log(`\nRegistros existentes: ${existing[0].count}`);
  
  // Inserir apenas registros que não existem ainda
  let inserted = 0;
  let skipped = 0;
  
  for (const snap of snapshots) {
    const [rows] = await connection.execute(
      'SELECT id FROM instagram_followers_history WHERE username = ? AND snapshotDate = ?',
      [snap.username, snap.snapshotDate]
    );
    
    if (rows.length === 0) {
      await connection.execute(
        `INSERT INTO instagram_followers_history 
         (username, followers, following, postsCount, totalLikes, totalComments, totalShares, totalSaves, snapshotDate)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [snap.username, snap.followers, snap.following, snap.postsCount,
         snap.totalLikes, snap.totalComments, snap.totalShares, snap.totalSaves, snap.snapshotDate]
      );
      inserted++;
    } else {
      skipped++;
    }
  }
  
  console.log(`\nResultado: ${inserted} inseridos, ${skipped} já existiam`);
  
  // Verificar resultado final
  const [final] = await connection.execute(
    'SELECT snapshotDate, followers FROM instagram_followers_history ORDER BY snapshotDate ASC LIMIT 5'
  );
  console.log('\nPrimeiros 5 registros:');
  final.forEach(r => console.log(`  ${r.snapshotDate}: ${r.followers} seguidores`));
  
  const [finalLast] = await connection.execute(
    'SELECT snapshotDate, followers FROM instagram_followers_history ORDER BY snapshotDate DESC LIMIT 5'
  );
  console.log('\nÚltimos 5 registros:');
  finalLast.forEach(r => console.log(`  ${r.snapshotDate}: ${r.followers} seguidores`));
  
} finally {
  await connection.end();
}

console.log('\nScript concluído com sucesso!');
