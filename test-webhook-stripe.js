const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

async function testWebhook() {
  try {
    console.log('🧪 Testando webhook do Stripe...');
    
    // Simular evento de checkout.session.completed
    const testEvent = {
      id: 'evt_test_' + Date.now(),
      object: 'event',
      api_version: '2023-10-16',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: 'cs_test_' + Date.now(),
          object: 'checkout.session',
          payment_status: 'paid',
          payment_intent: 'pi_test_' + Date.now(),
          customer_email: 'test@example.com',
          metadata: {
            source: 'baby_diary_shop',
            order_id: 'test-order-id'
          }
        }
      },
      livemode: false,
      pending_webhooks: 1,
      request: {
        id: 'req_test',
        idempotency_key: null
      },
      type: 'checkout.session.completed'
    };

    console.log('📋 Evento de teste criado:', testEvent.id);
    console.log('📋 Session ID:', testEvent.data.object.id);
    console.log('📋 Payment Status:', testEvent.data.object.payment_status);
    
    // Aqui você pode fazer uma requisição POST para o webhook
    // ou testar diretamente o método processWebhook
    
    console.log('✅ Teste concluído!');
    console.log('💡 Para testar o webhook real, use o Stripe CLI:');
    console.log('   stripe listen --forward-to localhost:3000/api/webhook/stripe');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testWebhook(); 