import { Router, Request, Response } from 'express';
import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '@/config/database';
import { createCheckoutSession, cancelSubscription, getSubscription } from '@/config/stripe';
import stripe from '@/config/stripe';
import Stripe from 'stripe';

const router = Router();

// Validações para checkout
const checkoutValidation = [
  body('planId')
    .notEmpty()
    .withMessage('ID do plano é obrigatório'),
  body('successUrl')
    .notEmpty()
    .withMessage('URL de sucesso é obrigatória'),
  body('cancelUrl')
    .notEmpty()
    .withMessage('URL de cancelamento é obrigatória'),
];

// Criar sessão de checkout
router.post('/create-checkout-session', checkoutValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array(),
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const { planId, successUrl, cancelUrl } = req.body;

    // Buscar o plano
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Plano não encontrado ou inativo',
      });
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado',
      });
    }

    // Criar sessão de checkout
    const session = await createCheckoutSession(
      plan.stripePriceId,
      user.email,
      successUrl,
      cancelUrl,
      {
        userId: user.id,
        planId: plan.id,
      }
    );

    return res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
      },
    });
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Rota para receber os webhooks do Stripe
router.post('/', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret || !stripe) {
    console.log('⚠️ Webhook secret ou assinatura não configurados.');
    res.status(400).send('Webhook Error: Configuração ausente.');
    return;
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Erro na verificação da assinatura do webhook: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Lidar com os eventos
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId, planId } = session.metadata || {};

      if (!userId || !planId) {
        console.error('❌ Webhook Error: userId ou planId ausentes nos metadados da sessão.');
        res.status(400).send('Metadados ausentes na sessão.');
        return;
      }
      
      const stripeSubscriptionId = session.subscription as string;
      const stripeCustomerId = session.customer as string;

      try {
        const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

        // Atualiza o plano e o ID do cliente Stripe no usuário
        await prisma.user.update({
          where: { id: userId },
          data: {
            planId: planId,
            stripeCustomerId: stripeCustomerId,
          },
        });

        // Cria ou atualiza o registro da assinatura no nosso banco de dados
        await prisma.subscription.upsert({
          where: { stripeSubscriptionId: subscription.id },
          update: {
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
          create: {
            userId: userId,
            planId: planId,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: stripeCustomerId,
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
        });

        console.log(`✅ Assinatura para o usuário ${userId} no plano ${planId} processada com sucesso.`);
      } catch (dbError) {
        console.error('❌ Erro de banco de dados ao processar o webhook:', dbError);
        res.status(500).send('Erro interno do servidor.');
        return;
      }
      break;
    }
    
    // Futuramente, podemos lidar com outros eventos importantes aqui
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await prisma.subscription.update({
            where: { stripeSubscriptionId: subscription.id },
            data: {
                status: subscription.status,
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            }
        });
        console.log(`✅ Assinatura ${subscription.id} atualizada para o status: ${subscription.status}`);
        break;
    }

    default:
      console.log(`🔔 Evento de webhook não tratado: ${event.type}`);
  }

  res.json({ received: true });
});

// Obter assinatura do usuário
router.get('/subscription', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.userId },
      include: {
        plan: true,
      },
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Nenhuma assinatura encontrada',
      });
    }

    return res.json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    console.error('Erro ao buscar assinatura:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Cancelar assinatura
router.post('/cancel-subscription', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.userId },
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Nenhuma assinatura encontrada',
      });
    }

    // Cancelar no Stripe
    await cancelSubscription(subscription.stripeSubscriptionId);

    // Atualizar no banco
    const updatedSubscription = await prisma.subscription.update({
      where: { userId: req.user.userId },
      data: {
        cancelAtPeriodEnd: true,
      },
      include: {
        plan: true,
      },
    });

    return res.json({
      success: true,
      message: 'Assinatura cancelada com sucesso',
      data: updatedSubscription,
    });
  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Reativar assinatura
router.post('/reactivate-subscription', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.userId },
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Nenhuma assinatura encontrada',
      });
    }

    // Reativar no Stripe
    await cancelSubscription(subscription.stripeSubscriptionId, false);

    // Atualizar no banco
    const updatedSubscription = await prisma.subscription.update({
      where: { userId: req.user.userId },
      data: {
        cancelAtPeriodEnd: false,
      },
      include: {
        plan: true,
      },
    });

    return res.json({
      success: true,
      message: 'Assinatura reativada com sucesso',
      data: updatedSubscription,
    });
  } catch (error) {
    console.error('Erro ao reativar assinatura:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Histórico de pagamentos
router.get('/payment-history', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.userId },
      include: {
        plan: true,
      },
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Nenhuma assinatura encontrada',
      });
    }

    // Buscar histórico de pagamentos no Stripe
    if (!stripe) {
      return res.status(503).json({
        success: false,
        error: 'Stripe não configurado',
      });
    }

    const payments = await stripe.invoices.list({
      subscription: subscription.stripeSubscriptionId,
      limit: 10,
    });

    return res.json({
      success: true,
      data: {
        subscription,
        payments: payments.data,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar histórico de pagamentos:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

export default router; 