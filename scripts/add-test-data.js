const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addTestData() {
  console.log('🚀 Adicionando dados de teste...');

  try {
    // 1. Buscar ou criar usuário de teste
    let user = await prisma.user.findFirst({
      where: { email: 'teste@babydiary.com' }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'teste@babydiary.com',
          name: 'Mãe Teste',
          password: '$2b$10$teste123', // senha: teste123
          isActive: true,
          emailVerified: true,
          fcmToken: 'test-fcm-token-123'
        }
      });
      console.log('✅ Usuário criado:', user.email);
    } else {
      console.log('✅ Usuário encontrado:', user.email);
    }

    // 2. Buscar ou criar bebê de teste (aniversário em 2 dias)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    
    let baby = await prisma.baby.findFirst({
      where: { 
        userId: user.id,
        name: 'Joãozinho'
      }
    });

    if (!baby) {
      baby = await prisma.baby.create({
        data: {
          name: 'Joãozinho',
          gender: 'male',
          birthDate: tomorrow, // Aniversário em 2 dias
          userId: user.id,
          isActive: true
        }
      });
      console.log('✅ Bebê criado:', baby.name);
    } else {
      console.log('✅ Bebê encontrado:', baby.name);
    }

    // 3. Adicionar vacinas de exemplo
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const vaccines = [
      {
        name: 'BCG',
        date: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        nextDueDate: nextWeek,
        babyId: baby.id,
        userId: user.id,
        notes: 'Primeira dose aplicada',
        batchNumber: 'BCG-2024-001',
        clinic: 'Posto de Saúde Central'
      },
      {
        name: 'Rotavírus',
        date: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        nextDueDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // Vence em 3 dias
        babyId: baby.id,
        userId: user.id,
        notes: 'Primeira dose',
        batchNumber: 'ROTA-2024-003',
        clinic: 'Hospital Infantil'
      }
    ];

    for (const vaccine of vaccines) {
      const existingVaccine = await prisma.vaccinationRecord.findFirst({
        where: {
          name: vaccine.name,
          babyId: baby.id
        }
      });

      if (!existingVaccine) {
        await prisma.vaccinationRecord.create({
          data: vaccine
        });
        console.log(`✅ Vacina ${vaccine.name} adicionada`);
      } else {
        console.log(`✅ Vacina ${vaccine.name} já existe`);
      }
    }

    // 4. Adicionar atividades de exemplo
    const activities = [
      {
        type: 'feeding',
        title: 'Mamada da manhã',
        description: 'Amamentação exclusiva',
        babyId: baby.id,
        userId: user.id,
        date: new Date(),
        duration: 20,
        notes: 'Bebê mamou bem'
      },
      {
        type: 'sleep',
        title: 'Soneca da tarde',
        description: 'Sono tranquilo',
        babyId: baby.id,
        userId: user.id,
        date: new Date(),
        duration: 120,
        notes: 'Dormiu profundamente'
      }
    ];

    for (const activity of activities) {
      await prisma.activity.create({
        data: {
          ...activity,
          id: `activity-${activity.type}-${Date.now()}-${Math.random()}`
        }
      });
      console.log(`✅ Atividade ${activity.type} adicionada`);
    }

    // 5. Adicionar marcos de exemplo
    const milestones = [
      {
        title: 'Primeiro sorriso',
        description: 'Joãozinho sorriu pela primeira vez!',
        category: 'social',
        babyId: baby.id,
        userId: user.id,
        date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000)
      }
    ];

    for (const milestone of milestones) {
      const existingMilestone = await prisma.milestone.findFirst({
        where: {
          title: milestone.title,
          babyId: baby.id
        }
      });

      if (!existingMilestone) {
        await prisma.milestone.create({
          data: milestone
        });
        console.log(`✅ Marco ${milestone.title} adicionado`);
      } else {
        console.log(`✅ Marco ${milestone.title} já existe`);
      }
    }

    // 6. Adicionar gamificação
    const existingGamification = await prisma.gamification.findFirst({
      where: { userId: user.id }
    });

    if (!existingGamification) {
      await prisma.gamification.create({
        data: {
          userId: user.id,
          points: 150,
          level: 2,
          badges: ['Primeiro Marco', 'Ativo'],
          streaks: {
            'activities': 5,
            'memories': 3
          },
          achievements: ['Primeiro Sorriso', 'Primeiro Marco']
        }
      });
      console.log('✅ Gamificação adicionada');
    } else {
      console.log('✅ Gamificação já existe');
    }

    console.log('\n🎉 Dados de teste adicionados com sucesso!');
    console.log('\n📋 Resumo:');
    console.log(`- Usuário: ${user.email}`);
    console.log(`- Bebê: ${baby.name} (aniversário em 2 dias)`);
    console.log(`- Vacinas: ${vaccines.length} (uma vence em 3 dias)`);
    console.log(`- Atividades: ${activities.length}`);
    console.log(`- Marcos: ${milestones.length}`);
    console.log('\n🧪 Agora você pode testar as notificações automáticas!');

  } catch (error) {
    console.error('❌ Erro ao adicionar dados de teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
addTestData(); 