import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

async function downgradeAdminToBasic() {
  try {
    console.log('🔄 Iniciando downgrade do admin para plano Básico...\n');

    // Buscar o admin no banco
    const admin = await prisma.user.findFirst({
      where: { email: 'admin@admin.com' },
      include: { subscription: true }
    });

    if (!admin) {
      console.log('❌ Admin não encontrado no banco de dados');
      return;
    }

    if (!admin.stripeCustomerId || !admin.subscription?.stripeSubscriptionId) {
      console.log('❌ Admin não tem assinatura ativa no Stripe');
      return;
    }

    console.log('👤 Admin encontrado:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Cliente Stripe: ${admin.stripeCustomerId}`);
    console.log(`   Assinatura atual: ${admin.subscription.stripeSubscriptionId}`);

    // Buscar o plano Básico
    const basicPlan = await prisma.plan.findFirst({
      where: { name: 'Básico' }
    });

    if (!basicPlan) {
      console.log('❌ Plano Básico não encontrado no banco');
      return;
    }

    console.log(`\n📋 Plano Básico encontrado:`);
    console.log(`   ID: ${basicPlan.id}`);
    console.log(`   Nome: ${basicPlan.name}`);
    console.log(`   Preço: R$ ${basicPlan.price}/mês`);
    console.log(`   Preço Stripe: ${basicPlan.stripePriceId || 'Gratuito (sem preço no Stripe)'}`);

    // Como o plano Básico é gratuito, vamos cancelar a assinatura no Stripe
    console.log('\n🔄 Cancelando assinatura no Stripe (plano gratuito)...');
    
    try {
      const canceledSubscription = await stripe.subscriptions.update(
        admin.subscription.stripeSubscriptionId,
        {
          cancel_at_period_end: true,
        }
      );

      console.log('✅ Assinatura cancelada no Stripe!');
      console.log(`   Status: ${canceledSubscription.status}`);
      console.log(`   Cancelamento no fim do período: ${canceledSubscription.cancel_at ? new Date(canceledSubscription.cancel_at * 1000).toLocaleDateString('pt-BR') : 'Não'}`);

      // Atualizar no banco de dados
      console.log('\n💾 Atualizando banco de dados...');
      
      await prisma.subscription.update({
        where: { id: admin.subscription.id },
        data: {
          planId: basicPlan.id,
          status: canceledSubscription.status,
          cancelAtPeriodEnd: canceledSubscription.cancel_at_period_end,
          currentPeriodStart: new Date(canceledSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(canceledSubscription.current_period_end * 1000),
          updatedAt: new Date(),
        }
      });

      console.log('✅ Banco de dados atualizado!');

      // Verificar se o webhook foi processado
      console.log('\n🔍 Verificando status final...');
      const updatedAdmin = await prisma.user.findFirst({
        where: { email: 'admin@admin.com' },
        include: { subscription: true }
      });

      if (updatedAdmin?.subscription) {
        console.log('📊 Status final:');
        console.log(`   Plano ID: ${updatedAdmin.subscription.planId}`);
        console.log(`   Status: ${updatedAdmin.subscription.status}`);
        console.log(`   Cancelamento no fim do período: ${updatedAdmin.subscription.cancelAtPeriodEnd}`);
        console.log(`   Próximo período: ${updatedAdmin.subscription.currentPeriodEnd?.toLocaleDateString('pt-BR')}`);
      }

      console.log('\n🎉 Downgrade concluído! O admin agora está no plano Básico gratuito.');
      console.log('📝 A assinatura será cancelada no fim do período atual.');

    } catch (error) {
      console.error('❌ Erro ao cancelar assinatura:', error);
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

downgradeAdminToBasic(); 