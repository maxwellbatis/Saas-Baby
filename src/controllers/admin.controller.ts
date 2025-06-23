import { Request, Response } from 'express';
import prisma from '@/config/database';
import { validationResult } from 'express-validator';
import { z } from 'zod';
import { NotificationService } from '@/services/notification.service';
import stripe from '@/config/stripe';
import { createPrice } from '@/config/stripe';
import { Prisma } from '@prisma/client';


// Esquema de validação para criação e atualização de planos
const planSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  price: z.number().min(0, 'O preço não pode ser negativo').default(0),
  yearlyPrice: z.number().min(0, 'O preço anual não pode ser negativo').optional().nullable(),
  userLimit: z.number().int().min(0).default(1),
  memoryLimit: z.number().int().min(0).optional().nullable(),
  milestoneLimit: z.number().int().min(0).optional().nullable(),
  activityLimit: z.number().int().min(0).optional().nullable(),
  aiLimit: z.number().int().min(0).optional().nullable(),
  features: z.array(z.string()).optional().default([]),
});


export const getPlans = async (req: Request, res: Response) => {
  try {
    const plans = await prisma.plan.findMany({
      include: {
        _count: {
          select: {
            users: true,
            subscriptions: true,
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      }
    });

    return res.json({
      success: true,
      plans,
    });
  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

export const createPlan = async (req: Request, res: Response) => {
  try {
    // Desabilitar criação de novos planos - apenas os 3 planos fixos são permitidos
    return res.status(403).json({ 
      success: false, 
      error: 'Criação de novos planos está desabilitada. Apenas os 3 planos padrão (Básico, Premium e Família) são permitidos.' 
    });
  } catch (error) {
    console.error('Erro ao criar plano:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor ao criar plano',
    });
  }
};


export const updatePlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validation = planSchema.partial().safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({ success: false, error: 'Dados inválidos', details: validation.error.errors });
    }

    const existingPlan = await prisma.plan.findUnique({ where: { id } });
    if (!existingPlan) {
      return res.status(404).json({ success: false, error: 'Plano não encontrado.' });
    }

    // Verificar se é um dos 3 planos fixos permitidos
    const allowedPlanNames = ['Básico', 'Premium 👑', 'Família 👨‍👩‍👧‍👦'];
    if (!allowedPlanNames.includes(existingPlan.name)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Apenas os 3 planos padrão podem ser editados: Básico, Premium e Família.' 
      });
    }

    // Permitir apenas edição de preços e features, não de nome
    const { name, ...updateData } = validation.data;
    
    // Não permitir mudança de nome dos planos fixos
    if (name && name !== existingPlan.name) {
      return res.status(400).json({ 
        success: false, 
        error: 'Não é permitido alterar o nome dos planos padrão.' 
      });
    }

    // Verificar se o preço foi alterado
    const priceChanged = updateData.price !== undefined && updateData.price !== existingPlan.price;
    const yearlyPriceChanged = updateData.yearlyPrice !== undefined && updateData.yearlyPrice !== existingPlan.yearlyPrice;

    let newStripePriceId = existingPlan.stripePriceId;
    let newStripeYearlyPriceId = existingPlan.stripeYearlyPriceId;

    // Se o preço foi alterado, criar novos preços no Stripe
    if (priceChanged || yearlyPriceChanged) {
      try {
        if (!stripe) {
          throw new Error('Stripe não configurado');
        }

        // Criar novo preço mensal se alterado
        if (priceChanged && updateData.price !== undefined) {
          const newMonthlyPrice = await createPrice(
            updateData.price,
            'month',
            (existingPlan as any).stripeProductId!
          );
          newStripePriceId = newMonthlyPrice.id;
          console.log(`✅ Novo preço mensal criado no Stripe: ${newMonthlyPrice.id} - R$ ${updateData.price}`);
        }

        // Criar novo preço anual se alterado
        if (yearlyPriceChanged && updateData.yearlyPrice !== undefined && updateData.yearlyPrice !== null) {
          const newYearlyPrice = await createPrice(
            updateData.yearlyPrice,
            'year',
            (existingPlan as any).stripeProductId!
          );
          newStripeYearlyPriceId = newYearlyPrice.id;
          console.log(`✅ Novo preço anual criado no Stripe: ${newYearlyPrice.id} - R$ ${updateData.yearlyPrice}`);
        }

        // Atualizar os IDs dos preços no updateData
        (updateData as any).stripePriceId = newStripePriceId;
        (updateData as any).stripeYearlyPriceId = newStripeYearlyPriceId;

      } catch (stripeError) {
        console.error('❌ Erro ao criar novos preços no Stripe:', stripeError);
        return res.status(500).json({
          success: false,
          error: 'Erro ao atualizar preços no Stripe. Tente novamente.',
        });
      }
    }

    // Atualizar o plano no banco de dados
    const plan = await prisma.plan.update({
      where: { id },
      data: updateData,
    });

    return res.json({
      success: true,
      message: 'Plano atualizado com sucesso.',
      plan,
      priceUpdated: priceChanged || yearlyPriceChanged,
    });
  } catch (error) {
    console.error('Erro ao atualizar plano:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

export const deletePlan = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const existingPlan = await prisma.plan.findUnique({ where: { id } });
      if (!existingPlan) {
        return res.status(404).json({ success: false, error: 'Plano não encontrado' });
      }

      // Verificar se é um dos 3 planos fixos - não permitir exclusão
      const protectedPlanNames = ['Básico', 'Premium 👑', 'Família 👨‍👩‍👧‍👦'];
      if (protectedPlanNames.includes(existingPlan.name)) {
        return res.status(403).json({
          success: false,
          error: 'Não é possível excluir os planos padrão (Básico, Premium e Família).',
        });
      }

      // Verificar se há usuários ou assinaturas associadas ao plano
      const usersCount = await prisma.user.count({ where: { planId: id } });
      const subscriptionsCount = await prisma.subscription.count({ where: { planId: id } });

      if (usersCount > 0 || subscriptionsCount > 0) {
        return res.status(400).json({
          success: false,
          error: 'Não é possível excluir o plano, pois há usuários ou assinaturas ativas associadas a ele.',
        });
      }

      await prisma.plan.delete({ where: { id } });

      return res.json({ success: true, message: 'Plano excluído com sucesso' });
    } catch (error: any) {
      console.error('Erro ao excluir plano:', error);
      // Tratar caso o plano não seja encontrado (P2025)
      if (error && error.code === 'P2025') {
        return res.status(404).json({ success: false, error: 'Plano não encontrado' });
      }
      return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
    }
};

// ...outros métodos do controller...

// Exemplo de como o restante do arquivo pode parecer
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = '', planId = '', status = '' } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    // Construir filtros
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    
    if (planId) {
      where.planId = planId;
    }
    
    if (status) {
      where.isActive = status === 'active';
    }
    
    // Buscar usuários com paginação
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          plan: true,
          subscription: {
            include: {
              plan: true,
            },
          },
          babies: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: Number(limit),
      }),
      prisma.user.count({ where }),
    ]);
    
    const totalPages = Math.ceil(total / Number(limit));
    
    return res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages,
        },
      },
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        plan: true,
        subscription: {
          include: {
            plan: true,
          },
        },
        babies: true,
        memories: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado',
      });
    }
    
    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, planId, isActive } = req.body;
    
    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        planId,
        isActive,
      },
      include: {
        plan: true,
      },
    });
    
    return res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: user,
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar se há dados associados
    const userData = await prisma.user.findUnique({
      where: { id },
      include: {
        babies: true,
        memories: true,
        subscription: true,
      },
    });
    
    if (!userData) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado',
      });
    }
    
    // Deletar dados associados primeiro
    await prisma.$transaction([
      prisma.memory.deleteMany({ where: { userId: id } }),
      prisma.baby.deleteMany({ where: { userId: id } }),
      prisma.subscription.deleteMany({ where: { userId: id } }),
      prisma.user.delete({ where: { id } }),
    ]);
    
    return res.json({
      success: true,
      message: 'Usuário e dados associados excluídos com sucesso',
    });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Estatísticas gerais
    const [
      totalUsers,
      activeUsers,
      totalBabies,
      totalMemories,
      totalSubscriptions,
      activeSubscriptions,
      plans,
      recentUsers,
      recentMemories,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.baby.count(),
      prisma.memory.count(),
      prisma.subscription.count(),
      prisma.subscription.count({ where: { status: 'active' } }),
      prisma.plan.findMany({
        include: {
          _count: {
            select: {
              users: true,
              subscriptions: true,
            },
          },
        },
        orderBy: {
          sortOrder: 'asc',
        },
      }),
      prisma.user.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
        include: {
          plan: true,
        },
      }),
      prisma.memory.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          baby: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    // Calcular receita estimada (baseada nas assinaturas ativas)
    const activeSubscriptionsData = await prisma.subscription.findMany({
      where: { status: 'active' },
      include: {
        plan: true,
      },
    });
    const estimatedRevenue = activeSubscriptionsData.reduce((total, sub) => {
      return total + (sub.plan?.price || 0);
    }, 0);

    // Exemplo de crescimento e atividades (mock)
    const growthData: any[] = [];
    const activityByDay: any[] = [];

    // Novo formato para o frontend
    const stats = {
      users: {
        total: totalUsers,
        newThisMonth: recentUsers.length, // ou lógica mais precisa
      },
      plans: {
        total: plans.length,
        activeSubscriptions: activeSubscriptions,
      },
      revenue: {
        total: estimatedRevenue,
        monthly: estimatedRevenue, // ajuste se necessário
      },
      growthData,
      activityByDay,
    };

    return res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas do dashboard:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });
    
    return res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

export const createNotification = async (req: Request, res: Response) => {
  try {
    const { title, body, type, userId } = req.body;
    
    const notification = await prisma.notification.create({
      data: {
        title,
        body,
        type,
        userId,
      },
    });
    
    return res.status(201).json({
      success: true,
      message: 'Notificação criada com sucesso',
      data: notification,
    });
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

export const getLandingPageContent = async (req: Request, res: Response) => {
  try {
    const content = await prisma.landingPageContent.findUnique({
      where: { id: 1 },
    });
    
    return res.json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error('Erro ao buscar conteúdo da landing page:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

export const updateLandingPageContent = async (req: Request, res: Response) => {
  try {
    const { heroTitle, heroSubtitle, description, features, testimonials } = req.body;
    
    const content = await prisma.landingPageContent.upsert({
      where: { id: 1 },
      update: {
        heroTitle,
        heroSubtitle,
        features,
        testimonials,
      },
      create: {
        id: 1,
        heroTitle,
        heroSubtitle,
        features,
        testimonials,
        faq: [],
        stats: [],
      },
    });
    
    return res.json({
      success: true,
      message: 'Conteúdo da landing page atualizado com sucesso',
      data: content,
    });
  } catch (error) {
    console.error('Erro ao atualizar conteúdo da landing page:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
}; 