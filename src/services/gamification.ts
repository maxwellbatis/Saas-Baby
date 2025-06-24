import { GamificationRule, Gamification, WeeklyChallenge, AIReward, GamificationRanking } from '@/types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface GamificationResult {
  points: number;
  level: number;
  badges: string[];
  newBadges: string[];
  achievements: string[];
  streaks: Record<string, number>;
  totalActivities: number;
  totalMemories: number;
  totalMilestones: number;
  dailyProgress: number;
  levelUp: boolean;
}

export interface ChallengeProgress {
  challengeId: string;
  progress: number;
  goal: number;
  isCompleted: boolean;
  reward: string;
}

export class GamificationService {
  /**
   * Calcula o nível baseado nos pontos
   */
  static calculateLevel(points: number): number {
    // Fórmula melhorada: nível = floor(pontos / 150) + 1
    return Math.floor(points / 150) + 1;
  }

  /**
   * Calcula pontos necessários para o próximo nível
   */
  static getNextLevelPoints(currentLevel: number): number {
    return currentLevel * 150;
  }

  /**
   * Verifica se o usuário conquistou um novo badge
   */
  static checkBadgeEligibility(
    currentBadges: string[],
    points: number,
    level: number,
    streaks: Record<string, number> = {},
    totalActivities: number = 0,
    totalMemories: number = 0,
    totalMilestones: number = 0
  ): string[] {
    const newBadges: string[] = [];
    
    const badgeRules = [
      { id: 'first-memory', condition: () => totalMemories >= 1 },
      { id: 'memory-master', condition: () => totalMemories >= 50 },
      { id: 'week-streak', condition: () => (streaks.login || 0) >= 7 },
      { id: 'month-streak', condition: () => (streaks.login || 0) >= 30 },
      { id: 'milestone-master', condition: () => totalMilestones >= 10 },
      { id: 'milestone-legend', condition: () => totalMilestones >= 25 },
      { id: 'consistency-queen', condition: () => (streaks.login || 0) >= 90 },
      { id: 'baby-whisperer', condition: () => totalActivities >= 100 },
      { id: 'heart-warrior', condition: () => level >= 5 },
      { id: 'star-collector', condition: () => currentBadges.length >= 5 },
      { id: 'level_5', condition: () => level >= 5 },
      { id: 'level_10', condition: () => level >= 10 },
      { id: 'points_500', condition: () => points >= 500 },
      { id: 'points_1000', condition: () => points >= 1000 },
      { id: 'points_2000', condition: () => points >= 2000 },
    ];

    for (const badge of badgeRules) {
      if (!currentBadges.includes(badge.id) && badge.condition()) {
        newBadges.push(badge.id);
      }
    }

    return newBadges;
  }

  /**
   * Verifica conquistas especiais
   */
  static checkAchievements(
    currentAchievements: string[],
    points: number,
    level: number,
    totalActivities: number,
    totalMemories: number
  ): string[] {
    const newAchievements: string[] = [];
    
    const achievementRules = [
      { id: 'Primeira Memória', condition: () => totalMemories >= 1 },
      { id: 'Semana Consistente', condition: () => level >= 2 },
      { id: 'Mestre dos Marcos', condition: () => level >= 5 },
      { id: 'Colecionadora de Estrelas', condition: () => points >= 1000 },
      { id: 'Rainha da Consistência', condition: () => level >= 10 },
    ];

    for (const achievement of achievementRules) {
      if (!currentAchievements.includes(achievement.id) && achievement.condition()) {
        newAchievements.push(achievement.id);
      }
    }

    return newAchievements;
  }

  /**
   * Aplica uma regra de gamificação
   */
  static applyRule(
    currentGamification: Gamification,
    rule: GamificationRule
  ): GamificationResult {
    const newPoints = currentGamification.points + rule.points;
    const newLevel = this.calculateLevel(newPoints);
    const oldLevel = currentGamification.level;
    
    // Converter badges para array de strings (IDs)
    const currentBadges = Array.isArray(currentGamification.badges) 
      ? currentGamification.badges.map((badge: any) => typeof badge === 'string' ? badge : badge.id)
      : [];
      
    const newBadges = this.checkBadgeEligibility(
      currentBadges,
      newPoints,
      newLevel,
      currentGamification.streaks,
      currentGamification.totalActivities,
      currentGamification.totalMemories,
      currentGamification.totalMilestones
    );

    const allBadges = [...currentBadges, ...newBadges];

    // Verificar conquistas
    const currentAchievements = Array.isArray(currentGamification.achievements) 
      ? currentGamification.achievements 
      : [];
      
    const newAchievements = this.checkAchievements(
      currentAchievements,
      newPoints,
      newLevel,
      currentGamification.totalActivities,
      currentGamification.totalMemories
    );

    const allAchievements = [...currentAchievements, ...newAchievements];

    return {
      points: newPoints,
      level: newLevel,
      badges: allBadges,
      newBadges,
      achievements: allAchievements,
      streaks: currentGamification.streaks,
      totalActivities: currentGamification.totalActivities,
      totalMemories: currentGamification.totalMemories,
      totalMilestones: currentGamification.totalMilestones,
      dailyProgress: currentGamification.dailyProgress,
      levelUp: newLevel > oldLevel,
    };
  }

  /**
   * Calcula pontos por atividade
   */
  static calculateActivityPoints(activityType: string): number {
    const pointsMap: Record<string, number> = {
      login: 5,
      register: 50,
      baby_added: 25,
      memory_created: 10,
      milestone_achieved: 30,
      photo_uploaded: 15,
      streak_day: 2,
      activity_recorded: 8,
      growth_recorded: 12,
      sleep_recorded: 6,
      feeding_recorded: 6,
      diaper_recorded: 4,
      weight_recorded: 10,
      vaccination_recorded: 20,
      challenge_completed: 50,
      weekly_goal_met: 25,
    };

    return pointsMap[activityType] || 0;
  }

  /**
   * Verifica e atualiza streaks
   */
  static updateStreaks(
    currentStreaks: Record<string, number>,
    activityType: string,
    lastActivityDate?: Date
  ): Record<string, number> {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const newStreaks = { ...currentStreaks };
    
    if (activityType === 'login') {
      if (!lastActivityDate) {
        newStreaks.login = 1;
      } else {
        const lastDate = new Date(lastActivityDate);
        const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
          // Mesmo dia, mantém o streak
          newStreaks.login = newStreaks.login || 1;
        } else if (diffDays === 1) {
          // Dia seguinte, incrementa o streak
          newStreaks.login = (newStreaks.login || 0) + 1;
        } else {
          // Streak quebrado, reinicia
          newStreaks.login = 1;
        }
      }
    } else {
      // Para outras atividades, incrementa o streak
      newStreaks[activityType] = (newStreaks[activityType] || 0) + 1;
    }

    return newStreaks;
  }

  /**
   * Gera desafios semanais
   */
  static async generateWeeklyChallenges(): Promise<WeeklyChallenge[]> {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Domingo
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Sábado
    weekEnd.setHours(23, 59, 59, 999);

    const challenges: WeeklyChallenge[] = [
      {
        id: 'weekly_sleep',
        title: 'Desafio do Soninho',
        description: 'Registre o sono do bebê por 7 dias seguidos',
        icon: 'sleep',
        category: 'sleep',
        goal: 7,
        reward: 'Dica especial da IA sobre sono + 25 pontos',
        points: 25,
        isActive: true,
        weekStart,
        weekEnd,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'weekly_memory',
        title: 'Missão Memória Mágica',
        description: 'Capture 3 momentos especiais com fotos',
        icon: 'memory',
        category: 'memory',
        goal: 3,
        reward: 'Atividade personalizada para o bebê + 30 pontos',
        points: 30,
        isActive: true,
        weekStart,
        weekEnd,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'weekly_consistency',
        title: 'Semana da Super Mamãe',
        description: 'Use o app por 7 dias seguidos',
        icon: 'consistency',
        category: 'consistency',
        goal: 7,
        reward: 'Badge exclusivo + Dica de autocuidado + 50 pontos',
        points: 50,
        isActive: true,
        weekStart,
        weekEnd,
        createdAt: now,
        updatedAt: now,
      },
    ];

    return challenges;
  }

  /**
   * Verifica progresso dos desafios semanais
   */
  static async checkChallengeProgress(
    userId: string,
    challenges: WeeklyChallenge[]
  ): Promise<ChallengeProgress[]> {
    const progress: ChallengeProgress[] = [];

    for (const challenge of challenges) {
      let currentProgress = 0;

      switch (challenge.category) {
        case 'sleep':
          // Contar registros de sono na semana
          const sleepCount = await prisma.sleepRecord.count({
            where: {
              userId,
              createdAt: {
                gte: challenge.weekStart,
                lte: challenge.weekEnd,
              },
            },
          });
          currentProgress = sleepCount;
          break;

        case 'memory':
          // Contar memórias criadas na semana
          const memoryCount = await prisma.memory.count({
            where: {
              userId,
              createdAt: {
                gte: challenge.weekStart,
                lte: challenge.weekEnd,
              },
            },
          });
          currentProgress = memoryCount;
          break;

        case 'consistency':
          // Verificar login diário na semana
          const loginDays = await prisma.gamification.findUnique({
            where: { userId },
            select: { streaks: true },
          });
          const streaks = loginDays?.streaks as Record<string, number> || {};
          currentProgress = Math.min(streaks.login || 0, 7);
          break;

        default:
          currentProgress = 0;
      }

      progress.push({
        challengeId: challenge.id,
        progress: currentProgress,
        goal: challenge.goal,
        isCompleted: currentProgress >= challenge.goal,
        reward: challenge.reward,
      });
    }

    return progress;
  }

  /**
   * Gera recompensas de IA
   */
  static async generateAIRewards(userId: string): Promise<AIReward[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { babies: true, gamification: true },
    });

    if (!user || !user.gamification) return [];

    const rewards: AIReward[] = [
      {
        id: 'ai_tip_1',
        title: 'Presente da Inteligência Mãe-AI',
        description: 'Dica personalizada baseada no padrão do seu bebê',
        type: 'tip',
        content: 'Baseado no seu padrão de atividades, seu bebê está se desenvolvendo de forma excepcional! Uma dica especial: tente estabelecer uma rotina consistente de sono, pois isso pode melhorar significativamente o desenvolvimento cognitivo e emocional do seu pequeno. Lembre-se: cada bebê é único, então confie nos seus instintos maternos!',
        tips: [
          'Mantenha um diário de sono para identificar padrões',
          'Crie um ambiente calmo antes de dormir',
          'Estabeleça horários regulares para as refeições'
        ],
        isActive: true,
        unlockCondition: 'total_activities >= 10',
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'ai_activity_1',
        title: 'Atividade Especial da IA',
        description: 'Exercício específico para a idade do seu bebê',
        type: 'activity',
        content: 'Desenvolvi uma atividade personalizada especialmente para o seu bebê! Esta atividade foi criada considerando a idade e o desenvolvimento atual do seu pequeno. É uma forma divertida e educativa de fortalecer o vínculo entre vocês enquanto estimula o desenvolvimento motor e cognitivo.',
        activities: [
          'Sessão de massagem com música suave',
          'Jogo de "esconde-esconde" com objetos coloridos',
          'Exercícios de alongamento guiados'
        ],
        isActive: true,
        unlockCondition: 'total_memories >= 5',
        sortOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'ai_milestone_1',
        title: 'Previsão dos Próximos Marcos',
        description: 'Descubra o que esperar nos próximos meses',
        type: 'milestone',
        content: 'Analisando o desenvolvimento do seu bebê, posso prever alguns marcos emocionantes que estão por vir! Seu pequeno está no caminho certo para alcançar conquistas importantes. Esta previsão é baseada em dados científicos e no padrão único do seu bebê.',
        tips: [
          'Prepare-se para os primeiros passos',
          'Observe o desenvolvimento da linguagem',
          'Celebre cada pequena conquista'
        ],
        isActive: true,
        unlockCondition: 'level >= 3',
        sortOrder: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'ai_encouragement_1',
        title: 'Mensagem de Apoio Personalizada',
        description: 'Palavras especiais para você, mamãe',
        type: 'encouragement',
        content: 'Querida mamãe, você está fazendo um trabalho incrível! Sua dedicação e amor são evidentes em cada atividade registrada. Lembre-se: você é a melhor mãe que seu bebê poderia ter. Cada desafio que você supera torna você mais forte e mais sábia.',
        activities: [
          'Reserve 10 minutos por dia para você',
          'Conecte-se com outras mães',
          'Pratique autocompaixão diariamente'
        ],
        isActive: true,
        unlockCondition: 'streak_login >= 7',
        sortOrder: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Após montar o array de rewards, adicione o campo cost em cada uma
    const rewardsWithCost = rewards.map(reward => ({
      ...reward,
      cost:
        reward.type === 'tip' ? 20 :
        reward.type === 'activity' ? 30 :
        reward.type === 'milestone' ? 40 :
        reward.type === 'encouragement' ? 10 :
        20,
    }));
    return rewardsWithCost;
  }

  /**
   * Atualiza ranking semanal
   */
  static async updateWeeklyRanking(userId: string, points: number): Promise<void> {
    const now = new Date();
    const week = Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24 * 7));
    const year = now.getFullYear();

    // Atualizar ou criar ranking do usuário
    await prisma.gamificationRanking.upsert({
      where: {
        userId_week_year: {
          userId,
          week,
          year,
        },
      },
      update: {
        points,
      },
      create: {
        userId,
        week,
        year,
        points,
      },
    });

    // Recalcular rankings
    const rankings = await prisma.gamificationRanking.findMany({
      where: { week, year },
      orderBy: { points: 'desc' },
    });

    // Atualizar posições
    for (let i = 0; i < rankings.length; i++) {
      const ranking = rankings[i];
      if (ranking && ranking.id) {
        await prisma.gamificationRanking.update({
          where: { id: ranking.id },
          data: { rank: i + 1 },
        });
      }
    }
  }

  /**
   * Obtém ranking semanal
   */
  static async getWeeklyRanking(limit: number = 10): Promise<any[]> {
    const now = new Date();
    const week = Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24 * 7));
    const year = now.getFullYear();

    return await prisma.gamificationRanking.findMany({
      where: { week, year },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { points: 'desc' },
      take: limit,
    });
  }

  // SISTEMA DE RESGATE MANUAL - LOJA DE RECOMPENSAS

  /**
   * Obtém itens da loja disponíveis
   */
  static async getShopItems(): Promise<any[]> {
    return await prisma.shopItem.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /**
   * Compra um item da loja
   */
  static async purchaseItem(userId: string, itemId: string): Promise<any> {
    const item = await prisma.shopItem.findUnique({
      where: { id: itemId },
    });

    if (!item || !item.isActive) {
      throw new Error('Item não disponível');
    }

    let gamification = await prisma.gamification.findUnique({
      where: { userId },
    });
    if (!gamification) {
      // Cria registro de gamificação inicial
      gamification = await prisma.gamification.create({
        data: {
          userId,
          points: 0,
          level: 1,
          badges: [],
          streaks: {},
          achievements: [],
        },
      });
    }
    if (gamification.points < item.price) {
      throw new Error('Pontos insuficientes');
    }

    // Verificar estoque se for limitado
    if (item.isLimited && item.stock !== null) {
      const purchasedCount = await prisma.userPurchase.count({
        where: { itemId },
      });

      if (purchasedCount >= item.stock) {
        throw new Error('Item esgotado');
      }
    }

    // Verificar se já comprou (para itens únicos ou bônus)
    if (item.type === 'theme' || item.type === 'feature' || item.type === 'bonus') {
      const alreadyPurchased = await prisma.userPurchase.findFirst({
        where: { userId, itemId },
      });
      if (alreadyPurchased) {
        throw new Error('Item já comprado');
      }
    }

    // Realizar a compra
    const purchase = await prisma.userPurchase.create({
      data: {
        userId,
        itemId,
        pointsSpent: item.price,
      },
    });

    // Atualizar pontos do usuário
    const updatedGamification = await prisma.gamification.update({
      where: { userId },
      data: {
        points: gamification.points - item.price,
      },
    });

    return {
      purchase,
      newPoints: updatedGamification.points,
      item,
    };
  }

  /**
   * Obtém histórico de compras do usuário
   */
  static async getUserPurchases(userId: string): Promise<any[]> {
    return await prisma.userPurchase.findMany({
      where: { userId },
      include: {
        item: true,
      },
    });
  }

  // SISTEMA DE MISSÕES DIÁRIAS

  /**
   * Gera missões diárias para o usuário
   */
  static async generateDailyMissions(userId: string): Promise<any[]> {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    // Verificar se já tem missões para hoje
    const existingMissions = await prisma.userMission.findMany({
      where: {
        userId,
        expiresAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (existingMissions.length > 0) {
      return existingMissions;
    }

    // Obter missões disponíveis
    const availableMissions = await prisma.dailyMission.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      take: 3, // 3 missões por dia
    });

    // Criar missões para o usuário
    const userMissions = [];
    for (const mission of availableMissions) {
      const userMission = await prisma.userMission.create({
        data: {
          userId,
          missionId: mission.id,
          expiresAt: tomorrow,
        },
        include: {
          mission: true,
        },
      });
      userMissions.push(userMission);
    }

    return userMissions;
  }

  /**
   * Atualiza progresso de uma missão
   */
  static async updateMissionProgress(userId: string, missionId: string, progress: number): Promise<any> {
    const userMission = await prisma.userMission.findFirst({
      where: { userId, missionId },
      include: { mission: true },
    });

    if (!userMission) {
      throw new Error('Missão não encontrada');
    }

    const newProgress = Math.min(progress, userMission.mission.goal);
    const isCompleted = newProgress >= userMission.mission.goal && !userMission.isCompleted;

    const updatedMission = await prisma.userMission.update({
      where: { id: userMission.id },
      data: {
        progress: newProgress,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
      include: {
        mission: true,
      },
    });

    // Se completou a missão, dar pontos
    if (isCompleted) {
      const gamification = await prisma.gamification.findUnique({
        where: { userId },
      });

      if (gamification) {
        await prisma.gamification.update({
          where: { userId },
          data: {
            points: gamification.points + userMission.mission.points,
          },
        });
      }
    }

    return updatedMission;
  }

  /**
   * Obtém missões diárias do usuário
   */
  static async getUserMissions(userId: string): Promise<any[]> {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    return await prisma.userMission.findMany({
      where: {
        userId,
        expiresAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        mission: true,
      },
      orderBy: { assignedAt: 'asc' },
    });
  }

  // SISTEMA DE EVENTOS ESPECIAIS

  /**
   * Obtém eventos ativos
   */
  static async getActiveEvents(): Promise<any[]> {
    const now = new Date();
    return await prisma.specialEvent.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { startDate: 'asc' },
    });
  }

  /**
   * Participa de um evento
   */
  static async joinEvent(userId: string, eventId: string): Promise<any> {
    const event = await prisma.specialEvent.findUnique({
      where: { id: eventId },
    });

    if (!event || !event.isActive) {
      throw new Error('Evento não disponível');
    }

    const now = new Date();
    if (now < event.startDate || now > event.endDate) {
      throw new Error('Evento não está ativo');
    }

    // Verificar se já participa
    const existingParticipation = await prisma.userEvent.findFirst({
      where: { userId, eventId },
    });

    if (existingParticipation) {
      return existingParticipation;
    }

    // Participar do evento
    return await prisma.userEvent.create({
      data: {
        userId,
        eventId,
      },
      include: {
        event: true,
      },
    });
  }

  /**
   * Atualiza progresso em um evento
   */
  static async updateEventProgress(userId: string, eventId: string, challengeId: string, progress: number): Promise<any> {
    const userEvent = await prisma.userEvent.findFirst({
      where: { userId, eventId },
      include: { event: true },
    });

    if (!userEvent) {
      throw new Error('Não participa deste evento');
    }

    const currentProgress = userEvent.progress as Record<string, any>;
    currentProgress[challengeId] = progress;

    return await prisma.userEvent.update({
      where: { id: userEvent.id },
      data: {
        progress: currentProgress,
      },
      include: {
        event: true,
      },
    });
  }

  /**
   * Obtém eventos do usuário
   */
  static async getUserEvents(userId: string): Promise<any[]> {
    return await prisma.userEvent.findMany({
      where: { userId },
      include: {
        event: true,
      },
      orderBy: { joinedAt: 'desc' },
    });
  }
} 