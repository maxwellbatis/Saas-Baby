import { Request, Response } from 'express';
import prisma from '@/config/database';
import { validationResult } from 'express-validator';
import { z } from 'zod';
import { NotificationService } from '@/services/notification.service';
import stripe from '@/config/stripe';
import { createPrice } from '@/config/stripe';
import { Prisma } from '@prisma/client';
import Stripe from 'stripe';
import { getCloudinaryConfig } from '../config/cloudinary';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import emailService from '../services/email.service';
import { uploadToCloudinary } from '../config/cloudinary';


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
    
    // Calcular estatísticas
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const [users, total, stats] = await Promise.all([
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
      Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isActive: true } }),
        prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
        prisma.user.count({ 
          where: { 
            subscription: { 
              status: 'active',
              plan: { name: { in: ['premium', 'Premium', 'FAMÍLIA', 'família'] } }
            } 
          } 
        })
      ])
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
        stats: {
          totalUsers: stats[0],
          activeUsers: stats[1],
          newUsers30Days: stats[2],
          premiumUsers: stats[3]
        }
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
    const updateData = req.body;
    const updatedContent = await prisma.landingPageContent.upsert({
      where: { id: 1 },
      update: updateData,
      create: {
        id: 1,
        heroTitle: 'Baby Diary',
        heroSubtitle: 'Acompanhe o desenvolvimento do seu bebê',
        features: [],
        testimonials: [],
        faq: [],
        stats: [],
        ...updateData,
      },
    });

    return res.json({ success: true, data: updatedContent });
  } catch (error) {
    console.error('Erro ao atualizar conteúdo da landing page:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
};

export const getBusinessPageContent = async (req: Request, res: Response) => {
  try {
    const content = await prisma.businessPageContent.findUnique({
      where: { id: 1 },
    });

    if (!content) {
      // Criar conteúdo padrão se não existir
      const defaultContent = await prisma.businessPageContent.create({
        data: {
          id: 1,
          heroTitle: '🍼 BABY DIARY',
          heroSubtitle: 'O APP DEFINITIVO PARA MÃES QUE QUEREM DOCUMENTAR CADA MOMENTO ESPECIAL',
          benefits: [],
          businessAdvantages: [],
          featuresMoms: [],
          featuresAdmin: [],
          marketData: [],
          differentials: [],
          finalArguments: [],
          futureFeatures: [],
        },
      });
      return res.json({ success: true, data: defaultContent });
    }

    return res.json({ success: true, data: content });
  } catch (error) {
    console.error('Erro ao buscar conteúdo da página business:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
};

export const updateBusinessPageContent = async (req: Request, res: Response) => {
  try {
    const updateData = req.body;
    const updatedContent = await prisma.businessPageContent.upsert({
      where: { id: 1 },
      update: updateData,
      create: {
        id: 1,
        heroTitle: '🍼 BABY DIARY',
        heroSubtitle: 'O APP DEFINITIVO PARA MÃES QUE QUEREM DOCUMENTAR CADA MOMENTO ESPECIAL',
        benefits: [],
        businessAdvantages: [],
        featuresMoms: [],
        featuresAdmin: [],
        marketData: [],
        differentials: [],
        finalArguments: [],
        futureFeatures: [],
        ...updateData,
      },
    });

    return res.json({ success: true, data: updatedContent });
  } catch (error) {
    console.error('Erro ao atualizar conteúdo da página business:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
};

// ===== GERENCIAMENTO DE PEDIDOS =====

// Listar todos os pedidos (admin)
export const getAllPedidosAdmin = async (req: Request, res: Response) => {
  try {
    const { 
      page = '1', 
      limit = '10', 
      status = '', 
      userId = '',
      dateFrom = '',
      dateTo = '',
      search = ''
    } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    let where: any = {};

    if (status) {
      where.status = status;
    }

    if (userId) {
      where.userId = userId;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo as string);
      }
    }

    // Busca por ID do pedido ou paymentId
    if (search) {
      where.OR = [
        { id: { contains: search as string, mode: 'insensitive' } },
        { paymentId: { contains: search as string, mode: 'insensitive' } } as any
      ];
    }

    const pedidos = await prisma.pedido.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.pedido.count({ where });

    return res.json({
      success: true,
      data: {
        pedidos,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

// Buscar pedido por ID (admin)
export const getPedidoByIdAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const pedido = await prisma.pedido.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!pedido) {
      return res.status(404).json({
        success: false,
        error: 'Pedido não encontrado',
      });
    }

    return res.json({
      success: true,
      data: pedido,
    });
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

// Atualizar pedido (admin)
export const updatePedidoAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, paymentId, totalAmount, items } = req.body;

    const pedido = await prisma.pedido.findUnique({
      where: { id },
    });

    if (!pedido) {
      return res.status(404).json({
        success: false,
        error: 'Pedido não encontrado',
      });
    }

    const pedidoAtualizado = await prisma.pedido.update({
      where: { id },
      data: {
        status: status || pedido.status,
        
        
        items: items || pedido.items,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      data: pedidoAtualizado,
      message: 'Pedido atualizado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

// Deletar pedido (admin)
export const deletePedidoAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const pedido = await prisma.pedido.findUnique({
      where: { id },
    });

    if (!pedido) {
      return res.status(404).json({
        success: false,
        error: 'Pedido não encontrado',
      });
    }

    await prisma.pedido.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: 'Pedido deletado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar pedido:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

// Buscar chave de integração (ex: Freepik)
export const getIntegrationConfig = async (req: Request, res: Response) => {
  try {
    const { key } = req.query;
    if (!key) return res.status(400).json({ error: 'Key é obrigatória' });
    const integrationConfig = await prisma.integrationConfig.findUnique({ where: { key: String(key) } });
    if (!integrationConfig) return res.status(404).json({ error: 'Configuração não encontrada' });
    return res.json({ value: integrationConfig.value });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar configuração' });
  }
};

// Atualizar/cadastrar chave de integração
export const updateIntegrationConfig = async (req: Request, res: Response) => {
  try {
    const { key, value } = req.body;
    if (!key || !value) return res.status(400).json({ error: 'Key e value são obrigatórios' });
    const integrationConfig = await prisma.integrationConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    return res.json({ success: true, config: integrationConfig });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao atualizar configuração' });
  }
};

export const testIntegrations = async (req: Request, res: Response) => {
  const results: Array<{ name: string; status: 'success' | 'error'; message: string }> = [];

  // Teste Stripe
  try {
    const stripeKeyConfig = await prisma.integrationConfig.findUnique({ where: { key: 'STRIPE_SECRET_KEY' } });
    const stripeKey = process.env.STRIPE_SECRET_KEY || stripeKeyConfig?.value;
    if (!stripeKey) throw new Error('Chave Stripe não configurada');
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    await stripe.accounts.retrieve('acct_1'); // Conta fake, só para testar requisição
    results.push({ name: 'stripe', status: 'success', message: 'Conexão com Stripe OK' });
  } catch (e: any) {
    results.push({ name: 'stripe', status: 'error', message: 'Erro na conexão com Stripe: ' + (e.message || e) });
  }

  // Teste Cloudinary
  try {
    const config = await getCloudinaryConfig();
    if (!config.cloud_name || !config.api_key || !config.api_secret) throw new Error('Configuração Cloudinary incompleta');
    // Testa autenticação via API
    const ping = await axios.get(`https://api.cloudinary.com/v1_1/${config.cloud_name}/ping`, {
      auth: { username: config.api_key, password: config.api_secret }
    });
    if (ping.data && ping.data.status === 'ok') {
      results.push({ name: 'cloudinary', status: 'success', message: 'Conexão com Cloudinary OK' });
    } else {
      throw new Error('Resposta inesperada do Cloudinary');
    }
  } catch (e: any) {
    results.push({ name: 'cloudinary', status: 'error', message: 'Erro na conexão com Cloudinary: ' + (e.message || e) });
  }

  // Teste Groq
  try {
    const groqKeyConfig = await prisma.integrationConfig.findUnique({ where: { key: 'GROQ_API_KEY' } });
    const groqKey = process.env.GROQ_API_KEY || groqKeyConfig?.value;
    if (!groqKey) throw new Error('Chave Groq não configurada');
    const resp = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama-3-8b-8192',
      messages: [{ role: 'user', content: 'ping' }],
      max_tokens: 1
    }, {
      headers: { 'Authorization': `Bearer ${groqKey}` }
    });
    if (resp.data && resp.data.choices) {
      results.push({ name: 'groq', status: 'success', message: 'Conexão com Groq OK' });
    } else {
      throw new Error('Resposta inesperada do Groq');
    }
  } catch (e: any) {
    results.push({ name: 'groq', status: 'error', message: 'Erro na conexão com Groq: ' + (e.message || e) });
  }

  // Teste banco de dados
  try {
    await prisma.$queryRaw`SELECT 1`;
    results.push({ name: 'database', status: 'success', message: 'Conexão com banco de dados OK' });
  } catch (e: any) {
    results.push({ name: 'database', status: 'error', message: 'Erro na conexão com banco de dados: ' + (e.message || e) });
  }

  res.json(results);
};

// Listar logs de envio de email de upgrade
export const getUpgradeEmailLogs = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, status, reason, email, userId } = req.query;
    const where: any = {};
    if (status) where.status = status;
    if (reason) where.reason = reason;
    if (email) where.email = { contains: email };
    if (userId) where.userId = userId;
    const skip = (Number(page) - 1) * Number(limit);
    const [logs, total] = await Promise.all([
      prisma.upgradeEmailLog.findMany({
        where,
        orderBy: { sentAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.upgradeEmailLog.count({ where })
    ]);
    res.json({ logs, total });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar logs', details: err });
  }
};

// Disparo manual de email de upgrade
export const sendUpgradeEmailManual = async (req: Request, res: Response) => {
  try {
    const { userIds = [], emails = [], segment = '', reason = 'manual' } = req.body;
    let users: any[] = [];
    if (userIds.length) {
      users = await prisma.user.findMany({ where: { id: { in: userIds } } });
    } else if (emails.length) {
      users = await prisma.user.findMany({ where: { email: { in: emails } } });
    } else if (segment) {
      // Exemplo: segmento free_users
      if (segment === 'free_users') {
        const freePlan = await prisma.plan.findFirst({ where: { name: { contains: 'Básico' } } });
        if (freePlan) {
          users = await prisma.user.findMany({ where: { planId: freePlan.id } });
        }
      } else if (segment === 'inactive_30d') {
        const since = new Date();
        since.setDate(since.getDate() - 30);
        users = await prisma.user.findMany({ where: { lastLoginAt: { lt: since } } });
      }
      // Adicione outros segmentos conforme necessário
    }
    if (!users.length) {
      return res.status(400).json({ error: 'Nenhum usuário encontrado para o disparo.' });
    }
    let success = 0, failed = 0;
    for (const user of users) {
      try {
        const sent = await emailService.sendUpgradeIncentiveEmail({
          email: user.email,
          name: user.name || 'Usuário',
          planName: 'Premium',
          upgradeLink: 'https://app.babydiary.com.br/settings?upgrade=true'
        });
        await prisma.upgradeEmailLog.create({
          data: {
            userId: user.id,
            email: user.email,
            status: sent ? 'success' : 'failed',
            reason,
            error: sent ? null : 'Falha no envio (manual)'
          }
        });
        if (sent) success++; else failed++;
      } catch (e) {
        failed++;
      }
    }
    res.json({ total: users.length, success, failed });
    return;
  } catch (err) {
    res.status(500).json({ error: 'Erro ao disparar email', details: err });
    return;
  }
};

// --- CURSOS (ESTILO NETFLIX) ---

// Listar todos os cursos
export const listCourses = async (req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      include: { 
        modules: {
          include: {
            lessons: {
              include: {
                materials: true
              }
            }
          }
        }, 
        materials: true 
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Adicionar contadores para cada curso
    const coursesWithCounts = courses.map((course: any) => ({
      ...course,
      _count: {
        modules: course.modules.length,
        lessons: course.modules.reduce((total: number, module: any) => total + module.lessons.length, 0),
        enrollments: 0 // Por enquanto, não temos inscrições implementadas
      }
    }));
    
    res.json({ success: true, data: coursesWithCounts });
  } catch (error) {
    console.error('Erro ao listar cursos:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
};

// Detalhar curso
export const getCourse = async (req: Request, res: Response) => {
  const { id } = req.params;
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      modules: {
        include: {
          lessons: { include: { materials: true } }
        }
      },
      materials: true
    }
  });
  if (!course) return res.status(404).json({ error: 'Curso não encontrado' });
  res.json({ course });
  return;
};

// Criar curso
export const createCourse = async (req: Request, res: Response) => {
  try {
    const { title, description, category, author, thumbnail, isActive } = req.body;
    const course = await prisma.course.create({
      data: { 
        title, 
        description, 
        category, 
        author: author || 'Baby Diary',
        thumbnail: thumbnail || '',
        isActive: isActive !== undefined ? isActive : true
      }
    });
    res.json({ success: true, data: course });
  } catch (error) {
    console.error('Erro ao criar curso:', error);
    res.status(500).json({ error: 'Erro ao criar curso', details: error });
  }
};

// Editar curso e salvar módulos/aulas/materiais
export const updateCourse = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, thumbnail, category, author, isActive, modules = [], materials = [] } = req.body;
  // Atualiza dados principais
  const course = await prisma.course.update({
    where: { id },
    data: { title, description, thumbnail, category, author, isActive }
  });
  // Remove módulos/aulas/materiais antigos (na ordem correta para evitar violação de FK)
  // Primeiro deleta materiais das aulas
  await (prisma as any).courseMaterial.deleteMany({ 
    where: { 
      lessonId: { 
        in: (await (prisma as any).courseLesson.findMany({ 
          where: { module: { courseId: id } }, 
          select: { id: true } 
        })).map((l: any) => l.id)
      } 
    } 
  });
  
  // Depois deleta as aulas
  await (prisma as any).courseLesson.deleteMany({ 
    where: { 
      moduleId: { 
        in: (await (prisma as any).courseModule.findMany({ 
          where: { courseId: id }, 
          select: { id: true } 
        })).map((m: any) => m.id)
      } 
    } 
  });
  
  // Depois deleta os módulos
  await (prisma as any).courseModule.deleteMany({ where: { courseId: id } });
  
  // Por fim, deleta materiais gerais do curso
  await (prisma as any).courseMaterial.deleteMany({ where: { courseId: id } });
  // Recria módulos, aulas e materiais
  for (const mod of modules) {
    const createdModule = await (prisma as any).courseModule.create({
      data: { courseId: String(id), title: mod.title, order: mod.order }
    });
    for (const les of mod.lessons || []) {
      console.log('Salvando aula:', les.title, 'videoUrl:', les.videoUrl, 'thumbnail:', les.thumbnail);
      const createdLesson = await (prisma as any).courseLesson.create({
        data: { 
          moduleId: createdModule.id, 
          title: les.title, 
          videoUrl: les.videoUrl, 
          thumbnail: les.thumbnail || null,
          order: les.order, 
          duration: les.duration || 0 
        }
      });
      for (const mat of les.materials || []) {
        await (prisma as any).courseMaterial.create({
          data: { lessonId: createdLesson.id, type: mat.type, title: mat.title, url: mat.url }
        });
      }
    }
  }
  // Materiais gerais do curso
  for (const mat of materials) {
    await (prisma as any).courseMaterial.create({
      data: { courseId: id, type: mat.type, title: mat.title, url: mat.url }
    });
  }
  res.json({ course });
  return;
};

// Excluir curso
export const deleteCourse = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.course.delete({ where: { id } });
  res.json({ success: true });
};

// CRUD de módulos
export const createCourseModule = async (req: Request, res: Response) => {
  const { courseId, title, order } = req.body;
  const module = await prisma.courseModule.create({ data: { courseId, title, order } });
  res.json({ module });
};
export const updateCourseModule = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, order } = req.body;
  const module = await prisma.courseModule.update({ where: { id }, data: { title, order } });
  res.json({ module });
};
export const deleteCourseModule = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.courseModule.delete({ where: { id } });
  res.json({ success: true });
};

// CRUD de aulas
export const createCourseLesson = async (req: Request, res: Response) => {
  const { moduleId, title, videoUrl, thumbnail, order, duration } = req.body;
  const lesson = await prisma.courseLesson.create({ 
    data: { 
      moduleId, 
      title, 
      videoUrl, 
      thumbnail: thumbnail || null,
      order, 
      duration 
    } 
  });
  res.json({ lesson });
};
export const updateCourseLesson = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, videoUrl, thumbnail, order, duration } = req.body;
  const lesson = await prisma.courseLesson.update({ 
    where: { id }, 
    data: { 
      title, 
      videoUrl, 
      thumbnail: thumbnail || null,
      order, 
      duration 
    } 
  });
  res.json({ lesson });
};
export const deleteCourseLesson = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.courseLesson.delete({ where: { id } });
  res.json({ success: true });
};

// CRUD de materiais de apoio
export const createCourseMaterial = async (req: Request, res: Response) => {
  const { courseId, lessonId, type, title, url } = req.body;
  const material = await prisma.courseMaterial.create({ data: { courseId, lessonId, type, title, url } });
  res.json({ material });
};
export const deleteCourseMaterial = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.courseMaterial.delete({ where: { id } });
  res.json({ success: true });
};

export const uploadCourseFile = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📁 Upload iniciado:', req.file?.originalname);
    console.log('📋 Tipo:', req.body.type);
    console.log('📏 Tamanho:', req.file?.size);
    
    if (!req.file) {
      console.log('❌ Arquivo não encontrado');
      res.status(400).json({ error: 'Arquivo não enviado' });
      return;
    }
    
    const { type } = req.body; // 'image', 'video', 'pdf', 'doc'
    console.log('☁️ Fazendo upload para Cloudinary...');
    const result = await uploadToCloudinary(req.file.buffer, req.file.originalname, type);
    console.log('✅ Upload concluído:', result.secure_url);
    res.json({ url: result.secure_url });
  } catch (err) {
    console.error('❌ Erro no upload:', err);
    res.status(500).json({ error: 'Erro ao fazer upload', details: err });
  }
}; 
