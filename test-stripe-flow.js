const axios = require('axios');

// Novo token JWT fornecido pelo usuário
const VALID_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWNhc25iN3IwMDAxdTFlYWYweTVpd3QwIiwiZW1haWwiOiJtYXh3ZWxsMTIzNG1lbGxhbmllQGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzUxMTM3ODg4LCJleHAiOjE3NTE3NDI2ODh9.Iy41SR_6FDycieDUCZ1-VX70RG5tHTy5Se_0x8G5K5E';

async function testStripeFlow() {
  console.log('🧪 Testando fluxo completo do Stripe...');
  
  try {
    // 1. Criar pedido
    console.log('📦 Criando pedido...');
    const orderData = {
      items: [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 1 }
      ],
      customerInfo: {
        name: 'Maxwell Teste',
        email: 'maxwell1234mellanie@gmail.com',
        phone: '11999999999',
        cpf: '12345678901'
      },
      shippingAddress: {
        street: 'Rua Teste',
        number: '123',
        complement: 'Apto 1',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567'
      }
    };

    const response = await axios.post('http://localhost:3000/api/shop/stripe/create-order', orderData, {
      headers: {
        'Authorization': `Bearer ${VALID_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Pedido criado com sucesso!');
    console.log('📋 Dados da resposta:', response.data);

    if (response.data.success && response.data.data?.url) {
      console.log('🔗 URL do Stripe:', response.data.data.url);
      console.log('💡 Para testar o pagamento, acesse a URL acima');
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message || error);
  }
}

testStripeFlow();

process.on('unhandledRejection', (reason, p) => {
  console.error('❌ Erro não tratado:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('❌ Exceção não capturada:', err);
}); 