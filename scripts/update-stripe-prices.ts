import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateStripePrices() {
  console.log('🔄 Atualizando IDs dos preços do Stripe...\n');

  try {
    // Listar todos os planos atuais
    const plans = await prisma.plan.findMany({
      where: { isActive: true }
    });

    console.log('📋 Planos encontrados:');
    plans.forEach(plan => {
      console.log(`- ${plan.name}: ${plan.stripePriceId} (R$ ${plan.price})`);
    });

    console.log('\n⚠️  ATENÇÃO:');
    console.log('1. Acesse o Stripe Dashboard em modo LIVE');
    console.log('2. Vá em Produtos > Preços');
    console.log('3. Crie novos preços para cada plano (ou use existentes)');
    console.log('4. Copie os IDs dos preços (começam com "price_")');
    console.log('5. Atualize os IDs no banco de dados\n');

    // Exemplo de como atualizar (descomente e ajuste os IDs)
    /*
    await prisma.plan.updateMany({
      where: { name: 'Básico' },
      data: { stripePriceId: 'price_NOVO_ID_AQUI' }
    });

    await prisma.plan.updateMany({
      where: { name: 'Premium' },
      data: { stripePriceId: 'price_NOVO_ID_AQUI' }
    });

    await prisma.plan.updateMany({
      where: { name: 'Familiar' },
      data: { stripePriceId: 'price_NOVO_ID_AQUI' }
    });
    */

    console.log('✅ Script executado com sucesso!');
    console.log('📝 Lembre-se de atualizar os IDs dos preços no código acima.');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateStripePrices(); 