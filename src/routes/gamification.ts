import express from "express";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { GamificationService } from "../services/gamification";
import { authenticateUser } from "../middlewares/auth";

const router = express.Router();
const prisma = new PrismaClient();

// Obter dados completos de gamificação do usuário
router.get('/', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Buscar gamificação do usuário
    let gamification = await prisma.gamification.findUnique({
      where: { userId },
    });

    if (!gamification) {
      // Criar registro de gamificação se não existir
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

    // Calcular próximo nível
    const nextLevelPoints = GamificationService.getNextLevelPoints(gamification.level);
    const currentLevelPoints = gamification.points - ((gamification.level - 1) * 150);
    const progressToNextLevel = (currentLevelPoints / 150) * 100;

    // Buscar recompensas de IA
    const aiRewards = await GamificationService.generateAIRewards(userId);

    return res.json({
      success: true,
      data: {
        gamification: {
          id: gamification.id,
          userId: gamification.userId,
          points: gamification.points,
          level: gamification.level,
          badges: gamification.badges,
          streaks: gamification.streaks,
          achievements: gamification.achievements,
          totalActivities: 'totalActivities' in gamification ? (gamification as any).totalActivities : 0,
          totalMemories: 'totalMemories' in gamification ? (gamification as any).totalMemories : 0,
          totalMilestones: 'totalMilestones' in gamification ? (gamification as any).totalMilestones : 0,
          lastLoginDate: 'lastLoginDate' in gamification ? (gamification as any).lastLoginDate : null,
          dailyGoal: 'dailyGoal' in gamification ? (gamification as any).dailyGoal : 50,
          dailyProgress: 'dailyProgress' in gamification ? (gamification as any).dailyProgress : 0,
          weeklyChallenges: 'weeklyChallenges' in gamification ? (gamification as any).weeklyChallenges : [],
          aiRewards: 'aiRewards' in gamification ? (gamification as any).aiRewards : [],
          createdAt: gamification.createdAt,
          updatedAt: gamification.updatedAt,
          nextLevelPoints,
          currentLevelPoints,
          progressToNextLevel,
        },
        weeklyChallenges: [],
        aiRewards,
        ranking: [],
        newBadges: [],
        levelUp: false,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar dados de gamificação:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Atualizar progresso diário
router.post('/daily-progress', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { activityType, points } = req.body;

    let gamification = await prisma.gamification.findUnique({
      where: { userId },
    });

    if (!gamification) {
      return res.status(404).json({
        success: false,
        error: 'Gamificação não encontrada',
      });
    }

    // Atualizar progresso diário
    const newDailyProgress = gamification.dailyProgress + (points || 0);
    const dailyGoal = gamification.dailyGoal;

    // Verificar se atingiu a meta diária
    const dailyGoalMet = newDailyProgress >= dailyGoal;

    // Atualizar gamificação
    const updatedGamification = await prisma.gamification.update({
      where: { userId },
      data: {
        dailyProgress: newDailyProgress,
        lastLoginDate: new Date(),
      },
    });

    return res.json({
      success: true,
      data: {
        dailyProgress: newDailyProgress,
        dailyGoal,
        dailyGoalMet,
        gamification: updatedGamification,
      },
    });
  } catch (error) {
    console.error('Erro ao atualizar progresso diário:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Obter estatísticas de gamificação
router.get('/stats', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const gamification = await prisma.gamification.findUnique({
      where: { userId },
    });

    if (!gamification) {
      return res.status(404).json({
        success: false,
        error: 'Gamificação não encontrada',
      });
    }

    // Calcular estatísticas
    const stats = {
      totalPoints: gamification.points,
      currentLevel: gamification.level,
      nextLevelPoints: GamificationService.getNextLevelPoints(gamification.level),
      badgesCount: Array.isArray(gamification.badges) ? gamification.badges.length : 0,
      achievementsCount: Array.isArray(gamification.achievements) ? gamification.achievements.length : 0,
      totalActivities: 'totalActivities' in gamification ? (gamification as any).totalActivities : 0,
      totalMemories: 'totalMemories' in gamification ? (gamification as any).totalMemories : 0,
      totalMilestones: 'totalMilestones' in gamification ? (gamification as any).totalMilestones : 0,
      streaks: gamification.streaks,
      dailyProgress: 'dailyProgress' in gamification ? (gamification as any).dailyProgress : 0,
      dailyGoal: 'dailyGoal' in gamification ? (gamification as any).dailyGoal : 50,
      dailyGoalPercentage: ('dailyProgress' in gamification && 'dailyGoal' in gamification && (gamification as any).dailyGoal > 0)
        ? ((gamification as any).dailyProgress / (gamification as any).dailyGoal) * 100
        : 0,
    };

    return res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// SISTEMA DE RESGATE MANUAL - LOJA DE RECOMPENSAS

// Obter itens da loja
router.get('/shop', authenticateUser, async (req: Request, res: Response) => {
  try {
    const shopItems = await GamificationService.getShopItems();
    
    return res.json({
      success: true,
      data: shopItems,
    });
  } catch (error) {
    console.error('Erro ao buscar itens da loja:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Comprar item da loja
router.post('/shop/purchase', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { itemId } = req.body;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        error: 'ID do item é obrigatório',
      });
    }

    const purchase = await GamificationService.purchaseItem(userId, itemId);
    
    return res.json({
      success: true,
      data: purchase,
      message: 'Item comprado com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao comprar item:', error);
    return res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
    });
  }
});

// Obter histórico de compras
router.get('/shop/purchases', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const purchases = await GamificationService.getUserPurchases(userId);
    
    return res.json({
      success: true,
      data: purchases,
    });
  } catch (error) {
    console.error('Erro ao buscar histórico de compras:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// SISTEMA DE MISSÕES DIÁRIAS

// Obter missões diárias
router.get('/missions', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const missions = await GamificationService.getUserMissions(userId);
    
    return res.json({
      success: true,
      data: missions,
    });
  } catch (error) {
    console.error('Erro ao buscar missões:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Gerar missões diárias
router.post('/missions/generate', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const missions = await GamificationService.generateDailyMissions(userId);
    
    return res.json({
      success: true,
      data: missions,
      message: 'Missões geradas com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao gerar missões:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Atualizar progresso da missão
router.post('/missions/progress', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { missionId, progress } = req.body;

    if (!missionId || progress === undefined) {
      return res.status(400).json({
        success: false,
        error: 'ID da missão e progresso são obrigatórios',
      });
    }

    const updatedMission = await GamificationService.updateMissionProgress(userId, missionId, progress);
    
    return res.json({
      success: true,
      data: updatedMission,
      message: updatedMission.isCompleted ? 'Missão completada!' : 'Progresso atualizado!',
    });
  } catch (error) {
    console.error('Erro ao atualizar progresso da missão:', error);
    return res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
    });
  }
});

// SISTEMA DE EVENTOS ESPECIAIS

// Obter eventos ativos
router.get('/events', authenticateUser, async (req: Request, res: Response) => {
  try {
    const events = await GamificationService.getActiveEvents();
    
    return res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Participar de evento
router.post('/events/join', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        error: 'ID do evento é obrigatório',
      });
    }

    const participation = await GamificationService.joinEvent(userId, eventId);
    
    return res.json({
      success: true,
      data: participation,
      message: 'Participação registrada com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao participar do evento:', error);
    return res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
    });
  }
});

// Atualizar progresso do evento
router.post('/events/progress', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { eventId, challengeId, progress } = req.body;

    if (!eventId || !challengeId || progress === undefined) {
      return res.status(400).json({
        success: false,
        error: 'ID do evento, ID do desafio e progresso são obrigatórios',
      });
    }

    const updatedEvent = await GamificationService.updateEventProgress(userId, eventId, challengeId, progress);
    
    return res.json({
      success: true,
      data: updatedEvent,
      message: 'Progresso do evento atualizado!',
    });
  } catch (error) {
    console.error('Erro ao atualizar progresso do evento:', error);
    return res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
    });
  }
});

// Obter eventos do usuário
router.get('/events/user', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const events = await GamificationService.getUserEvents(userId);
    
    return res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error('Erro ao buscar eventos do usuário:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Desbloquear recompensa de IA
router.post('/unlock-ai-reward', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { rewardId } = req.body;
    if (!rewardId) {
      return res.status(400).json({ success: false, error: 'rewardId é obrigatório' });
    }
    // Buscar gamificação do usuário
    let gamification = await prisma.gamification.findUnique({ where: { userId } });
    if (!gamification) {
      return res.status(404).json({ success: false, error: 'Gamificação não encontrada' });
    }
    // Buscar a recompensa IA
    const aiReward = await prisma.aIReward.findUnique({ where: { id: rewardId } });
    if (!aiReward || !aiReward.isActive) {
      return res.status(404).json({ success: false, error: 'Recompensa IA não encontrada' });
    }
    // Custo fixo para todas as recompensas de IA
    const cost = 200;
    // Garantir que aiRewards é um array de strings
    let aiRewardsArr: string[] = [];
    if (Array.isArray((gamification as any).aiRewards)) {
      aiRewardsArr = ((gamification as any).aiRewards as any[]).filter(x => typeof x === 'string');
    }
    if (aiRewardsArr.includes(rewardId)) {
      return res.status(400).json({ success: false, error: 'Recompensa já desbloqueada' });
    }
    // Verificar saldo de pontos
    if (gamification.points < cost) {
      return res.status(400).json({ success: false, error: `Você precisa de ${cost} pontos para desbloquear esta recompensa.` });
    }
    // Descontar pontos e desbloquear
    aiRewardsArr.push(rewardId);
    gamification = await prisma.gamification.update({
      where: { userId },
      data: {
        points: gamification.points - cost,
        aiRewards: aiRewardsArr,
      },
    });
    // Montar resposta defensiva
    return res.json({
      success: true,
      message: 'Recompensa desbloqueada com sucesso!',
      data: {
        gamification: {
          id: gamification.id,
          userId: gamification.userId,
          points: gamification.points,
          level: gamification.level,
          badges: gamification.badges,
          streaks: gamification.streaks,
          achievements: gamification.achievements,
          totalActivities: (gamification as any).totalActivities ?? 0,
          totalMemories: (gamification as any).totalMemories ?? 0,
          totalMilestones: (gamification as any).totalMilestones ?? 0,
          lastLoginDate: (gamification as any).lastLoginDate ?? null,
          dailyGoal: (gamification as any).dailyGoal ?? 50,
          dailyProgress: (gamification as any).dailyProgress ?? 0,
          weeklyChallenges: (gamification as any).weeklyChallenges ?? [],
          aiRewards: aiRewardsArr,
          createdAt: gamification.createdAt,
          updatedAt: gamification.updatedAt,
        },
        newPoints: gamification.points,
      },
    });
  } catch (error) {
    console.error('Erro ao desbloquear recompensa IA:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// Endpoint temporário para adicionar pontos (apenas para teste)
router.post('/add-points', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { points } = req.body;
    
    if (!points || typeof points !== 'number' || points <= 0) {
      res.status(400).json({ success: false, error: 'Pontos inválidos' });
      return;
    }

    // Buscar gamificação do usuário
    let gamification = await prisma.gamification.findUnique({ where: { userId } });
    if (!gamification) {
      // Criar registro de gamificação inicial
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

    // Adicionar pontos
    const newPoints = gamification.points + points;
    const newLevel = GamificationService.calculateLevel(newPoints);

    // Atualizar gamificação
    const updatedGamification = await prisma.gamification.update({
      where: { userId },
      data: {
        points: newPoints,
        level: newLevel,
      },
    });

    res.json({
      success: true,
      message: `${points} pontos adicionados com sucesso!`,
      data: {
        points: updatedGamification.points,
        level: updatedGamification.level,
      },
    });
  } catch (error) {
    console.error('Erro ao adicionar pontos:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

export default router;
