import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

interface AIRequest {
  model: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
}

interface AIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class AIService {
  private readonly baseUrl: string = 'https://api.groq.com/openai/v1/chat/completions';

  constructor() {
    // Não inicializa mais apiKey aqui
  }

  private async getGroqApiKey(): Promise<string> {
    // Busca chave do banco primeiro, depois do .env
    const config = await prisma.integrationConfig.findUnique({ where: { key: 'GROQ_API_KEY' } });
    const apiKey = config?.value || process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY não configurada');
    }
    return apiKey;
  }

  private async makeRequest(request: AIRequest): Promise<AIResponse> {
    try {
      const apiKey = await this.getGroqApiKey();
      const response = await axios.post(this.baseUrl, request, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        timeout: 30000, // 30 segundos
      });
      return response.data;
    } catch (error) {
      console.error('Erro na requisição para Groq:', error);
      throw new Error('Falha na comunicação com a IA');
    }
  }

  private async logInteraction(
    userId: string,
    type: string,
    input: any,
    output: any,
    model: string,
    tokensUsed?: number,
    cost?: number
  ) {
    try {
      await prisma.aIInteraction.create({
        data: {
          userId,
          type,
          input,
          output,
          model,
          tokensUsed,
          cost,
        },
      });
    } catch (error) {
      console.error('Erro ao logar interação com IA:', error);
    }
  }

  async analyzeSleepPattern(userId: string, sleepData: any) {
    try {
      const prompt = `Analise o padrão de sono do bebê ${sleepData.babyName || 'do bebê'} (${sleepData.babyAge} meses):

Dados de sono dos últimos dias:
- Tempo médio de sono: ${sleepData.averageSleepTime} minutos
- Total de registros: ${sleepData.sleepCount}
- Qualidade do sono: ${JSON.stringify(sleepData.qualityCounts)}

Forneça:
1. Análise do padrão atual
2. Recomendações para melhorar a qualidade do sono
3. Horários sugeridos baseados na idade
4. Sinais de alerta se houver

Responda em português brasileiro de forma clara e acolhedora.`;

      const response = await this.makeRequest({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em desenvolvimento infantil e padrões de sono de bebês. Forneça conselhos práticos e acolhedores.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      if (!response.choices || !response.choices[0] || !response.choices[0].message) {
        throw new Error('Resposta inválida da IA');
      }

      const analysis = response.choices[0].message.content;

      // Extrair recomendações
      const recommendations = this.extractRecommendations(analysis);

      await this.logInteraction(userId, 'sleep_analysis', sleepData, { analysis, recommendations }, 'llama-3.3-70b-versatile', response.usage?.total_tokens);

      return {
        analysis,
        recommendations,
        metrics: {
          averageSleepTime: sleepData.averageSleepTime,
          sleepCount: sleepData.sleepCount,
          qualityDistribution: sleepData.qualityCounts
        }
      };
    } catch (error) {
      console.error('Erro na análise de sono:', error);
      return {
        analysis: 'Não foi possível analisar o padrão de sono no momento. Tente novamente mais tarde.',
        recommendations: ['Mantenha um registro consistente do sono do bebê', 'Observe os horários de maior tranquilidade'],
        metrics: sleepData
      };
    }
  }

  async getFeedingTips(userId: string, feedingData: any) {
    try {
      const prompt = `Forneça dicas de alimentação para ${feedingData.babyName || 'o bebê'} (${feedingData.babyAge} meses):

Dados de alimentação:
- Total de mamadas/refeições: ${feedingData.totalFeedings}
- Intervalo médio: ${feedingData.averageInterval} minutos
- Pergunta específica: ${feedingData.question}

Forneça:
1. Dicas práticas para a idade
2. Sinais de fome e saciedade
3. Introdução alimentar se aplicável
4. Próximos passos recomendados

Responda em português brasileiro de forma acolhedora e prática.`;

      const response = await this.makeRequest({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em nutrição infantil e alimentação de bebês. Forneça conselhos práticos e seguros.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      if (!response.choices || !response.choices[0] || !response.choices[0].message) {
        throw new Error('Resposta inválida da IA');
      }

      const tips = response.choices[0].message.content;

      // Extrair próximos passos
      const nextSteps = this.extractNextSteps(tips);

      await this.logInteraction(userId, 'feeding_tips', feedingData, { tips, nextSteps }, 'llama-3.3-70b-versatile', response.usage?.total_tokens);

      return {
        tips,
        nextSteps,
        context: {
          babyAge: feedingData.babyAge,
          totalFeedings: feedingData.totalFeedings
        }
      };
    } catch (error) {
      console.error('Erro ao obter dicas de alimentação:', error);
      return {
        tips: 'Não foi possível gerar dicas de alimentação no momento. Consulte um pediatra para orientações específicas.',
        nextSteps: ['Mantenha um registro das refeições', 'Observe as reações do bebê aos alimentos'],
        context: feedingData
      };
    }
  }

  async predictMilestones(userId: string, babyData: any) {
    try {
      const achievedMilestones = babyData.achievedMilestones?.map((m: any) => m.title).join(', ') || 'Nenhum marco registrado ainda';

      const prompt = `Preveja os próximos marcos de desenvolvimento para ${babyData.babyName || 'o bebê'} (${babyData.babyAge} meses, ${babyData.gender || 'sexo não informado'}):

Marcos já alcançados: ${achievedMilestones}

Forneça:
1. Próximos marcos esperados para os próximos 3 meses
2. Timeline de desenvolvimento
3. Sinais a observar
4. Atividades para estimular o desenvolvimento

Responda em português brasileiro de forma clara e organizada.`;

      const response = await this.makeRequest({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em desenvolvimento infantil e marcos de desenvolvimento. Forneça previsões baseadas em evidências científicas.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1200
      });

      if (!response.choices || !response.choices[0] || !response.choices[0].message) {
        throw new Error('Resposta inválida da IA');
      }

      const predictions = response.choices[0].message.content;

      // Extrair timeline
      const timeline = this.extractTimeline(predictions);

      await this.logInteraction(userId, 'milestone_prediction', babyData, { predictions, timeline }, 'llama-3.3-70b-versatile', response.usage?.total_tokens);

      return {
        predictions,
        timeline,
        context: {
          babyAge: babyData.babyAge,
          achievedMilestones: babyData.achievedMilestones?.length || 0
        }
      };
    } catch (error) {
      console.error('Erro na previsão de marcos:', error);
      return {
        predictions: 'Não foi possível prever marcos no momento. Consulte um pediatra para acompanhamento do desenvolvimento.',
        timeline: {},
        context: babyData
      };
    }
  }

  async interpretCry(userId: string, cryData: any) {
    try {
      const prompt = `Interprete o choro do bebê ${cryData.babyName || ''} (${cryData.babyAge} meses):

Dados do choro: ${JSON.stringify(cryData.cryData)}

Contexto recente:
- Última alimentação: ${cryData.lastFeeding ? 'Sim' : 'Não'}
- Último sono: ${cryData.lastSleep ? 'Sim' : 'Não'}
- Última troca: ${cryData.lastDiaper ? 'Sim' : 'Não'}

Forneça:
1. Possíveis causas do choro
2. Nível de urgência (baixo, médio, alto)
3. Ações recomendadas
4. Sinais de alerta

Responda em português brasileiro de forma clara e acolhedora.`;

      const response = await this.makeRequest({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em comportamento infantil e interpretação de choro de bebês. Forneça orientações práticas e acolhedoras.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      });

      if (!response.choices || !response.choices[0] || !response.choices[0].message) {
        throw new Error('Resposta inválida da IA');
      }

      const interpretation = response.choices[0].message.content;

      // Avaliar urgência
      const urgency = this.assessUrgency(interpretation);

      await this.logInteraction(userId, 'cry_interpretation', cryData, { interpretation, urgency }, 'llama-3.3-70b-versatile', response.usage?.total_tokens);

      return {
        interpretation,
        urgency,
        context: {
          babyAge: cryData.babyAge,
          timeOfDay: new Date().toLocaleTimeString()
        }
      };
    } catch (error) {
      console.error('Erro na interpretação do choro:', error);
      return {
        interpretation: 'Não foi possível interpretar o choro no momento. Se o choro persistir ou houver outros sintomas, consulte um pediatra.',
        urgency: 'medium',
        context: cryData
      };
    }
  }

  async getPersonalizedAdvice(userId: string, question: string, context: any) {
    try {
      const prompt = `Forneça conselho personalizado para a seguinte pergunta sobre ${context.baby?.name || 'o bebê'}:

Pergunta: ${question}

Contexto:
- Idade do bebê: ${context.baby ? Math.floor((Date.now() - new Date(context.baby.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 30)) : 'Não informada'} meses
- Plano do usuário: ${context.plan?.name || 'Básico'}
- Atividades recentes: ${context.baby?.activities?.length || 0}
- Marcos alcançados: ${context.baby?.milestones?.length || 0}

Forneça:
1. Resposta direta à pergunta
2. Conselhos práticos baseados no contexto
3. Recursos adicionais se aplicável
4. Sinais de alerta se necessário

Responda em português brasileiro de forma acolhedora e profissional.`;

      const response = await this.makeRequest({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em desenvolvimento infantil e cuidados com bebês. Forneça conselhos personalizados e acolhedores.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      if (!response.choices || !response.choices[0] || !response.choices[0].message) {
        throw new Error('Resposta inválida da IA');
      }

      const advice = response.choices[0].message.content;

      await this.logInteraction(userId, 'personalized_advice', { question, context }, { advice }, 'llama-3.3-70b-versatile', response.usage?.total_tokens);

      return {
        advice,
        context: {
          question,
          babyAge: context.baby ? Math.floor((Date.now() - new Date(context.baby.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 30)) : null
        }
      };
    } catch (error) {
      console.error('Erro ao obter conselho personalizado:', error);
      return {
        advice: 'Não foi possível gerar conselho personalizado no momento. Consulte um pediatra para orientações específicas.',
        context: { question }
      };
    }
  }

  private extractRecommendations(analysis: string): string[] {
    const recommendations = analysis.match(/\d+\.\s*(.+?)(?=\d+\.|$)/g);
    return recommendations ? recommendations.map(r => r.replace(/^\d+\.\s*/, '').trim()) : [];
  }

  private extractNextSteps(tips: string): string[] {
    const steps = tips.match(/próximos? passos?[:\s]+(.+?)(?=\n|$)/i);
    return steps && steps[1] ? [steps[1].trim()] : [];
  }

  private extractTimeline(predictions: string): any {
    const timeline: Record<string, string> = {};
    const monthMatches = predictions.match(/(\d+)\s*meses?[:\s]+(.+?)(?=\d+\s*meses?|$)/g);
    
    if (monthMatches) {
      monthMatches.forEach(match => {
        const month = match.match(/(\d+)/);
        if (month && month[1]) {
          const age = month[1];
          timeline[age] = 'Marcos esperados';
        }
      });
    }
    
    return timeline;
  }

  private assessUrgency(interpretation: string): 'low' | 'medium' | 'high' {
    const urgentKeywords = ['emergência', 'urgente', 'imediatamente', 'hospital', 'médico'];
    const mediumKeywords = ['observar', 'atenção', 'cuidado', 'monitorar'];
    
    const lowerInterpretation = interpretation.toLowerCase();
    
    if (urgentKeywords.some(keyword => lowerInterpretation.includes(keyword))) {
      return 'high';
    } else if (mediumKeywords.some(keyword => lowerInterpretation.includes(keyword))) {
      return 'medium';
    }
    
    return 'low';
  }

  // Método para obter estatísticas de uso da IA
  async getAIUsageStats(userId: string) {
    try {
      const interactions = await prisma.aIInteraction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 100
      });

      const stats = {
        totalInteractions: interactions.length,
        totalTokens: interactions.reduce((sum, i) => sum + (i.tokensUsed || 0), 0),
        byType: {} as Record<string, number>,
        recentUsage: interactions.slice(0, 10)
      };

      interactions.forEach(interaction => {
        stats.byType[interaction.type] = (stats.byType[interaction.type] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Erro ao obter estatísticas de IA:', error);
      throw new Error('Não foi possível obter estatísticas de uso');
    }
  }

  // Chat com IA
  async chat(userId: string, message: string, context: any) {
    try {
      const prompt = `Você é uma assistente virtual especializada em desenvolvimento infantil, chamada "BabyDiary Assistant". 

Contexto:
- Nome do usuário: ${context.userName}
- Nome do bebê: ${context.babyName}
- Idade do bebê: ${context.babyAge} meses
- Gênero: ${context.babyGender}

Mensagem do usuário: "${message}"

Responda de forma acolhedora, profissional e útil. Seja específica sobre a idade do bebê e forneça conselhos práticos. Não repita a mensagem do usuário, mas responda à pergunta ou preocupação apresentada.

Responda em português brasileiro de forma clara e direta.`;

      const response = await this.makeRequest({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Você é uma assistente virtual especializada em desenvolvimento infantil, chamada "BabyDiary Assistant". Forneça conselhos práticos, acolhedores e baseados em evidências científicas.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      });

      if (!response.choices || !response.choices[0] || !response.choices[0].message) {
        throw new Error('Resposta inválida da IA');
      }

      const aiResponse = response.choices[0].message.content;

      await this.logInteraction(userId, 'chat', { message, context }, { response: aiResponse }, 'llama-3.3-70b-versatile', response.usage?.total_tokens);

      return aiResponse;
    } catch (error) {
      console.error('Erro no chat com IA:', error);
      return 'Desculpe, não consegui processar sua mensagem no momento. Tente novamente mais tarde.';
    }
  }
}

export default new AIService(); 