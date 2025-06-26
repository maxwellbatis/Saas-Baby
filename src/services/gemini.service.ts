import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function generateGeminiContent(prompt: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Configurações para melhor qualidade de resposta
    const generationConfig = {
      temperature: 0.7, // Criatividade balanceada
      topK: 40,
      topP: 0.8,
      maxOutputTokens: 4000, // Aumentar para respostas mais completas
    };

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
    });

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Erro ao gerar conteúdo com Gemini:', error);
    throw new Error('Erro ao gerar conteúdo com IA');
  }
}

// Função especializada para gerar conteúdo de marketing
export async function generateMarketingContent(
  type: string,
  platform: string,
  targetAudience: string,
  options: {
    category?: string;
    specificTopic?: string;
    tone?: string;
    duration?: number;
    format?: string;
  } = {}
): Promise<any> {
  try {
    const { category, specificTopic, tone, duration, format } = options;
    
    // Prompt base do sistema
    const systemPrompt = `Você é um especialista em marketing digital focado no nicho de maternidade e desenvolvimento infantil.
    
    CONTEXTO DO APP:
    - Nome: Baby Diary
    - Foco: Acompanhamento do desenvolvimento de bebês
    - Funcionalidades principais: registro de marcos, memórias, atividades, IA personalizada, backup na nuvem, compartilhamento familiar
    - Diferencial: IA que entende o contexto da maternidade
    
    DIRETRIZES DE CONTEÚDO:
    - Linguagem calorosa e acolhedora
    - Foco em benefícios emocionais e práticos
    - Storytelling autêntico
    - Emojis estratégicos (não exagerar)
    - Call-to-action claro
    - Adaptação ao público-alvo específico
    
    PÚBLICOS-ALVO:
    - gestantes: Mães grávidas, primeiro filho, ansiosas, buscando preparação
    - maes_bebes: Mães com bebês 0-2 anos, foco em desenvolvimento e rotina
    - maes_criancas: Mães com crianças maiores, foco em memórias e organização
    
    PLATAFORMAS:
    - instagram: Visual, stories, reels, hashtags relevantes
    - facebook: Mais texto, grupos de mães, comunidade
    - tiktok: Vídeos curtos, tendências, música
    - whatsapp: Conversacional, grupos familiares
    - google_ads: Foco em conversão, palavras-chave`;

    let specificPrompt = '';
    
    switch (type) {
      case 'post':
        specificPrompt = `Crie um post completo para ${platform} direcionado a ${targetAudience}.
        
        ${category ? `Categoria: ${category}` : ''}
        ${specificTopic ? `Tópico específico: ${specificTopic}` : ''}
        Tom: ${tone || 'amigável e motivacional'}
        
        ESTRUTURA OBRIGATÓRIA:
        1. TÍTULO: Chamativo (máximo 60 caracteres)
        2. LEGENDA: Estrutura com hook, problema, solução, benefício, CTA
        3. HASHTAGS: 15-20 hashtags relevantes
        4. HORÁRIO: Melhor horário para postagem
        5. EMOJIS: Sugestão de emojis estratégicos
        
        Exemplo de estrutura:
        [Hook emocional]
        [Problema que as mães enfrentam]
        [Como o Baby Diary resolve]
        [Benefício específico]
        [Call-to-action]
        [Hashtags]`;
        break;
        
      case 'ad':
        specificPrompt = `Crie um anúncio completo para ${platform} direcionado a ${targetAudience}.
        
        ${category ? `Categoria: ${category}` : ''}
        ${specificTopic ? `Tópico específico: ${specificTopic}` : ''}
        
        ESTRUTURA OBRIGATÓRIA:
        1. HEADLINE PRINCIPAL: Máximo 40 caracteres
        2. HEADLINE SECUNDÁRIA: Máximo 40 caracteres
        3. COPY CURTA: Máximo 125 caracteres
        4. COPY LONGA: Máximo 500 caracteres
        5. DESCRIÇÃO: Máximo 2000 caracteres
        6. CALL-TO-ACTION: Específico
        7. INTERESSES: Para segmentação
        8. ORÇAMENTO: Sugestão diária
        9. PÚBLICO-ALVO: Detalhado`;
        break;
        
      case 'video_script':
        specificPrompt = `Crie um roteiro completo para vídeo de ${duration || 30} segundos para ${platform} direcionado a ${targetAudience}.
        
        ${category ? `Categoria: ${category}` : ''}
        ${specificTopic ? `Tópico específico: ${specificTopic}` : ''}
        
        ESTRUTURA OBRIGATÓRIA:
        1. ROTEIRO: Cenas detalhadas com tempo
        2. NARRAÇÃO: Texto para cada cena
        3. MÚSICA: Sugestão de estilo e mood
        4. HASHTAGS: Para o vídeo
        5. THUMBNAIL: Descrição do thumbnail
        6. CALL-TO-ACTION: No final
        7. ELEMENTOS VISUAIS: Sugestões
        
        Estrutura temporal:
        - Hook (0-3s)
        - Problema (3-8s)
        - Solução (8-20s)
        - Demonstração (20-25s)
        - CTA (25-30s)`;
        break;
        
      case 'argument':
        specificPrompt = `Crie um argumento de venda para ${targetAudience} sobre o Baby Diary.
        
        Categoria: ${category || 'emocional'}
        ${specificTopic ? `Tópico específico: ${specificTopic}` : ''}
        
        ESTRUTURA OBRIGATÓRIA:
        1. TÍTULO: Do argumento
        2. ARGUMENTO: Principal (máximo 300 palavras)
        3. EXEMPLOS: 3 casos de uso prático
        4. CONVERSÃO: Taxa estimada
        5. OBJEÇÕES: Comuns e respostas
        6. GATILHOS: Emocionais específicos
        
        Categorias:
        - emocional: Sentimentos, memórias, momentos especiais
        - escassez: Oferta limitada, tempo, exclusividade
        - pertencimento: Comunidade, grupo, identificação
        - racional: Benefícios práticos, ROI, funcionalidades
        - urgencia: Ação imediata, perda de oportunidade`;
        break;
        
      case 'hashtag_research':
        specificPrompt = `Faça uma pesquisa completa de hashtags para ${platform} sobre maternidade e desenvolvimento infantil.
        
        Público-alvo: ${targetAudience}
        ${specificTopic ? `Tópico específico: ${specificTopic}` : ''}
        
        ESTRUTURA OBRIGATÓRIA:
        1. HASHTAGS ALTO VOLUME: 10 hashtags (1M+ posts)
        2. HASHTAGS MÉDIO VOLUME: 10 hashtags (100K-1M posts)
        3. HASHTAGS NICHO: 10 hashtags (10K-100K posts)
        4. HASHTAGS TRENDING: 5 hashtags atuais
        5. HASHTAGS MARCA: 5 hashtags sugeridas
        6. ANÁLISE CONCORRÊNCIA: Hashtags de concorrentes
        7. ESTRATÉGIA: Sugestão de uso`;
        break;
        
      default:
        throw new Error('Tipo de conteúdo não suportado');
    }

    const fullPrompt = `${systemPrompt}\n\n${specificPrompt}`;
    const content = await generateGeminiContent(fullPrompt);
    
    // Estruturar resposta
    const response: any = {
      content,
      type,
      platform,
      targetAudience,
      metadata: {
        category,
        specificTopic,
        tone,
        duration,
        format,
        generatedAt: new Date().toISOString()
      }
    };
    
    // Adicionar campos específicos baseados no tipo
    if (type === 'post') {
      response.suggestedPostingTime = getSuggestedPostingTime(platform, targetAudience);
      response.engagementTips = getEngagementTips(platform);
    }
    
    if (type === 'ad') {
      response.targetingSuggestions = getTargetingSuggestions(platform, targetAudience);
      response.budgetRecommendation = getBudgetRecommendation(platform);
    }
    
    if (type === 'video_script') {
      response.videoTips = getVideoTips(platform);
      response.musicSuggestions = getMusicSuggestions(platform, category);
    }
    
    return response;
  } catch (error) {
    console.error('Erro ao gerar conteúdo de marketing:', error);
    throw error;
  }
}

// Funções auxiliares (mantidas do controller)
function getSuggestedPostingTime(platform: string, targetAudience: string): string {
  const times: any = {
    instagram: {
      gestantes: '19h-21h (mães relaxando após o trabalho)',
      maes_bebes: '9h-11h (bebês dormindo) ou 20h-22h (após dormir)',
      maes_criancas: '7h-9h (antes da escola) ou 18h-20h (após atividades)'
    },
    facebook: {
      gestantes: '20h-22h (tempo livre)',
      maes_bebes: '10h-12h ou 21h-23h',
      maes_criancas: '8h-10h ou 19h-21h'
    },
    tiktok: {
      gestantes: '12h-14h (almoço) ou 20h-22h',
      maes_bebes: '9h-11h ou 21h-23h',
      maes_criancas: '7h-9h ou 18h-20h'
    }
  };
  
  return times[platform]?.[targetAudience] || 'Horário não especificado';
}

function getEngagementTips(platform: string): string[] {
  const tips: any = {
    instagram: [
      'Use stories para mostrar o app em ação',
      'Responda comentários rapidamente',
      'Use reels para demonstrar funcionalidades',
      'Colabore com influenciadoras mães'
    ],
    facebook: [
      'Participe de grupos de mães',
      'Compartilhe depoimentos reais',
      'Crie posts que gerem discussão',
      'Use Facebook Live para Q&A'
    ],
    tiktok: [
      'Siga tendências atuais',
      'Use música popular',
      'Crie conteúdo educativo',
      'Colabore com criadores de conteúdo'
    ]
  };
  
  return tips[platform] || [];
}

function getTargetingSuggestions(platform: string, targetAudience: string): any {
  const suggestions: any = {
    facebook: {
      gestantes: ['Maternidade', 'Gravidez', 'Primeira vez mãe', 'Pré-natal'],
      maes_bebes: ['Desenvolvimento infantil', 'Amamentação', 'Sono do bebê', 'Pediatria'],
      maes_criancas: ['Educação infantil', 'Atividades para crianças', 'Família', 'Organização']
    },
    instagram: {
      gestantes: ['#gestante', '#primeiravez', '#maternidade', '#gravidez'],
      maes_bebes: ['#bebe', '#desenvolvimento', '#maternidade', '#familia'],
      maes_criancas: ['#criancas', '#familia', '#organizacao', '#maternidade']
    }
  };
  
  return suggestions[platform]?.[targetAudience] || [];
}

function getBudgetRecommendation(platform: string): string {
  const budgets: any = {
    facebook: 'R$ 50-200/dia para testes, R$ 200-500/dia para campanhas ativas',
    instagram: 'R$ 30-150/dia para testes, R$ 150-400/dia para campanhas ativas',
    google_ads: 'R$ 100-300/dia para testes, R$ 300-1000/dia para campanhas ativas'
  };
  
  return budgets[platform] || 'Orçamento não especificado';
}

function getVideoTips(platform: string): string[] {
  const tips: any = {
    instagram: [
      'Mantenha os primeiros 3 segundos impactantes',
      'Use transições suaves',
      'Inclua texto nas primeiras cenas',
      'Termine com call-to-action claro'
    ],
    tiktok: [
      'Siga tendências atuais',
      'Use música viral',
      'Mantenha movimento constante',
      'Use efeitos visuais'
    ],
    youtube: [
      'Hook forte nos primeiros 10 segundos',
      'Estrutura clara: problema → solução → demonstração',
      'Inclua cards e anotações',
      'Call-to-action em múltiplos momentos'
    ]
  };
  
  return tips[platform] || [];
}

function getMusicSuggestions(platform: string, category?: string): string[] {
  const suggestions: any = {
    instagram: {
      emocional: ['Música suave e acolhedora', 'Instrumental relaxante'],
      funcionalidade: ['Música energética e positiva', 'Pop otimista'],
      beneficio: ['Música motivacional', 'Rock suave']
    },
    tiktok: {
      emocional: ['Música trending emocional', 'Pop romântico'],
      funcionalidade: ['Música viral energética', 'Eletrônica positiva'],
      beneficio: ['Música motivacional trending', 'Pop dance']
    }
  };
  
  return suggestions[platform]?.[category || 'emocional'] || ['Música não especificada'];
} 