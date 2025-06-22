import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPlans() {
  try {
    console.log('📋 Verificando planos disponíveis...\n');

    const plans = await prisma.plan.findMany({
      orderBy: { price: 'asc' }
    });

    if (plans.length === 0) {
      console.log('❌ Nenhum plano encontrado no banco de dados');
      return;
    }

    console.log(`✅ Encontrados ${plans.length} planos:\n`);

    plans.forEach((plan, index) => {
      console.log(`${index + 1}. ${plan.name} 👑`);
      console.log(`   ID: ${plan.id}`);
      console.log(`   Preço: R$ ${plan.price}/mês`);
      console.log(`   Stripe Price ID: ${plan.stripePriceId}`);
      console.log(`   Ativo: ${plan.isActive ? 'Sim' : 'Não'}`);
      console.log(`   Criado em: ${plan.createdAt.toLocaleDateString('pt-BR')}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPlans(); 