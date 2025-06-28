const axios = require('axios');

// Simular evento de checkout.session.completed do Stripe
const mockStripeEvent = {
  id: 'evt_test_webhook',
  object: 'event',
  api_version: '2023-10-16',
  created: Math.floor(Date.now() / 1000),
  data: {
    object: {
      id: 'cs_test_b1soMGVTwQaeXn2nJhTDXjQlGooYvF2pa5iFsAiMiIh3sAaS4z5cKe9vl0',
      object: 'checkout.session',
      amount_total: 5000, // R$ 50,00 em centavos
      currency: 'brl',
      customer_email: 'maxwell1234mellanie@gmail.com',
      mode: 'payment',
      payment_status: 'paid',
      status: 'complete',
      metadata: {
        user_id: 'cmcasnb7r0001u1eaf0y5iwt0',
        source: 'baby_diary_shop',
        customer_name: 'Maxwell Batista',
        customer_phone: '(82) 99667-6468',
        customer_cpf: '120.410.904-48',
        shipping_street: 'rua sao benetito',
        shipping_number: '211',
        shipping_complement: '',
        shipping_neighborhood: 'São Paulo',
        shipping_city: 'Maceio',
        shipping_state: 'AL',
        shipping_zip_code: '50000000'
      },
      line_items: {
        data: [
          {
            amount_total: 5000,
            quantity: 1,
            price: {
              product: 'prod_test_product',
              unit_amount: 5000
            }
          }
        ]
      }
    }
  },
  livemode: false,
  pending_webhooks: 1,
  request: {
    id: 'req_test_webhook',
    idempotency_key: null
  },
  type: 'checkout.session.completed'
};

async function testWebhook() {
  try {
    console.log('🧪 Testando webhook do Stripe...');
    
    const response = await axios.post('http://localhost:3000/api/shop/stripe/webhook', mockStripeEvent, {
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test_signature' // Em produção seria a assinatura real
      }
    });
    
    console.log('✅ Webhook processado com sucesso!');
    console.log('📊 Resposta:', response.data);
    
  } catch (error) {
    console.error('❌ Erro ao testar webhook:', error.response?.data || error.message);
  }
}

// Testar também a busca de pedidos
async function testGetOrders() {
  try {
    console.log('\n🧪 Testando busca de pedidos...');
    
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWNhc25iN3IwMDAxdTFlYWYweTVpd3QwIiwiZW1haWwiOiJtYXh3ZWxsMTIzNG1lbGxhbmllQGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzUxMTI4NDI0LCJleHAiOjE3NTE3MzMyMjR9.buB59DJrrNgQij5kVNiMX347OstPFJ5OWRgjvd76nXI';
    
    const response = await axios.get('http://localhost:3000/api/user/pedidos', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Pedidos encontrados:', response.data);
    
  } catch (error) {
    console.error('❌ Erro ao buscar pedidos:', error.response?.data || error.message);
  }
}

// Executar testes
async function runTests() {
  console.log('🚀 Iniciando testes do sistema de pedidos...\n');
  
  await testWebhook();
  await testGetOrders();
  
  console.log('\n✨ Testes concluídos!');
}

runTests(); 