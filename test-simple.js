const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

// Função para fazer login como admin
async function adminLogin() {
  try {
    const response = await axios.post(`${API_BASE}/auth/admin/login`, {
      email: 'admin@microsaas.com',
      password: 'admin123'
    });
    return response.data.data.token;
  } catch (error) {
    console.error('Erro no login:', error.response?.data || error.message);
    throw error;
  }
}

// Função para listar campanhas
async function listCampaigns(token) {
  try {
    const response = await axios.get(`${API_BASE}/admin/marketing/campaigns`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Campanhas listadas:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao listar campanhas:', error.response?.data || error.message);
    throw error;
  }
}

// Função para criar uma campanha simples
async function createSimpleCampaign(token) {
  try {
    const campaignData = {
      name: 'Teste de Campanha',
      type: 'email',
      content: 'Conteúdo de teste',
      subject: 'Assunto de teste',
      segment: 'teste'
    };

    const response = await axios.post(`${API_BASE}/admin/marketing/campaigns`, campaignData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Campanha criada:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar campanha:', error.response?.data || error.message);
    throw error;
  }
}

// Função principal
async function testSimple() {
  try {
    console.log('🚀 Iniciando teste simples...\n');

    // 1. Login como admin
    console.log('1️⃣ Fazendo login como admin...');
    const token = await adminLogin();
    console.log('✅ Login realizado com sucesso\n');

    // 2. Listar campanhas
    console.log('2️⃣ Listando campanhas...');
    await listCampaigns(token);
    console.log('');

    // 3. Criar campanha simples
    console.log('3️⃣ Criando campanha simples...');
    await createSimpleCampaign(token);
    console.log('');

    console.log('🎉 Teste simples concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

// Executar o teste
testSimple(); 