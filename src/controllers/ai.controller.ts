import { Request, Response } from 'express';
import { AIService } from '../services/ai.service';
import prisma from '../config/database';

const aiService = new AIService();

export class AIController {
  
  // Análise de padrões de sono
  async analyzeSleepPattern(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado'
        });
      }

      const { babyId, days = 7 } = req.body;

      if (!babyId) {
        return res.status(400).json({
          success: false,
          error: 'ID do bebê é obrigatório'
        });
      }

      // Buscar dados de sono do bebê
      const sleepRecords = await prisma.sleepRecord.findMany({
        where: {
          babyId,
          createdAt: {
            gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (sleepRecords.length === 0) {
        return res.json({
          success: true,
          data: {
            message: 'Nenhum registro de sono encontrado para análise',
            recommendations: ['Registre alguns dias de sono para receber análises personalizadas']
          }
        });
      }

      // Calcular estatísticas básicas
      const totalSleepTime = sleepRecords.reduce((sum, record) => sum + (record.duration || 0), 0);
      const averageSleepTime = totalSleepTime / sleepRecords.length;
      const sleepCount = sleepRecords.length;

      // Analisar qualidade do sono
      const qualityCounts: Record<string, number> = {};
      let best = 'good';

      sleepRecords.forEach(record => {
        const quality = record.quality || 'unknown';
        qualityCounts[quality] = (qualityCounts[quality] || 0) + 1;
        
        if (qualityCounts[quality] && qualityCounts[quality] > (qualityCounts[best] || 0)) {
          best = quality;
        }
      });

      // Buscar dados do bebê para contexto
      const baby = await prisma.baby.findUnique({
        where: { id: babyId }
      });

      if (!baby) {
        return res.status(404).json({
          success: false,
          error: 'Bebê não encontrado'
        });
      }

      // Calcular idade em meses
      const ageInMonths = Math.floor((Date.now() - baby.birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

      // Usar IA para análise
      const analysis = await aiService.analyzeSleepPattern(userId, {
        sleepRecords,
        babyAge: ageInMonths,
        averageSleepTime,
        sleepCount,
        qualityCounts,
        babyName: baby.name
      });

      return res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      console.error('Erro ao analisar padrão de sono:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Dicas de alimentação personalizadas
  async getFeedingTips(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado'
        });
      }

      const { babyId, question } = req.body;

      if (!babyId) {
        return res.status(400).json({
          success: false,
          error: 'ID do bebê é obrigatório'
        });
      }

      // Buscar dados de alimentação do bebê
      const feedingRecords = await prisma.feedingRecord.findMany({
        where: {
          babyId,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 dias
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Buscar dados do bebê
      const baby = await prisma.baby.findUnique({
        where: { id: babyId }
      });

      if (!baby) {
        return res.status(404).json({
          success: false,
          error: 'Bebê não encontrado'
        });
      }

      // Calcular idade em meses
      const ageInMonths = Math.floor((Date.now() - baby.birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

      // Calcular estatísticas de alimentação
      const totalFeedings = feedingRecords.length;
      let averageInterval = 0;
      
      if (totalFeedings > 1) {
        const firstRecord = feedingRecords[0];
        const lastRecord = feedingRecords[feedingRecords.length - 1];
        
        if (firstRecord && lastRecord && firstRecord.createdAt && lastRecord.createdAt) {
          averageInterval = (firstRecord.createdAt.getTime() - lastRecord.createdAt.getTime()) / (totalFeedings - 1) / (1000 * 60);
        }
      }

      // Usar IA para dicas de alimentação
      const tips = await aiService.getFeedingTips(userId, {
        feedingRecords,
        babyAge: ageInMonths,
        totalFeedings,
        averageInterval,
        babyName: baby.name,
        question: question || 'Como melhorar a alimentação do meu bebê?'
      });

      return res.json({
        success: true,
        data: tips
      });
    } catch (error) {
      console.error('Erro ao buscar dicas de alimentação:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Previsão de marcos de desenvolvimento
  async predictMilestones(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado'
        });
      }

      const { babyId } = req.body;

      if (!babyId) {
        return res.status(400).json({
          success: false,
          error: 'ID do bebê é obrigatório'
        });
      }

      // Buscar dados do bebê
      const baby = await prisma.baby.findUnique({
        where: { id: babyId }
      });

      if (!baby) {
        return res.status(404).json({
          success: false,
          error: 'Bebê não encontrado'
        });
      }

      // Buscar marcos já alcançados
      const achievedMilestones = await prisma.milestone.findMany({
        where: { babyId },
        orderBy: { date: 'desc' }
      });

      // Calcular idade em meses
      const ageInMonths = Math.floor((Date.now() - baby.birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

      // Usar IA para prever próximos marcos
      const predictions = await aiService.predictMilestones(userId, {
        babyAge: ageInMonths,
        achievedMilestones,
        babyName: baby.name,
        gender: baby.gender
      });

      return res.json({
        success: true,
        data: predictions
      });
    } catch (error) {
      console.error('Erro ao prever marcos:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Interpretação de choro
  async interpretCry(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado'
        });
      }

      const { babyId, cryData } = req.body;

      if (!babyId || !cryData) {
        return res.status(400).json({
          success: false,
          error: 'ID do bebê e dados do choro são obrigatórios'
        });
      }

      // Buscar dados do bebê
      const baby = await prisma.baby.findUnique({
        where: { id: babyId }
      });

      if (!baby) {
        return res.status(404).json({
          success: false,
          error: 'Bebê não encontrado'
        });
      }

      // Buscar contexto recente (últimas atividades)
      const recentActivities = await prisma.activity.findMany({
        where: {
          babyId,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24h
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      // Usar IA para interpretar o choro
      const interpretation = await aiService.interpretCry(userId, {
        cryData,
        babyAge: Math.floor((Date.now() - baby.birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30)),
        babyName: baby.name,
        recentActivities,
        lastFeeding: recentActivities.find(a => a.type === 'feeding'),
        lastSleep: recentActivities.find(a => a.type === 'sleep'),
        lastDiaper: recentActivities.find(a => a.type === 'diaper')
      });

      return res.json({
        success: true,
        data: interpretation
      });
    } catch (error) {
      console.error('Erro ao interpretar choro:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Conselhos personalizados
  async getPersonalizedAdvice(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado'
        });
      }

      const { question, babyId } = req.body;

      if (!question) {
        return res.status(400).json({
          success: false,
          error: 'Pergunta é obrigatória'
        });
      }

      // Buscar contexto do usuário e bebê
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          babies: true,
          subscription: {
            include: { plan: true }
          }
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }

      // Buscar dados do bebê se especificado
      let babyData = null;
      if (babyId) {
        babyData = await prisma.baby.findUnique({
          where: { id: babyId },
          include: {
            activities: {
              orderBy: { createdAt: 'desc' },
              take: 20
            },
            milestones: {
              orderBy: { date: 'desc' },
              take: 10
            }
          }
        });
      }

      // Usar IA para conselho personalizado
      const advice = await aiService.getPersonalizedAdvice(userId, question, {
        user,
        baby: babyData,
        plan: user.subscription?.plan
      });

      return res.json({
        success: true,
        data: advice
      });
    } catch (error) {
      console.error('Erro ao buscar conselho personalizado:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Estatísticas de uso da IA
  async getAIUsageStats(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado'
        });
      }

      // Buscar estatísticas de uso da IA
      const stats = await aiService.getAIUsageStats(userId);

      // Buscar interações recentes
      const recentInteractions = await prisma.aIInteraction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      // Calcular custos por tipo
      const costsByType = recentInteractions.reduce((acc, interaction) => {
        const type = interaction.type;
        acc[type] = (acc[type] || 0) + (interaction.cost || 0);
        return acc;
      }, {} as Record<string, number>);

      // Ordenar por custo
      const sortedCosts = Object.entries(costsByType)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .map(([type, cost]) => ({ type, cost }));

      return res.json({
        success: true,
        data: {
          ...stats,
          recentInteractions,
          costsByType: sortedCosts
        }
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas de IA:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Alertas inteligentes de saúde
  async getHealthAlerts(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
      }
      const { babyId } = req.query;
      if (!babyId) {
        return res.status(400).json({ success: false, error: 'ID do bebê é obrigatório' });
      }
      // Buscar usuário para obter o nome
      const user = await prisma.user.findUnique({ where: { id: userId } });
      // Buscar dados do bebê
      const baby = await prisma.baby.findUnique({ where: { id: String(babyId) } });
      if (!baby) {
        return res.status(404).json({ success: false, error: 'Bebê não encontrado' });
      }
      // Buscar dados de saúde
      const [vaccines, appointments, symptoms, medications] = await Promise.all([
        prisma.vaccinationRecord.findMany({ where: { babyId: String(babyId) }, orderBy: { date: 'desc' } }),
        prisma.appointmentRecord.findMany({ where: { babyId: String(babyId) }, orderBy: { date: 'desc' } }),
        prisma.symptomRecord.findMany({ where: { babyId: String(babyId) }, orderBy: { startDate: 'desc' } }),
        prisma.medicationRecord.findMany({ where: { babyId: String(babyId) }, orderBy: { startDate: 'desc' } }),
      ]);
      // Montar prompt para IA
      const prompt = `Considere o histórico de saúde do bebê abaixo e sugira alertas importantes, lembretes e recomendações para os pais. Seja objetivo e prático. Dados:
- Vacinas: ${vaccines.map((v: any) => `${v.name} (data: ${v.date.toLocaleDateString('pt-BR')}${v.nextDueDate ? ', próxima: ' + v.nextDueDate.toLocaleDateString('pt-BR') : ''})`).join('; ')}
- Consultas: ${appointments.map((a: any) => `${a.specialty} em ${a.date.toLocaleDateString('pt-BR')}${a.doctor ? ', Dr(a): ' + a.doctor : ''}`).join('; ')}
- Sintomas: ${symptoms.map((s: any) => `${s.description} (${s.intensity || ''}, início: ${s.startDate.toLocaleDateString('pt-BR')})`).join('; ')}
- Medicamentos: ${medications.map((m: any) => `${m.name} (${m.dosage}, início: ${m.startDate.toLocaleDateString('pt-BR')})`).join('; ')}

Responda em tópicos, em português brasileiro.`;
      // Chamar IA
      const aiResponse = await aiService.chat(userId, prompt, {
        userName: user?.name || '',
        babyName: baby.name,
        babyAge: Math.floor((Date.now() - baby.birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30)),
        babyGender: baby.gender === 'male' ? 'Menino' : 'Menina'
      });
      // Extrair alertas (cada linha ou tópico)
      const alerts = aiResponse.split(/\n|\r/).filter(line => line.trim().length > 0);
      return res.json({ success: true, data: alerts });
    } catch (error) {
      console.error('Erro ao gerar alertas inteligentes:', error);
      return res.status(500).json({ success: false, error: 'Erro ao gerar alertas inteligentes' });
    }
  }
}

export default new AIController(); 