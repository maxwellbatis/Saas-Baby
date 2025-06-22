import Stripe from 'stripe';

// Verificar se a chave Stripe está configurada
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn('⚠️ STRIPE_SECRET_KEY não encontrada. Stripe será desabilitado.');
}

// Configuração do Stripe
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
  typescript: true,
}) : null;

// Função para verificar se a chave Stripe é válida
export const verifyStripeKey = async (): Promise<boolean> => {
  try {
    if (!stripe) {
      console.warn('Stripe não configurado');
      return false;
    }
    await stripe.paymentMethods.list({ limit: 1 });
    return true;
  } catch (error) {
    console.error('❌ Chave Stripe inválida:', error);
    return false;
  }
};

// Função para criar uma sessão de checkout
export const createCheckoutSession = async (
  priceId: string,
  customerEmail: string,
  successUrl: string,
  cancelUrl: string,
  metadata?: Record<string, string>
): Promise<Stripe.Checkout.Session> => {
  try {
    if (!stripe) {
      throw new Error('Stripe não configurado');
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      customer_email: customerEmail,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: metadata || {},
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    return session;
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error);
    throw new Error('Falha ao criar sessão de pagamento');
  }
};

// Função para criar um preço no Stripe
export const createPrice = async (
  amount: number,
  interval: 'month' | 'year',
  productId: string,
  currency: string = 'brl'
): Promise<Stripe.Price> => {
  try {
    if (!stripe) {
      throw new Error('Stripe não configurado');
    }
    // O produto não é mais criado aqui. A função agora recebe o productId.
    // const product = await stripe.products.create({
    //   name: productName,
    //   description: `Plano ${productName} do Micro-SaaS`,
    // });

    // if (!product) {
    //   throw new Error('Falha ao criar produto no Stripe');
    // }

    // Depois, criar o preço
    const price = await stripe.prices.create({
      unit_amount: Math.round(amount * 100), // Stripe usa centavos
      currency,
      recurring: {
        interval,
      },
      product: productId, // Usa o ID do produto existente
    });

    if (!price) {
      throw new Error('Falha ao criar preço no Stripe');
    }

    return price;
  } catch (error) {
    console.error('Erro ao criar preço no Stripe:', error);
    throw new Error('Falha ao criar preço no Stripe');
  }
};

// Função para cancelar uma assinatura
export const cancelSubscription = async (
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<Stripe.Subscription> => {
  try {
    if (!stripe) {
      throw new Error('Stripe não configurado');
    }
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: cancelAtPeriodEnd,
    });

    if (!subscription) {
      throw new Error('Falha ao cancelar assinatura');
    }

    return subscription;
  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error);
    throw new Error('Falha ao cancelar assinatura');
  }
};

// Função para buscar uma assinatura
export const getSubscription = async (subscriptionId: string): Promise<Stripe.Subscription> => {
  try {
    if (!stripe) {
      throw new Error('Stripe não configurado');
    }
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    if (!subscription) {
      throw new Error('Assinatura não encontrada');
    }

    return subscription;
  } catch (error) {
    console.error('Erro ao buscar assinatura:', error);
    throw new Error('Falha ao buscar assinatura');
  }
};

// Função para verificar a assinatura de webhook
export const verifyWebhookSignature = (
  payload: string | Buffer,
  signature: string
): Stripe.Event => {
  try {
    if (!stripe) {
      throw new Error('Stripe não configurado');
    }
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    return event;
  } catch (error) {
    console.error('Erro ao verificar assinatura do webhook:', error);
    throw new Error('Assinatura do webhook inválida');
  }
};

// Função para criar um cliente
export const createCustomer = async (
  email: string,
  name?: string
): Promise<Stripe.Customer> => {
  try {
    if (!stripe) {
      throw new Error('Stripe não configurado');
    }
    const customerData: any = { email };
    
    if (name) {
      customerData.name = name;
    }

    const customer = await stripe.customers.create(customerData);

    if (!customer) {
      throw new Error('Falha ao criar cliente');
    }

    return customer;
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    throw new Error('Falha ao criar cliente');
  }
};

// Função para buscar um cliente
export const getCustomer = async (customerId: string): Promise<Stripe.Customer> => {
  try {
    if (!stripe) {
      throw new Error('Stripe não configurado');
    }
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
    
    if (!customer) {
      throw new Error('Cliente não encontrado');
    }

    return customer;
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    throw new Error('Falha ao buscar cliente');
  }
};

// Função para tratar eventos de webhook do Stripe
export const handleStripeWebhook = async (event: Stripe.Event) => {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      // Exemplo: retornar dados relevantes para o teste
      return {
        status: 'success',
        userId: session.metadata?.userId || 'user123',
        planId: session.metadata?.planId || 'plan123',
      };
    }
    default:
      return { status: 'ignored' };
  }
};

export default stripe; 