import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

try {
  // Buscar o usuário com o email especificado
  const [rows] = await connection.execute(
    'SELECT id, email, role FROM users WHERE email = ?',
    ['lino.saulo@gmail.com']
  );

  if (rows.length === 0) {
    console.log('❌ Usuário com email lino.saulo@gmail.com não encontrado');
    process.exit(1);
  }

  const user = rows[0];
  console.log(`📋 Usuário encontrado: ID=${user.id}, Email=${user.email}, Role atual=${user.role}`);

  // Atualizar o role para superadmin
  const [result] = await connection.execute(
    'UPDATE users SET role = ? WHERE id = ?',
    ['superadmin', user.id]
  );

  if (result.affectedRows > 0) {
    console.log(`✅ Role atualizado com sucesso para "superadmin"`);
  } else {
    console.log('❌ Falha ao atualizar o role');
  }
} catch (error) {
  console.error('❌ Erro:', error.message);
} finally {
  await connection.end();
}
