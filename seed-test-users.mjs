import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const testUsers = [
  {
    name: 'Visitante Teste',
    email: 'visitante@teste.com',
    whatsapp: '(61) 98888-8888',
    password: 'senha123',
    role: 'visitor'
  },
  {
    name: 'Equipe Teste',
    email: 'equipe@teste.com',
    whatsapp: '(61) 97777-7777',
    password: 'senha123',
    role: 'team'
  },
  {
    name: 'Coordenador Teste',
    email: 'coordenador@teste.com',
    whatsapp: '(61) 96666-6666',
    password: 'senha123',
    role: 'coordinator'
  },
  {
    name: 'Superadmin Teste',
    email: 'superadmin@teste.com',
    whatsapp: '(61) 95555-5555',
    password: 'senha123',
    role: 'superadmin'
  }
];

async function seedUsers() {
  try {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    
    console.log('Conectado ao banco de dados');
    
    for (const user of testUsers) {
      try {
        // Verificar se o usuário já existe
        const [existing] = await connection.execute(
          'SELECT id FROM users WHERE email = ?',
          [user.email]
        );
        
        if (existing.length > 0) {
          console.log(`❌ Usuário ${user.email} já existe`);
          continue;
        }
        
        // Hash da senha
        const passwordHash = await bcrypt.hash(user.password, 10);
        
        // Inserir usuário
        await connection.execute(
          'INSERT INTO users (name, email, whatsapp, passwordHash, role, emailVerified, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW(), NOW())',
          [user.name, user.email, user.whatsapp, passwordHash, user.role]
        );
        
        console.log(`✅ Usuário ${user.email} (${user.role}) criado com sucesso`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Senha: ${user.password}`);
        console.log(`   WhatsApp: ${user.whatsapp}`);
        console.log('');
      } catch (error) {
        console.error(`❌ Erro ao criar usuário ${user.email}:`, error.message);
      }
    }
    
    await connection.end();
    console.log('Desconectado do banco de dados');
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
    process.exit(1);
  }
}

seedUsers();
