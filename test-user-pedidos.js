const axios = require('axios');

// Token JWT válido (substitua pelo token real)
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbGllbnRfMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwIiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ4MTYwMDB9.placeholder';

async function testUserPedidos() {
  try {
    console.log('🔍 Testando rota /user/pedidos...');
    
    const response = await axios.get('http://localhost:3000/api/user/pedidos', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Resposta da API:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success && Array.isArray(response.data.data)) {
      console.log(`📦 Encontrados ${response.data.data.length} pedidos`);
      
      response.data.data.forEach((pedido, index) => {
        console.log(`\n--- Pedido ${index + 1} ---`);
        console.log('ID:', pedido.id);
        console.log('Status:', pedido.status);
        console.log('Total:', pedido.totalAmount);
        console.log('Itens:', pedido.items?.length || 0);
        console.log('Criado em:', pedido.createdAt);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar rota:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Erro:', error.message);
    }
  }
}

testUserPedidos(); 