import Stripe from 'stripe';
import prisma from '../config/database';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export class StripeService {
  // Criar produto no Stripe
  async createProduct(name: string, description?: string) {
    try {
      const product = await stripe.products.create({
        name,
        description,
      });
      return product;
    } catch (error) {
      console.error('Erro ao criar produto no Stripe:', error);
      throw error;
    }
  }

  // Criar preço no Stripe
  async createPrice(productId: string, amount: number, currency: string = 'brl', interval: 'month' | 'year' = 'month') {
    try {
      const price = await stripe.prices.create({
        unit_amount: Math.round(amount * 100), // Stripe usa centavos
        currency,
        recurring: {
          interval,
        },
        product: productId,
      });
      return price;
    } catch (error) {
      console.error('Erro ao criar preço no Stripe:', error);
      throw error;
    }
  }

  // Criar cliente no Stripe
  async createCustomer(email: string, name?: string) {
    try {
      const customerData: any = { email };
      
      if (name) {
        customerData.name = name;
      }

      const customer = await stripe.customers.create(customerData);
      return customer;
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }
  }

  // Criar sessão de checkout
  async createCheckoutSession(customerId: string, priceId: string, successUrl: string, cancelUrl: string) {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        customer: customerId,
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
        billing_address_collection: 'required',
      });

      return session;
    } catch (error) {
      console.error('Erro ao criar sessão de checkout:', error);
      throw error;
    }
  }

  // Criar sessão de checkout para plano específico
  async createPlanCheckoutSession(userId: string, planId: string, successUrl: string, cancelUrl: string) {
    try {
      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Buscar plano
      const plan = await prisma.plan.findUnique({
        where: { id: planId },
      });

      if (!plan) {
        throw new Error('Plano não encontrado');
      }

      // Criar ou buscar cliente no Stripe
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await this.createCustomer(user.email, user.name || undefined);
        customerId = customer.id;

        // Atualizar usuário com o customer ID
        await prisma.user.update({
          where: { id: userId },
          data: { stripeCustomerId: customerId },
        });
      }

      // Criar sessão de checkout
      const session = await this.createCheckoutSession(
        customerId,
        plan.stripePriceId,
        successUrl,
        cancelUrl
      );

      return session;
    } catch (error) {
      console.error('Erro ao criar sessão de checkout do plano:', error);
      throw error;
    }
  }

  // Cancelar assinatura
  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true) {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: cancelAtPeriodEnd,
      });

      return subscription;
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      throw error;
    }
  }

  // Atualizar assinatura
  async updateSubscription(subscriptionId: string, newPriceId: string) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      if (!subscription.items.data[0]) {
        throw new Error('Assinatura não possui itens');
      }

      const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        items: [
          {
            id: subscription.items.data[0].id,
            price: newPriceId,
          },
        ],
      });

      return updatedSubscription;
    } catch (error) {
      console.error('Erro ao atualizar assinatura:', error);
      throw error;
    }
  }

  // Buscar assinatura
  async getSubscription(subscriptionId: string) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Erro ao buscar assinatura:', error);
      throw error;
    }
  }

  // Processar webhook
  async processWebhook(event: Stripe.Event) {
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
          break;
        
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          break;
        
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
        
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;
        
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;
        
        default:
          console.log(`Evento não tratado: ${event.type}`);
      }
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      throw error;
    }
  }

  // Handlers de webhook
  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    try {
      console.log('🔍 Processando checkout.session.completed para sessão:', session.id);
      
      // Buscar pedido pelo stripe_session_id salvo no metadata
      const pedido = await prisma.pedido.findFirst({
        where: {
          metadata: {
            path: ['stripe_session_id'],
            equals: session.id,
          } as any,
        } as any,
      });

      if (!pedido) {
        console.error('❌ Pedido não encontrado para a sessão:', session.id);
        return;
      }

      console.log('✅ Pedido encontrado:', pedido.id);

      // Atualizar status do pedido para "paid"
      await prisma.pedido.update({
        where: { id: pedido.id },
        data: {
          status: 'paid',
          paymentId: session.payment_intent as string,
          // Atualizar metadata com informações do pagamento
          metadata: {
            ...(pedido.metadata as any || {}),
            payment_status: session.payment_status,
            payment_intent: session.payment_intent,
            customer_email: session.customer_email,
            updated_at: new Date().toISOString(),
          } as any,
        } as any,
      });

      console.log(`✅ Pedido ${pedido.id} atualizado para pago!`);
    } catch (error) {
      console.error('❌ Erro ao processar checkout session completed:', error);
    }
  }

  private async handleSubscriptionCreated(subscription: Stripe.Subscription) {
    try {
      // Buscar assinatura existente pelo stripeSubscriptionId
      const existingSubscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subscription.id },
        include: { user: true }
      });

      if (!existingSubscription) {
        console.error('Assinatura não encontrada no banco:', subscription.id);
        return;
      }

      const user = existingSubscription.user;

      // Buscar plano pelo price ID
      const plan = await prisma.plan.findFirst({
        where: { 
          stripePriceId: subscription.items.data[0]?.price?.id || ''
        },
      });

      if (!plan) {
        console.error('Plano não encontrado para o price ID:', subscription.items.data[0]?.price?.id);
        return;
      }

      // Atualizar assinatura
      await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          planId: plan.id,
          stripeCustomerId: subscription.customer as string,
          status: subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
      });

      console.log(`Assinatura criada para usuário ${user.email} - Status: ${subscription.status}`);
    } catch (error) {
      console.error('Erro ao processar subscription created:', error);
    }
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    try {
      // Buscar assinatura no banco
      const dbSubscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subscription.id },
      });

      if (!dbSubscription) {
        console.error('Assinatura não encontrada no banco:', subscription.id);
        return;
      }

      // Atualizar assinatura
      await prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: {
          status: subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
      });

      console.log(`Assinatura atualizada: ${subscription.id} - Status: ${subscription.status}`);
    } catch (error) {
      console.error('Erro ao processar subscription updated:', error);
    }
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    try {
      // Buscar assinatura no banco
      const dbSubscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subscription.id },
      });

      if (!dbSubscription) {
        console.error('Assinatura não encontrada no banco:', subscription.id);
        return;
      }

      // Atualizar assinatura como cancelada
      await prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: {
          status: 'canceled',
          cancelAtPeriodEnd: false,
        },
      });

      // Remover plano do usuário
      await prisma.user.update({
        where: { id: dbSubscription.userId },
        data: { planId: null },
      });

      console.log(`Assinatura cancelada: ${subscription.id}`);
    } catch (error) {
      console.error('Erro ao processar subscription deleted:', error);
    }
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    try {
      if (!invoice.subscription) {
        return;
      }

      // Buscar assinatura no banco
      const dbSubscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: invoice.subscription as string },
      });

      if (!dbSubscription) {
        console.error('Assinatura não encontrada no banco:', invoice.subscription);
        return;
      }

      // Atualizar assinatura
      await prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: {
          status: 'active',
        },
      });

      console.log(`Pagamento realizado com sucesso para assinatura: ${invoice.subscription}`);
    } catch (error) {
      console.error('Erro ao processar invoice payment succeeded:', error);
    }
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    try {
      if (!invoice.subscription) {
        return;
      }

      // Buscar assinatura no banco
      const dbSubscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: invoice.subscription as string },
      });

      if (!dbSubscription) {
        console.error('Assinatura não encontrada no banco:', invoice.subscription);
        return;
      }

      // Atualizar assinatura
      await prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: {
          status: 'past_due',
        },
      });

      console.log(`Pagamento falhou para assinatura: ${invoice.subscription}`);
    } catch (error) {
      console.error('Erro ao processar invoice payment failed:', error);
    }
  }

  // ===== MÉTODOS PARA PEDIDOS DA LOJA =====

  // Criar sessão de checkout para pedido da loja
  async createShopOrderCheckoutSession(
    userId: string,
    items: Array<{ productId: number; quantity: number }>,
    customerInfo: {
      name: string;
      email: string;
      phone: string;
      cpf: string;
    },
    shippingAddress: {
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
      city: string;
      state: string;
      zipCode: string;
    },
    successUrl: string,
    cancelUrl: string,
    orderId?: string
  ) {
    try {
      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Buscar produtos
      const productIds = items.map(item => item.productId);
      const products = await prisma.shopItem.findMany({
        where: { id: { in: productIds } },
      });

      if (products.length !== items.length) {
        throw new Error('Alguns produtos não foram encontrados');
      }

      // Criar ou buscar cliente no Stripe
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await this.createCustomer(user.email, user.name || customerInfo.name);
        customerId = customer.id;

        // Atualizar usuário com o customer ID
        await prisma.user.update({
          where: { id: userId },
          data: { stripeCustomerId: customerId },
        });
      }

      // Preparar line items para o Stripe
      const lineItems = items.map(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) {
          throw new Error(`Produto ${item.productId} não encontrado`);
        }

        return {
          price_data: {
            currency: 'brl',
            product_data: {
              name: product.name,
              description: product.description,
              images: product.mainImage ? [product.mainImage] : undefined,
            },
            unit_amount: Math.round(product.price), // Preço em centavos
          },
          quantity: item.quantity,
        };
      });

      // Criar sessão de checkout
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        customer: customerId,
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        shipping_address_collection: {
          allowed_countries: ['BR'],
        },
        metadata: {
          user_id: userId,
          source: 'baby_diary_shop',
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone,
          customer_cpf: customerInfo.cpf,
          shipping_street: shippingAddress.street,
          shipping_number: shippingAddress.number,
          shipping_complement: shippingAddress.complement || '',
          shipping_neighborhood: shippingAddress.neighborhood,
          shipping_city: shippingAddress.city,
          shipping_state: shippingAddress.state,
          shipping_zip_code: shippingAddress.zipCode,
          ...(orderId ? { order_id: orderId } : {}),
        },
      });

      return session;
    } catch (error) {
      console.error('Erro ao criar sessão de checkout da loja:', error);
      throw error;
    }
  }

  // Processar pagamento de pedido da loja
  async processShopOrderPayment(sessionId: string) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (session.payment_status !== 'paid') {
        throw new Error('Pagamento não foi realizado');
      }

      // Extrair dados do metadata
      const metadata = session.metadata;
      if (!metadata) {
        throw new Error('Metadata da sessão não encontrado');
      }

      // Verificar se userId existe
      if (!metadata.user_id) {
        throw new Error('User ID não encontrado no metadata');
      }

      // Criar pedido no banco de dados
      const order = await prisma.pedido.create({
        data: {
          userId: metadata.user_id,
          status: 'paid',
          paymentMethod: 'stripe',
          paymentId: session.payment_intent as string,
          totalAmount: session.amount_total ? session.amount_total / 100 : 0, // Converter de centavos
          customerInfo: {
            name: metadata.customer_name || '',
            email: session.customer_email || '',
            phone: metadata.customer_phone || '',
            cpf: metadata.customer_cpf || '',
          },
          shippingAddress: {
            street: metadata.shipping_street || '',
            number: metadata.shipping_number || '',
            complement: metadata.shipping_complement || '',
            neighborhood: metadata.shipping_neighborhood || '',
            city: metadata.shipping_city || '',
            state: metadata.shipping_state || '',
            zipCode: metadata.shipping_zip_code || '',
          },
          items: session.line_items?.data.map(item => ({
            productId: parseInt(item.price?.product as string) || 0,
            quantity: item.quantity || 1,
            price: item.amount_total ? item.amount_total / 100 : 0,
          })) || [],
          metadata: {
            stripe_session_id: sessionId,
            source: 'stripe',
          },
        } as any,
      });

      return order;
    } catch (error) {
      console.error('Erro ao processar pagamento do pedido:', error);
      throw error;
    }
  }

  // Buscar pedido por ID do Stripe
  async getOrderByStripeSessionId(sessionId: string) {
    try {
      const order = await prisma.pedido.findFirst({
        where: {
          metadata: {
            path: ['stripe_session_id'],
            equals: sessionId,
          } as any,
        } as any,
      });

      return order;
    } catch (error) {
      console.error('Erro ao buscar pedido por session ID:', error);
      throw error;
    }
  }

  // Reembolsar pedido
  async refundOrder(paymentIntentId: string, amount?: number) {
    try {
      const refundData: any = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100); // Converter para centavos
      }

      const refund = await stripe.refunds.create(refundData);

      // Atualizar status do pedido
      await prisma.pedido.updateMany({
        where: {
          paymentId: paymentIntentId,
        } as any,
        data: {
          status: 'refunded',
          metadata: {
            refund_id: refund.id,
            refunded_at: new Date().toISOString(),
          } as any,
        } as any,
      });

      return refund;
    } catch (error) {
      console.error('Erro ao reembolsar pedido:', error);
      throw error;
    }
  }
}

export default new StripeService(); 