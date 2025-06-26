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

// Função para criar uma campanha com segmentação avançada
async function createSegmentedCampaign(token) {
  try {
    const campaignData = {
      name: 'Campanha para Mães de Primeira Viagem',
      type: 'email',
      subject: 'Dicas especiais para você, mamãe de primeira viagem!',
      content: 'Olá! Como mãe de primeira viagem, sabemos que você tem muitas dúvidas. Aqui estão algumas dicas especiais para você...',
      segment: 'primeira_vez',
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Amanhã
      // Segmentação avançada
      babyAgeMin: 0,
      babyAgeMax: 6,
      motherType: 'primeira_vez',
      planType: 'básico',
      engagement: 'ativa',
      hasMultipleBabies: false,
      isPremium: false,
      isVerified: true,
      totalMemories: 5,
      totalActivities: 10
    };

    const response = await axios.post(`${API_BASE}/admin/marketing/campaigns`, campaignData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Campanha criada:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Erro ao criar campanha:', error.response?.data || error.message);
    throw error;
  }
}

// Função para obter estatísticas de segmentação
async function getSegmentationStats(token) {
  try {
    const response = await axios.get(`${API_BASE}/admin/marketing/segmentation/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('📊 Estatísticas de Segmentação:');
    console.log('Idade dos Bebês:', response.data.data.babyAgeStats);
    console.log('Tipo de Mãe:', response.data.data.motherTypeStats);
    console.log('Engajamento:', response.data.data.engagementStats);
    console.log('Planos:', response.data.data.planStats);

    return response.data.data;
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error.response?.data || error.message);
    throw error;
  }
}

// Função para calcular usuários alvo
async function calculateTargetUsers(token) {
  try {
    const filters = {
      babyAgeMin: 0,
      babyAgeMax: 6,
      motherType: 'primeira_vez',
      planType: 'básico',
      engagement: 'ativa',
      hasMultipleBabies: false,
      isPremium: false,
      isVerified: true
    };

    const response = await axios.post(`${API_BASE}/admin/marketing/segmentation/target-users`, filters, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('🎯 Usuários Alvo:');
    console.log('Total encontrado:', response.data.data.totalCount);
    console.log('Primeiros 5 usuários:', response.data.data.users.slice(0, 5));

    return response.data.data;
  } catch (error) {
    console.error('Erro ao calcular usuários alvo:', error.response?.data || error.message);
    throw error;
  }
}

// Função para gerar conteúdo com IA
async function generateAIContent(token) {
  try {
    const prompt = `Crie um e-mail de marketing para mães de primeira viagem com bebês de 0-6 meses. 
    O e-mail deve ser acolhedor, oferecer dicas práticas sobre sono e alimentação, 
    e incentivar o uso do app Baby Diary. Seja caloroso e empático.`;

    const response = await axios.post(`${API_BASE}/admin/marketing/campaigns/gemini`, { prompt }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('🤖 Conteúdo gerado pela IA:');
    console.log(response.data.aiResponse);

    return response.data.aiResponse;
  } catch (error) {
    console.error('Erro ao gerar conteúdo com IA:', error.response?.data || error.message);
    throw error;
  }
}

// Função principal
async function testSegmentation() {
  try {
    console.log('🚀 Iniciando teste de segmentação avançada...\n');

    // 1. Login como admin
    console.log('1️⃣ Fazendo login como admin...');
    const token = await adminLogin();
    console.log('✅ Login realizado com sucesso\n');

    // 2. Obter estatísticas de segmentação
    console.log('2️⃣ Obtendo estatísticas de segmentação...');
    await getSegmentationStats(token);
    console.log('');

    // 3. Calcular usuários alvo
    console.log('3️⃣ Calculando usuários alvo...');
    await calculateTargetUsers(token);
    console.log('');

    // 4. Gerar conteúdo com IA
    console.log('4️⃣ Gerando conteúdo com IA...');
    await generateAIContent(token);
    console.log('');

    // 5. Criar campanha com segmentação
    console.log('5️⃣ Criando campanha com segmentação avançada...');
    await createSegmentedCampaign(token);
    console.log('');

    console.log('🎉 Teste de segmentação concluído com sucesso!');
    console.log('\n📋 Resumo do que foi testado:');
    console.log('✅ Login de admin');
    console.log('✅ Estatísticas de segmentação');
    console.log('✅ Cálculo de usuários alvo');
    console.log('✅ Geração de conteúdo com IA');
    console.log('✅ Criação de campanha com segmentação avançada');

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

// Executar o teste
testSegmentation(); 