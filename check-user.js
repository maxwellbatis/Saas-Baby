const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUser() {
  try {
    console.log('🔍 Verificando usuário...');
    
    // ID do usuário do token JWT
    const userId = 'cmcgjythn0001fnoe7zd8o8po';
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true
      }
    });

    if (user) {
      console.log('✅ Usuário encontrado:', user);
    } else {
      console.log('❌ Usuário não encontrado');
      
      // Listar alguns usuários para verificar
      const users = await prisma.user.findMany({
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true
        }
      });
      
      console.log('📋 Usuários no banco:', users);
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser(); 