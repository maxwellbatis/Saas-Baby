import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '@/utils/jwt';
import prisma from '@/config/database';
import { JWTPayload } from '@/types';

// Extender a interface Request para incluir o usuário
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      admin?: JWTPayload;
    }
  }
}

// Middleware para autenticar usuário
export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    const decoded = verifyToken(token);

    if (decoded.role !== 'user') {
      res.status(403).json({
        success: false,
        error: 'Acesso negado. Token de usuário necessário.',
      });
      return;
    }

    // Verificar se o usuário ainda existe e está ativo
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, isActive: true },
    });

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        error: 'Usuário não encontrado ou inativo.',
      });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Token inválido ou expirado.',
    });
  }
};

// Middleware para autenticar admin
export const authenticateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    const decoded = verifyToken(token);

    if (decoded.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Acesso negado. Token de administrador necessário.',
      });
      return;
    }

    // Verificar se o admin ainda existe e está ativo
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, isActive: true, role: true },
    });

    if (!admin || !admin.isActive) {
      res.status(401).json({
        success: false,
        error: 'Administrador não encontrado ou inativo.',
      });
      return;
    }

    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Token inválido ou expirado.',
    });
  }
};

// Middleware para verificar se o usuário tem plano ativo
export const requireActiveSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuário não autenticado.',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        subscription: {
          include: { plan: true },
        },
      },
    });

    if (!user?.subscription || user.subscription.status !== 'active') {
      res.status(403).json({
        success: false,
        error: 'Assinatura ativa necessária para acessar este recurso.',
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor.',
    });
  }
};

// Middleware para verificar limite de bebês do plano
export const checkBabyLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        plan: true,
        babies: { where: { isActive: true } },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuário não encontrado.' });
    }

    const babyLimit = user.plan?.userLimit ?? 1; 
    const babyCount = user.babies.length;

    if (babyCount >= babyLimit) {
      return res.status(403).json({
        success: false,
        error: `Limite de ${babyLimit} bebê(s) atingido. Considere fazer um upgrade de plano.`,
      });
    }

    return next();
  } catch (error) {
    console.error('Erro no middleware checkBabyLimit:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor ao verificar o limite de bebês.',
    });
  }
};

// Middleware para verificar se o bebê pertence ao usuário
export const verifyBabyOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuário não autenticado.',
      });
      return;
    }

    // Verificar diferentes possíveis nomes de parâmetro
    const babyId = req.params.id || req.params.babyId || req.body.babyId;
    if (!babyId) {
      res.status(400).json({
        success: false,
        error: 'ID do bebê não fornecido.',
      });
      return;
    }

    const baby = await prisma.baby.findFirst({
      where: {
        id: babyId,
        userId: req.user.userId,
        isActive: true,
      },
    });

    if (!baby) {
      res.status(404).json({
        success: false,
        error: 'Bebê não encontrado ou não pertence ao usuário.',
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor.',
    });
  }
};

// Middleware para verificar limite de memórias
export const checkMemoryLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { plan: true },
    });

    if (!user?.plan) {
      return res.status(403).json({ success: false, error: 'Plano de usuário não encontrado.' });
    }

    const memoryLimit = user.plan.memoryLimit ?? 10;
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const memoriesCount = await prisma.memory.count({
      where: {
        userId: req.user.userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    if (memoriesCount >= memoryLimit) {
      return res.status(403).json({
        success: false,
        error: `Limite de ${memoryLimit} memórias por mês atingido.`,
      });
    }

    return next();
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao verificar limite de memórias.' });
  }
};

// Middleware para verificar limite de marcos
export const checkMilestoneLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { plan: true },
    });

    if (!user?.plan) {
      return res.status(403).json({ success: false, error: 'Plano de usuário não encontrado.' });
    }

    const milestoneLimit = user.plan.milestoneLimit ?? 10;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const milestonesCount = await prisma.milestone.count({
      where: {
        userId: req.user.userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    if (milestonesCount >= milestoneLimit) {
      return res.status(403).json({
        success: false,
        error: `Limite de ${milestoneLimit} marcos por mês atingido.`,
      });
    }

    return next();
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao verificar limite de marcos.' });
  }
};

// Middleware para verificar limite de atividades
export const checkActivityLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { plan: true },
    });

    if (!user?.plan) {
      return res.status(403).json({ success: false, error: 'Plano de usuário não encontrado.' });
    }

    const activityLimit = user.plan.activityLimit ?? 10;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const activitiesCount = await prisma.activity.count({
      where: {
        userId: req.user.userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    if (activitiesCount >= activityLimit) {
      return res.status(403).json({
        success: false,
        error: `Limite de ${activityLimit} atividades por mês atingido.`,
      });
    }
    
    return next();
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao verificar limite de atividades.' });
  }
};

// Middleware para verificar limite de IA
export const checkAILimit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { plan: true },
    });

    if (!user?.plan) {
      return res.status(403).json({ success: false, error: 'Plano de usuário não encontrado.' });
    }

    const aiLimit = user.plan.aiLimit ?? 10;

    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const interactionsCount = await prisma.aIInteraction.count({
      where: {
        userId: req.user.userId,
        createdAt: {
          gte: startOfWeek,
          lt: endOfWeek,
        },
      },
    });

    if (interactionsCount >= aiLimit) {
      return res.status(403).json({
        success: false,
        error: `Limite de ${aiLimit} interações com IA por semana atingido.`,
      });
    }

    return next();
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao verificar limite de IA.' });
  }
}; 