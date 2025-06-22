import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

async function syncAdminSubscription() {
  try {
    console.log('🔄 Sincronizando assinatura do admin@admin.com...\n');

    // Buscar o usuário admin
    const user = await prisma.user.findUnique({
      where: { email: 'admin@admin.com' },
      include: { 
        plan: true,
        subscription: true
      }
    });

    if (!user) {
      console.error('❌ Usuário admin@admin.com não encontrado');
      return;
    }

    console.log('👤 Usuário:', {
      email: user.email,
      planoAtual: user.plan?.name,
      stripeCustomerId: user.stripeCustomerId,
      temAssinatura: !!user.subscription
    });

    if (!user.stripeCustomerId) {
      console.error('❌ Usuário não tem stripeCustomerId');
      return;
    }

    // Buscar assinaturas no Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'active',
      limit: 10
    });

    console.log(`📋 Encontradas ${subscriptions.data.length} assinaturas ativas no Stripe`);

    if (subscriptions.data.length === 0) {
      console.log('❌ Nenhuma assinatura ativa encontrada no Stripe');
      return;
    }

    const subscription = subscriptions.data[0];
    
    if (!subscription) {
      console.error('❌ Nenhuma assinatura encontrada');
      return;
    }
    
    console.log('💳 Assinatura Stripe:', {
      id: subscription.id,
      status: subscription.status,
      planId: subscription.items.data[0]?.price.id
    });

    // Buscar o plano correspondente
    const plan = await prisma.plan.findFirst({
      where: {
        OR: [
          { stripePriceId: subscription.items.data[0]?.price.id },
          { stripeYearlyPriceId: subscription.items.data[0]?.price.id }
        ]
      }
    });

    if (!plan) {
      console.error('❌ Plano não encontrado no banco de dados');
      return;
    }

    console.log('📋 Plano encontrado:', {
      id: plan.id,
      name: plan.name,
      price: plan.price
    });

    // Criar ou atualizar assinatura no banco
    if (user.subscription) {
      // Atualizar assinatura existente
      await prisma.subscription.update({
        where: { id: user.subscription.id },
        data: {
          planId: plan.id,
          stripeSubscriptionId: subscription.id,
          status: subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end
        }
      });
      console.log('✅ Assinatura atualizada no banco');
    } else {
      // Criar nova assinatura
      await prisma.subscription.create({
        data: {
          userId: user.id,
          planId: plan.id,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: user.stripeCustomerId,
          status: subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end
        }
      });
      console.log('✅ Nova assinatura criada no banco');
    }

    // Atualizar plano do usuário se necessário
    if (user.planId !== plan.id) {
      await prisma.user.update({
        where: { id: user.id },
        data: { planId: plan.id }
      });
      console.log('✅ Plano do usuário atualizado');
    }

    // Verificar resultado
    const updatedUser = await prisma.user.findUnique({
      where: { email: 'admin@admin.com' },
      include: { 
        plan: true,
        subscription: true
      }
    });

    console.log('\n📊 Resultado da sincronização:');
    console.log(`- Plano: ${updatedUser?.plan?.name} (R$ ${updatedUser?.plan?.price})`);
    console.log(`- Assinatura: ${updatedUser?.subscription?.status}`);
    console.log(`- Stripe ID: ${updatedUser?.subscription?.stripeSubscriptionId}`);

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncAdminSubscription(); 