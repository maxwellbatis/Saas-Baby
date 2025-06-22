import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

async function checkAdminSubscription() {
  try {
    console.log('🔍 Verificando assinatura do admin...\n');

    // Buscar o admin no banco
    const admin = await prisma.user.findFirst({
      where: { email: 'admin@admin.com' },
      include: { subscription: true }
    });

    if (!admin) {
      console.log('❌ Admin não encontrado no banco de dados');
      return;
    }

    console.log('👤 Dados do Admin:');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Nome: ${admin.name}`);
    console.log(`   Stripe Customer ID: ${admin.stripeCustomerId || 'Não definido'}`);

    if (admin.subscription) {
      console.log('\n📋 Dados da Assinatura no Banco:');
      console.log(`   ID da assinatura: ${admin.subscription.stripeSubscriptionId}`);
      console.log(`   Status: ${admin.subscription.status}`);
      console.log(`   Plano ID: ${admin.subscription.planId}`);
      console.log(`   Criada em: ${admin.subscription.createdAt}`);
      console.log(`   Atualizada em: ${admin.subscription.updatedAt}`);
      console.log(`   Cancelamento no fim do período: ${admin.subscription.cancelAtPeriodEnd}`);
    }

    // Verificar no Stripe
    if (admin.stripeCustomerId) {
      console.log('\n💳 Verificando no Stripe...');
      
      try {
        const customer = await stripe.customers.retrieve(admin.stripeCustomerId);
        
        if ('email' in customer) {
          console.log(`   Cliente Stripe: ${customer.id}`);
          console.log(`   Email: ${customer.email}`);
          console.log(`   Nome: ${customer.name}`);

          if (admin.subscription?.stripeSubscriptionId) {
            const subscription = await stripe.subscriptions.retrieve(admin.subscription.stripeSubscriptionId);
            console.log('\n📦 Assinatura no Stripe:');
            console.log(`   ID: ${subscription.id}`);
            console.log(`   Status: ${subscription.status}`);
            console.log(`   Plano atual: ${subscription.items.data[0]?.price.nickname || 'Sem nome'}`);
            console.log(`   Preço ID: ${subscription.items.data[0]?.price.id}`);
            console.log(`   Valor: R$ ${(subscription.items.data[0]?.price.unit_amount || 0) / 100}/mês`);
            console.log(`   Próxima cobrança: ${new Date(subscription.current_period_end * 1000).toLocaleDateString('pt-BR')}`);
            console.log(`   Cancelamento automático: ${subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toLocaleDateString('pt-BR') : 'Não'}`);
          }
        } else {
          console.log('❌ Cliente foi deletado no Stripe');
        }
      } catch (error) {
        console.log('❌ Erro ao buscar dados no Stripe:', error);
      }
    }

    console.log('\n✅ Verificação concluída!');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminSubscription(); 