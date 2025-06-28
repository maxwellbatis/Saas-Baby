const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestOrder() {
  try {
    console.log('🧪 Criando pedido de teste...');
    
    const testOrder = await prisma.pedido.create({
      data: {
        userId: 'cmcasnb7r0001u1eaf0y5iwt0',
        status: 'paid',
        paymentMethod: 'stripe',
        paymentId: 'pi_test_payment_123',
        totalAmount: 50.00,
        customerInfo: {
          name: 'Maxwell Batista',
          email: 'maxwell1234mellanie@gmail.com',
          phone: '(82) 99667-6468',
          cpf: '120.410.904-48'
        },
        shippingAddress: {
          street: 'rua sao benetito',
          number: '211',
          complement: '',
          neighborhood: 'São Paulo',
          city: 'Maceio',
          state: 'AL',
          zipCode: '50000000'
        },
        items: [
          {
            productId: 5,
            name: 'Produto Teste',
            quantity: 1,
            price: 50.00
          }
        ],
        metadata: {
          stripe_session_id: 'cs_test_b1soMGVTwQaeXn2nJhTDXjQlGooYvF2pa5iFsAiMiIh3sAaS4z5cKe9vl0',
          source: 'stripe'
        }
      }
    });
    
    console.log('✅ Pedido de teste criado com sucesso!');
    console.log('📊 ID do pedido:', testOrder.id);
    console.log('💰 Valor:', testOrder.totalAmount);
    console.log('📦 Status:', testOrder.status);
    
    return testOrder;
    
  } catch (error) {
    console.error('❌ Erro ao criar pedido de teste:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createTestOrder(); 