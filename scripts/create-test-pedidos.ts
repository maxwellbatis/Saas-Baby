import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestPedidos() {
  try {
    console.log('🛒 Criando pedidos de teste...');

    // Buscar um usuário existente
    const user = await prisma.user.findFirst();
    
    if (!user) {
      console.log('❌ Nenhum usuário encontrado. Execute o seed primeiro.');
      return;
    }

    // Criar pedidos de teste
    const pedidos = [
      {
        userId: user.id,
        status: 'pending',
        amount: 1999, // R$ 19,99
        items: [
          {
            name: 'Plano Premium Mensal',
            price: 1999,
            quantity: 1
          }
        ],
        pagarmeOrderId: 'ord_test_001'
      },
      {
        userId: user.id,
        status: 'paid',
        amount: 2999, // R$ 29,99
        items: [
          {
            name: 'Plano Família Mensal',
            price: 2999,
            quantity: 1
          }
        ],
        pagarmeOrderId: 'ord_test_002'
      },
      {
        userId: user.id,
        status: 'failed',
        amount: 1999,
        items: [
          {
            name: 'Plano Premium Mensal',
            price: 1999,
            quantity: 1
          }
        ]
      },
      {
        userId: user.id,
        status: 'canceled',
        amount: 2999,
        items: [
          {
            name: 'Plano Família Mensal',
            price: 2999,
            quantity: 1
          }
        ]
      }
    ];

    for (const pedidoData of pedidos) {
      const pedido = await prisma.pedido.create({
        data: pedidoData
      });
      console.log(`✅ Pedido criado: ${pedido.id} - Status: ${pedido.status}`);
    }

    console.log('🎉 Pedidos de teste criados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao criar pedidos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestPedidos(); 