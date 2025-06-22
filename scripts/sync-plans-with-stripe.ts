import { PrismaClient } from '@prisma/client';
import stripe from '../src/config/stripe';
import { createPrice } from '../src/config/stripe';

const prisma = new PrismaClient();

async function syncPlansWithStripe() {
  try {
    console.log('🔄 Sincronizando planos com Stripe...');

    // Buscar todos os planos
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });

    console.log(`📋 Encontrados ${plans.length} planos para sincronizar`);

    for (const plan of plans) {
      console.log(`\n🔄 Processando plano: ${plan.name}`);
      
      try {
        // Verificar se já tem stripeProductId
        if (!plan.stripeProductId) {
          console.log(`❌ Plano ${plan.name} não tem stripeProductId configurado`);
          continue;
        }

        // Criar preço mensal se não existir
        if (plan.price > 0 && (!plan.stripePriceId || plan.stripePriceId === 'price_premium_monthly' || plan.stripePriceId === 'price_family_monthly')) {
          console.log(`💰 Criando preço mensal para ${plan.name}: R$ ${plan.price}`);
          
          const monthlyPrice = await createPrice(plan.price, 'month', plan.stripeProductId);
          
          await prisma.plan.update({
            where: { id: plan.id },
            data: { stripePriceId: monthlyPrice.id }
          });
          
          console.log(`✅ Preço mensal criado: ${monthlyPrice.id}`);
        }

        // Criar preço anual se não existir
        if (plan.yearlyPrice && plan.yearlyPrice > 0 && (!plan.stripeYearlyPriceId || plan.stripeYearlyPriceId === 'price_premium_yearly' || plan.stripeYearlyPriceId === 'price_family_yearly')) {
          console.log(`💰 Criando preço anual para ${plan.name}: R$ ${plan.yearlyPrice}`);
          
          const yearlyPrice = await createPrice(plan.yearlyPrice, 'year', plan.stripeProductId);
          
          await prisma.plan.update({
            where: { id: plan.id },
            data: { stripeYearlyPriceId: yearlyPrice.id }
          });
          
          console.log(`✅ Preço anual criado: ${yearlyPrice.id}`);
        }

        console.log(`✅ Plano ${plan.name} sincronizado com sucesso`);
        
      } catch (error) {
        console.error(`❌ Erro ao sincronizar plano ${plan.name}:`, error);
      }
    }

    console.log('\n🎉 Sincronização concluída!');
    
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
syncPlansWithStripe(); 