/**
 * Script de migração para corrigir schema de roles no banco de dados
 * Executa: node server/migrations/fix-roles.mjs
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL não configurada');
  process.exit(1);
}

async function migrateRoles() {
  let connection;

  try {
    // Parsear DATABASE_URL
    const url = new URL(DATABASE_URL);
    const config = {
      host: url.hostname,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      port: url.port || 3306,
    };

    // Adicionar SSL para TiDB
    config.ssl = {};
    config.enableKeepAlive = true;

    connection = await mysql.createConnection(config);
    console.log('✓ Conectado ao banco de dados');

    // 1. Verificar se coluna 'role' existe
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'role'
    `);

    if (columns.length === 0) {
      console.log('✗ Coluna "role" não existe. Criando...');
      await connection.query(`
        ALTER TABLE users ADD COLUMN role ENUM('visitor', 'team', 'coordinator', 'superadmin') DEFAULT 'visitor'
      `);
      console.log('✓ Coluna "role" criada com sucesso');
    } else {
      console.log('✓ Coluna "role" já existe');
    }

    // 2. Atualizar roles padrão para usuários existentes
    const [users] = await connection.query(`
      SELECT id, email FROM users WHERE role IS NULL OR role = ''
    `);

    if (users.length > 0) {
      console.log(`\nAtualizando ${users.length} usuários com role padrão...`);

      for (const user of users) {
        // Definir role baseado em email
        let role = 'visitor';
        if (user.email === 'superadmin@teste.com') {
          role = 'superadmin';
        } else if (user.email === 'coordenador@teste.com') {
          role = 'coordinator';
        } else if (user.email === 'equipe@teste.com') {
          role = 'team';
        }

        await connection.query(
          'UPDATE users SET role = ? WHERE id = ?',
          [role, user.id]
        );

        console.log(`  ✓ ${user.email} → ${role}`);
      }
    } else {
      console.log('✓ Todos os usuários já têm role definido');
    }

    // 3. Verificar integridade dos dados
    const [stats] = await connection.query(`
      SELECT role, COUNT(*) as count FROM users GROUP BY role
    `);

    console.log('\n📊 Estatísticas de roles:');
    for (const stat of stats) {
      console.log(`  ${stat.role}: ${stat.count} usuários`);
    }

    console.log('\n✓ Migração concluída com sucesso!');
  } catch (error) {
    console.error('✗ Erro durante migração:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

migrateRoles();
