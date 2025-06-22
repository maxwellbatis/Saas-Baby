const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔐 Criando administrador...');
    
    // Gerar hash da senha
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Verificar se já existe um admin com este email
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: 'admin@babydiary.com' }
    });
    
    if (existingAdmin) {
      console.log('⚠️  Admin já existe! Atualizando senha...');
      
      await prisma.admin.update({
        where: { email: 'admin@babydiary.com' },
        data: {
          password: hashedPassword,
          name: 'Administrador',
          role: 'admin',
          isActive: true,
          updatedAt: new Date()
        }
      });
      
      console.log('✅ Admin atualizado com sucesso!');
    } else {
      // Criar novo admin
      const admin = await prisma.admin.create({
        data: {
          email: 'admin@babydiary.com',
          password: hashedPassword,
          name: 'Administrador',
          role: 'admin',
          isActive: true,
          permissions: []
        }
      });
      
      console.log('✅ Admin criado com sucesso!');
      console.log('📧 Email:', admin.email);
      console.log('👤 Nome:', admin.name);
      console.log('🔑 Senha:', password);
      console.log('🆔 ID:', admin.id);
    }
    
    // Listar todos os admins
    console.log('\n📋 Listando todos os administradores:');
    const allAdmins = await prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });
    
    allAdmins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name} (${admin.email}) - ${admin.role} - ${admin.isActive ? 'Ativo' : 'Inativo'}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao criar admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
createAdmin(); 