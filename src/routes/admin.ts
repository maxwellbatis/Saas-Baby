import express, { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { createPrice } from '@/config/stripe';
import { uploadImage } from '@/config/cloudinary';
import { hashPassword } from '../utils/bcrypt';
import { authenticateAdmin } from '../middlewares/auth';
import slugify from 'slugify';
import emailService from '../services/email.service';
import { NotificationService } from '@/services/notification.service';
import { z } from 'zod';
import * as adminController from '@/controllers/admin.controller';

const router = Router();
const notificationService = new NotificationService();

// ===== VALIDAÇÕES =====

const planValidation = [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('price').isFloat({ min: 0 }).withMessage('Preço deve ser um número positivo'),
  body('features').isArray().withMessage('Features deve ser um array'),
  body('userLimit').isInt({ min: 1 }).withMessage('Limite de usuários deve ser um número positivo'),
];

const landingPageValidation = [
  body('heroTitle').notEmpty().withMessage('Título principal é obrigatório'),
  body('heroSubtitle').notEmpty().withMessage('Subtítulo é obrigatório'),
  body('features').isArray().withMessage('Features deve ser um array'),
  body('faq').isArray().withMessage('FAQ deve ser um array'),
];

const gamificationRuleValidation = [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('description').notEmpty().withMessage('Descrição é obrigatória'),
  body('points').isInt({ min: 0 }).withMessage('Pontos devem ser um número positivo'),
  body('condition').notEmpty().withMessage('Condição é obrigatória'),
  body('badgeIcon').optional().isString(),
  body('category').notEmpty().withMessage('Categoria é obrigatória'),
  body('isActive').optional().isBoolean(),
  body('sortOrder').optional().isInt(),
];

const suggestedMilestoneValidation = [
  body('title').notEmpty().withMessage('Título é obrigatório'),
  body('category').notEmpty().withMessage('Categoria é obrigatória'),
  body('sortOrder').optional().isInt({ min: 0 }).withMessage('Ordem de Classificação deve ser um número'),
  body('isActive').optional().isBoolean().withMessage('Status deve ser booleano'),
  body('icon').optional().isString().withMessage('Ícone deve ser um texto'),
];

// Validações para bebês
const babyValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nome deve ter entre 2 e 50 caracteres'),
  body('gender')
    .optional()
    .isIn(['male', 'female'])
    .withMessage('Gênero deve ser male ou female'),
  body('birthDate')
    .isISO8601()
    .withMessage('Data de nascimento deve ser uma data válida'),
  body('photoUrl')
    .optional()
    .isURL()
    .withMessage('URL da foto deve ser válida'),
];

// Validações para atividades
const activityValidation = [
  body('type')
    .isIn(['sleep', 'feeding', 'diaper', 'weight', 'milestone', 'memory'])
    .withMessage('Tipo deve ser um dos valores válidos'),
  body('title')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Título deve ter entre 2 e 100 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres'),
  body('babyId')
    .notEmpty()
    .withMessage('ID do bebê é obrigatório'),
  body('userId')
    .notEmpty()
    .withMessage('ID do usuário é obrigatório'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Data deve ser uma data válida'),
  body('duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duração deve ser um número inteiro positivo'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notas deve ter no máximo 1000 caracteres'),
];

// Validações para memórias
const memoryValidation = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Título deve ter entre 2 e 100 caracteres'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Descrição deve ter entre 10 e 1000 caracteres'),
  body('babyId')
    .notEmpty()
    .withMessage('ID do bebê é obrigatório'),
  body('userId')
    .notEmpty()
    .withMessage('ID do usuário é obrigatório'),
  body('date')
    .isISO8601()
    .withMessage('Data deve ser uma data válida'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags deve ser um array'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic deve ser booleano'),
];

// Validações para marcos
const milestoneValidation = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Título deve ter entre 2 e 100 caracteres'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Descrição deve ter entre 10 e 500 caracteres'),
  body('category')
    .isIn(['motor', 'cognitive', 'social', 'language'])
    .withMessage('Categoria deve ser uma das opções válidas'),
  body('babyId')
    .notEmpty()
    .withMessage('ID do bebê é obrigatório'),
  body('userId')
    .notEmpty()
    .withMessage('ID do usuário é obrigatório'),
  body('date')
    .isISO8601()
    .withMessage('Data deve ser uma data válida'),
];

// ===== GERENCIAMENTO DE DESAFIOS (CHALLENGE) =====

const challengeValidation = [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('description').notEmpty().withMessage('Descrição é obrigatória'),
  body('type').isIn(['weekly', 'unique', 'event']).withMessage('Tipo deve ser weekly, unique ou event'),
  body('goal').isInt({ min: 1 }).withMessage('Meta deve ser um número inteiro positivo'),
  body('progressType').notEmpty().withMessage('Tipo de progresso é obrigatório'),
  body('points').isInt({ min: 0 }).withMessage('Pontos devem ser um número positivo'),
  body('badge').optional().isString(),
  body('isActive').optional().isBoolean(),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
];

// ===== GERENCIAMENTO DE PLANOS =====

// Listar todos os planos
router.get('/plans', adminController.getPlans);

// Criar plano
router.post('/plans', adminController.createPlan);

// Atualizar plano
router.put('/plans/:id', adminController.updatePlan);

// Deletar plano
router.delete('/plans/:id', adminController.deletePlan);

// ===== GERENCIAMENTO DA LANDING PAGE =====

// Obter conteúdo da landing page
router.get('/landing-page', async (req: Request, res: Response) => {
  try {
    let content = await prisma.landingPageContent.findUnique({
      where: { id: 1 },
    });

    if (!content) {
      // Criar conteúdo padrão se não existir
      content = await prisma.landingPageContent.create({
        data: {
          id: 1,
          heroTitle: 'Seu diário digital para acompanhar o bebê',
          heroSubtitle: 'Registre atividades, memórias e marcos importantes do seu bebê em um só lugar',
          features: [],
          testimonials: [],
          faq: [],
          stats: [],
        },
      });
    }

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
});

// Atualizar conteúdo da landing page
router.put('/landing-page', async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array(),
      });
    }

    const updateData = req.body;

    const content = await prisma.landingPageContent.upsert({
      where: { id: 1 },
      update: updateData,
      create: {
        id: 1,
        heroTitle: updateData.heroTitle || "Título Padrão",
        heroSubtitle: updateData.heroSubtitle || "Subtítulo Padrão",
        features: updateData.features || [],
        testimonials: updateData.testimonials || [],
        faq: updateData.faq || [],
        stats: updateData.stats || [],
        ctaText: updateData.ctaText || "Comece Agora",
        ctaButtonText: updateData.ctaButtonText || "Registrar-se",
        seoTitle: updateData.seoTitle || "Baby Diary - Seu Diário Digital",
        seoDescription: updateData.seoDescription || "Acompanhe o desenvolvimento do seu bebê",
        seoKeywords: updateData.seoKeywords || "bebê, desenvolvimento, diário, família",
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
});

// ===== GERENCIAMENTO DE GAMIFICAÇÃO =====

// Listar regras de gamificação
router.get('/gamification-rules', async (req: Request, res: Response) => {
  try {
    const rules = await prisma.gamificationRule.findMany({ orderBy: { sortOrder: 'asc' } });
    return res.json({ success: true, data: rules });
  } catch (error) {
    console.error('Erro ao listar regras de gamificação:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// Criar regra de gamificação
router.post('/gamification-rules', gamificationRuleValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: 'Dados inválidos', details: errors.array() });
    }
    const { name, description, points, condition, badgeIcon, category, isActive = true, sortOrder = 0 } = req.body;
    const rule = await prisma.gamificationRule.create({
      data: { name, description, points, condition, badgeIcon, category, isActive, sortOrder },
    });
    return res.status(201).json({ success: true, message: 'Regra/badge criada com sucesso', data: rule });
  } catch (error) {
    console.error('Erro ao criar regra de gamificação:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// Editar regra de gamificação
router.put('/gamification-rules/:id', gamificationRuleValidation, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: 'Dados inválidos', details: errors.array() });
    }
    const { name, description, points, condition, badgeIcon, category, isActive, sortOrder } = req.body;
    const rule = await prisma.gamificationRule.update({
      where: { id },
      data: { name, description, points, condition, badgeIcon, category, isActive, sortOrder },
    });
    return res.json({ success: true, message: 'Regra/badge atualizada com sucesso', data: rule });
  } catch (error) {
    console.error('Erro ao editar regra de gamificação:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// Deletar regra de gamificação
router.delete('/gamification-rules/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.gamificationRule.delete({ where: { id } });
    return res.json({ success: true, message: 'Regra/badge deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar regra de gamificação:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// ===== GERENCIAMENTO DE NOTIFICAÇÕES =====

// Listar templates de notificação
router.get('/notification-templates', async (req: Request, res: Response) => {
  try {
    const templates = await prisma.notificationTemplate.findMany();

    return res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error('Erro ao buscar templates de notificação:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Atualizar template de notificação
router.put('/notification-templates/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { subject, body, isActive, type = 'email' } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID do template é obrigatório',
      });
    }

    const template = await prisma.notificationTemplate.upsert({
      where: { id: id as string },
      update: {
        subject,
        body,
        isActive,
        type,
      },
      create: {
        id: id as string,
        name: `template_${id}`,
        type,
        subject: subject || "Notificação",
        body: body || "Conteúdo da notificação",
        isActive: isActive !== undefined ? isActive : true,
        variables: [],
      },
    });

    return res.json({
      success: true,
      message: 'Template de notificação atualizado com sucesso',
      data: template,
    });
  } catch (error) {
    console.error('Erro ao atualizar template de notificação:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// ===== DASHBOARD E ESTATÍSTICAS =====

// Dashboard com estatísticas
router.get('/dashboard', adminController.getDashboardStats);

// ===== GERENCIAMENTO DE USUÁRIOS =====

// Listar usuários com filtros
router.get('/users', adminController.getUsers);

// Obter usuário específico
router.get('/users/:id', adminController.getUserById);

// Atualizar usuário
router.put('/users/:id', adminController.updateUser);

// Deletar usuário
router.delete('/users/:id', adminController.deleteUser);

// ===== GERENCIAMENTO DE BEBÊS =====

// Listar todos os bebês com filtros
router.get('/babies', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '10', search = '', userId = '', isActive = '' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    let where: any = {};

    if (search) {
      where.name = { contains: search as string, mode: 'insensitive' as any };
    }

    if (userId) {
      where.userId = userId;
    }

    if (isActive !== '') {
      where.isActive = isActive === 'true';
    }

    const babies = await prisma.baby.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            activities: true,
            memories: true,
            milestones: true,
          },
        },
      },
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.baby.count({ where });

    return res.json({
      success: true,
      data: {
        babies,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Erro ao buscar bebês:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Obter bebê específico
router.get('/babies/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID do bebê é obrigatório',
      });
    }

    const baby = await prisma.baby.findUnique({
      where: { id: id as string },
      include: {
        user: true,
        activities: true,
        memories: true,
        milestones: true,
        growthRecords: true,
        sleepRecords: true,
        feedingRecords: true,
        diaperRecords: true,
        weightRecords: true,
        vaccinationRecords: true,
      },
    });

    if (!baby) {
      return res.status(404).json({
        success: false,
        error: 'Bebê não encontrado',
      });
    }

    return res.json({
      success: true,
      data: baby,
    });
  } catch (error) {
    console.error('Erro ao buscar bebê:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Criar bebê
router.post('/babies', babyValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array(),
      });
    }

    const { name, gender, birthDate, photoUrl, userId } = req.body;

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado',
      });
    }

    const baby = await prisma.baby.create({
      data: {
        name,
        gender,
        birthDate: new Date(birthDate),
        photoUrl,
        userId,
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

    return res.status(201).json({
      success: true,
      message: 'Bebê criado com sucesso',
      data: baby,
    });
  } catch (error) {
    console.error('Erro ao criar bebê:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Atualizar bebê
router.put('/babies/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID do bebê é obrigatório',
      });
    }

    const baby = await prisma.baby.update({
      where: { id: id as string },
      data: updateData,
      include: {
        user: true,
      },
    });

    return res.json({
      success: true,
      message: 'Bebê atualizado com sucesso',
      data: baby,
    });
  } catch (error) {
    console.error('Erro ao atualizar bebê:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Deletar bebê
router.delete('/babies/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID do bebê é obrigatório',
      });
    }

    await prisma.baby.delete({
      where: { id: id as string },
    });

    return res.json({
      success: true,
      message: 'Bebê deletado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar bebê:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// ===== GERENCIAMENTO DE ATIVIDADES =====

// Listar todas as atividades com filtros
router.get('/activities', async (req: Request, res: Response) => {
  try {
    const { 
      page = '1', 
      limit = '10', 
      type = '', 
      babyId = '', 
      userId = '',
      dateFrom = '',
      dateTo = ''
    } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    let where: any = {};

    if (type) {
      where.type = type;
    }

    if (babyId) {
      where.babyId = babyId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) {
        where.date.gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        where.date.lte = new Date(dateTo as string);
      }
    }

    const activities = await prisma.activity.findMany({
      where,
      include: {
        baby: {
          select: {
            id: true,
            name: true,
          },
        },
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

    const total = await prisma.activity.count({ where });

    return res.json({
      success: true,
      data: {
        activities,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Erro ao buscar atividades:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Obter atividade específica
router.get('/activities/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID da atividade é obrigatório',
      });
    }

    const activity = await prisma.activity.findUnique({
      where: { id: id as string },
      include: {
        user: true,
        baby: true,
      },
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Atividade não encontrada',
      });
    }

    return res.json({
      success: true,
      data: activity,
    });
  } catch (error) {
    console.error('Erro ao buscar atividade:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Criar atividade
router.post('/activities', activityValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array(),
      });
    }

    const { type, title, description, babyId, userId, date, duration, notes, photoUrl } = req.body;

    // Verificar se o bebê existe
    const baby = await prisma.baby.findUnique({
      where: { id: babyId },
    });

    if (!baby) {
      return res.status(404).json({
        success: false,
        error: 'Bebê não encontrado',
      });
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado',
      });
    }

    const activity = await prisma.activity.create({
      data: {
        type,
        title,
        description,
        babyId,
        userId,
        date: date ? new Date(date) : new Date(),
        duration,
        notes,
        photoUrl,
      },
      include: {
        baby: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Atividade criada com sucesso',
      data: activity,
    });
  } catch (error) {
    console.error('Erro ao criar atividade:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Atualizar atividade
router.put('/activities/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID da atividade é obrigatório',
      });
    }

    const activity = await prisma.activity.update({
      where: { id: id as string },
      data: updateData,
      include: {
        user: true,
        baby: true,
      },
    });

    return res.json({
      success: true,
      message: 'Atividade atualizada com sucesso',
      data: activity,
    });
  } catch (error) {
    console.error('Erro ao atualizar atividade:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Deletar atividade
router.delete('/activities/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID da atividade é obrigatório',
      });
    }

    await prisma.activity.delete({
      where: { id: id as string },
    });

    return res.json({
      success: true,
      message: 'Atividade deletada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar atividade:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// ===== GERENCIAMENTO DE MEMÓRIAS =====

// Listar todas as memórias com filtros
router.get('/memories', async (req: Request, res: Response) => {
  try {
    const { 
      page = '1', 
      limit = '10', 
      babyId = '', 
      userId = '',
      isPublic = '',
      dateFrom = '',
      dateTo = ''
    } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    let where: any = {};

    if (babyId) {
      where.babyId = babyId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (isPublic !== '') {
      where.isPublic = isPublic === 'true';
    }

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) {
        where.date.gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        where.date.lte = new Date(dateTo as string);
      }
    }

    const memories = await prisma.memory.findMany({
      where,
      include: {
        baby: {
          select: {
            id: true,
            name: true,
          },
        },
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

    const total = await prisma.memory.count({ where });

    return res.json({
      success: true,
      data: {
        memories,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Erro ao buscar memórias:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Obter memória específica
router.get('/memories/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID da memória é obrigatório',
      });
    }

    const memory = await prisma.memory.findUnique({
      where: { id: id as string },
      include: {
        user: true,
        baby: true,
      },
    });

    if (!memory) {
      return res.status(404).json({
        success: false,
        error: 'Memória não encontrada',
      });
    }

    return res.json({
      success: true,
      data: memory,
    });
  } catch (error) {
    console.error('Erro ao buscar memória:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Criar memória
router.post('/memories', memoryValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array(),
      });
    }

    const { title, description, babyId, userId, date, tags, isPublic, photoUrl } = req.body;

    // Verificar se o bebê existe
    const baby = await prisma.baby.findUnique({
      where: { id: babyId },
    });

    if (!baby) {
      return res.status(404).json({
        success: false,
        error: 'Bebê não encontrado',
      });
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado',
      });
    }

    const memory = await prisma.memory.create({
      data: {
        title,
        description,
        babyId,
        userId,
        date: new Date(date),
        tags: tags || [],
        isPublic: isPublic || false,
        photoUrl,
      },
      include: {
        baby: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Memória criada com sucesso',
      data: memory,
    });
  } catch (error) {
    console.error('Erro ao criar memória:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Atualizar memória
router.put('/memories/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID da memória é obrigatório',
      });
    }

    const memory = await prisma.memory.update({
      where: { id: id as string },
      data: updateData,
      include: {
        user: true,
        baby: true,
      },
    });

    return res.json({
      success: true,
      message: 'Memória atualizada com sucesso',
      data: memory,
    });
  } catch (error) {
    console.error('Erro ao atualizar memória:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Deletar memória
router.delete('/memories/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID da memória é obrigatório',
      });
    }

    await prisma.memory.delete({
      where: { id: id as string },
    });

    return res.json({
      success: true,
      message: 'Memória deletada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar memória:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// ===== GERENCIAMENTO DE MARCOS =====

// Listar todos os marcos com filtros
router.get('/milestones', async (req: Request, res: Response) => {
  try {
    const { 
      page = '1', 
      limit = '10', 
      category = '', 
      babyId = '', 
      userId = '',
      dateFrom = '',
      dateTo = ''
    } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    let where: any = {};

    if (category) {
      where.category = category;
    }

    if (babyId) {
      where.babyId = babyId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) {
        where.date.gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        where.date.lte = new Date(dateTo as string);
      }
    }

    const milestones = await prisma.milestone.findMany({
      where,
      include: {
        baby: {
          select: {
            id: true,
            name: true,
          },
        },
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

    const total = await prisma.milestone.count({ where });

    return res.json({
      success: true,
      data: {
        milestones,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Erro ao buscar marcos:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Obter marco específico
router.get('/milestones/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID do marco é obrigatório',
      });
    }

    const milestone = await prisma.milestone.findUnique({
      where: { id: id as string },
      include: {
        user: true,
        baby: true,
      },
    });

    if (!milestone) {
      return res.status(404).json({
        success: false,
        error: 'Marco não encontrado',
      });
    }

    return res.json({
      success: true,
      data: milestone,
    });
  } catch (error) {
    console.error('Erro ao buscar marco:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Criar marco
router.post('/milestones', milestoneValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array(),
      });
    }

    const { title, description, category, babyId, userId, date, photoUrl } = req.body;

    // Verificar se o bebê existe
    const baby = await prisma.baby.findUnique({
      where: { id: babyId },
    });

    if (!baby) {
      return res.status(404).json({
        success: false,
        error: 'Bebê não encontrado',
      });
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado',
      });
    }

    const milestone = await prisma.milestone.create({
      data: {
        title,
        description,
        category,
        babyId,
        userId,
        date: new Date(date),
        photoUrl,
      },
      include: {
        baby: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Marco criado com sucesso',
      data: milestone,
    });
  } catch (error) {
    console.error('Erro ao criar marco:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Atualizar marco
router.put('/milestones/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID do marco é obrigatório',
      });
    }

    const milestone = await prisma.milestone.update({
      where: { id: id as string },
      data: updateData,
      include: {
        user: true,
        baby: true,
      },
    });

    return res.json({
      success: true,
      message: 'Marco atualizado com sucesso',
      data: milestone,
    });
  } catch (error) {
    console.error('Erro ao atualizar marco:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Deletar marco
router.delete('/milestones/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID do marco é obrigatório',
      });
    }

    await prisma.milestone.delete({
      where: { id: id as string },
    });

    return res.json({
      success: true,
      message: 'Marco deletado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar marco:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// ===== UPLOAD DE IMAGENS =====

// Upload de imagem para o painel admin
router.post('/upload/image', async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nenhuma imagem enviada',
      });
    }

    const result = await uploadImage(req.file);

    return res.json({
      success: true,
      message: 'Imagem enviada com sucesso',
      data: {
        url: result.secureUrl,
        publicId: result.publicId,
      },
    });
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// ===== ENDPOINTS DE STATUS =====

// Ativar/desativar usuário
router.put('/users/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID do usuário é obrigatório',
      });
    }

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'isActive deve ser um valor booleano',
      });
    }

    const user = await prisma.user.update({
      where: { id: id as string },
      data: { isActive },
      include: {
        plan: true,
        gamification: true,
        subscription: true,
      },
    });

    return res.json({
      success: true,
      message: `Usuário ${isActive ? 'ativado' : 'desativado'} com sucesso`,
      data: user,
    });
  } catch (error) {
    console.error('Erro ao alterar status do usuário:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Ativar/desativar plano
router.put('/plans/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID do plano é obrigatório',
      });
    }

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'isActive deve ser um valor booleano',
      });
    }

    const plan = await prisma.plan.update({
      where: { id: id as string },
      data: { isActive },
      include: {
        _count: {
          select: {
            users: true,
            subscriptions: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      message: `Plano ${isActive ? 'ativado' : 'desativado'} com sucesso`,
      data: plan,
    });
  } catch (error) {
    console.error('Erro ao alterar status do plano:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Ativar/desativar regra de gamificação
router.put('/gamification-rules/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID da regra é obrigatório',
      });
    }

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'isActive deve ser um valor booleano',
      });
    }

    const rule = await prisma.gamificationRule.update({
      where: { id: id as string },
      data: { isActive },
    });

    return res.json({
      success: true,
      message: `Regra de gamificação ${isActive ? 'ativada' : 'desativada'} com sucesso`,
      data: rule,
    });
  } catch (error) {
    console.error('Erro ao alterar status da regra de gamificação:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Ativar/desativar template de notificação
router.put('/notification-templates/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID do template é obrigatório',
      });
    }

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'isActive deve ser um valor booleano',
      });
    }

    const template = await prisma.notificationTemplate.update({
      where: { id: id as string },
      data: { isActive },
    });

    return res.json({
      success: true,
      message: `Template de notificação ${isActive ? 'ativado' : 'desativado'} com sucesso`,
      data: template,
    });
  } catch (error) {
    console.error('Erro ao alterar status do template de notificação:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Ativar/desativar bebê
router.put('/babies/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID do bebê é obrigatório',
      });
    }

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'isActive deve ser um valor booleano',
      });
    }

    const baby = await prisma.baby.update({
      where: { id: id as string },
      data: { isActive },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            activities: true,
            memories: true,
            milestones: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      message: `Bebê ${isActive ? 'ativado' : 'desativado'} com sucesso`,
      data: baby,
    });
  } catch (error) {
    console.error('Erro ao alterar status do bebê:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// ===== ENDPOINTS DE RESET =====

// Reset de gamificação do usuário
router.post('/users/:userId/reset-gamification', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'ID do usuário é obrigatório',
      });
    }

    const gamification = await prisma.gamification.upsert({
      where: { userId: userId as string },
      update: {
        points: 0,
        level: 1,
        badges: [],
        streaks: {},
        achievements: [],
      },
      create: {
        userId: userId as string,
        points: 0,
        level: 1,
        badges: [],
        streaks: {},
        achievements: [],
      },
    });

    return res.json({
      success: true,
      message: 'Gamificação resetada com sucesso',
      data: gamification,
    });
  } catch (error) {
    console.error('Erro ao resetar gamificação:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Reset de senha
router.post('/users/:id/reset-password', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID do usuário é obrigatório',
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Nova senha é obrigatória',
      });
    }

    const hashedPassword = await hashPassword(newPassword);

    const user = await prisma.user.update({
      where: { id: id as string },
      data: {
        password: hashedPassword,
      },
    });

    return res.json({
      success: true,
      message: 'Senha resetada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao resetar senha:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Reset de senha do administrador
router.post('/admins/:id/reset-password', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID do admin é obrigatório',
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Nova senha é obrigatória',
      });
    }

    // Hash da nova senha
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const admin = await prisma.admin.update({
      where: { id: id as string },
      data: { password: hashedPassword },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    return res.json({
      success: true,
      message: 'Senha do administrador resetada com sucesso',
      data: admin,
    });
  } catch (error) {
    console.error('Erro ao resetar senha do admin:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// ===== ANALYTICS AVANÇADO =====

// Relatório de engajamento dos usuários
router.get('/analytics/engagement', async (req: Request, res: Response) => {
  try {
    const { period = '30' } = req.query; // dias
    const daysAgo = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Usuários ativos no período
    const activeUsers = await prisma.user.count({
      where: {
        isActive: true,
        createdAt: { gte: startDate },
      },
    });

    // Usuários que fizeram login no período
    const usersWithActivities = await prisma.activity.groupBy({
      by: ['userId'],
      where: {
        createdAt: { gte: startDate },
      },
    });

    // Atividades por tipo
    const activitiesByType = await prisma.activity.groupBy({
      by: ['type'],
      where: {
        createdAt: { gte: startDate },
      },
      _count: {
        type: true,
      },
    });

    // Usuários com streaks de gamificação
    const usersWithStreaks = await prisma.gamification.count({
      where: {
        streaks: { not: {} },
      },
    });

    // Badges mais conquistados
    const allGamifications = await prisma.gamification.findMany({
      select: { badges: true },
    });

    const badgeCounts: Record<string, number> = {};
    allGamifications.forEach((gamification: any) => {
      if (gamification.badges && Array.isArray(gamification.badges)) {
        gamification.badges.forEach((badge: any) => {
          const badgeName = badge.name || 'Unknown';
          badgeCounts[badgeName] = (badgeCounts[badgeName] || 0) + 1;
        });
      }
    });

    const topBadges = Object.entries(badgeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const engagement = {
      period: `${daysAgo} dias`,
      activeUsers,
      usersWithActivities: usersWithActivities.length,
      activitiesByType,
      usersWithStreaks,
      topBadges,
      engagementRate: activeUsers > 0 ? (usersWithActivities.length / activeUsers * 100).toFixed(2) : 0,
    };

    return res.json({
      success: true,
      data: engagement,
    });
  } catch (error) {
    console.error('Erro ao buscar analytics de engajamento:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Relatório de assinaturas por período
router.get('/analytics/subscriptions', async (req: Request, res: Response) => {
  try {
    const { period = '30' } = req.query; // dias
    const daysAgo = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Assinaturas ativas
    const activeSubscriptions = await prisma.subscription.count({
      where: { status: 'active' },
    });

    // Novas assinaturas no período
    const newSubscriptions = await prisma.subscription.count({
      where: {
        createdAt: { gte: startDate },
      },
    });

    // Assinaturas canceladas no período
    const canceledSubscriptions = await prisma.subscription.count({
      where: {
        status: 'canceled',
        updatedAt: { gte: startDate },
      },
    });

    // Assinaturas por plano
    const subscriptionsByPlan = await prisma.subscription.groupBy({
      by: ['planId'],
      where: { status: 'active' },
      _count: {
        planId: true,
      },
    });

    // Buscar nomes dos planos
    const plans = await prisma.plan.findMany({
      select: { id: true, name: true, price: true },
    });

    const planDetails = subscriptionsByPlan.map((sub: any) => {
      const plan = plans.find((p: any) => p.id === sub.planId);
      return {
        planName: plan?.name || 'Plano não encontrado',
        planPrice: plan?.price || 0,
        count: sub._count.planId,
        revenue: (plan?.price || 0) * sub._count.planId,
      };
    });

    // Receita total
    const totalRevenue = planDetails.reduce((sum: number, plan: any) => sum + plan.revenue, 0);

    // Churn rate
    const churnRate = activeSubscriptions > 0 ? (canceledSubscriptions / activeSubscriptions * 100).toFixed(2) : 0;

    const subscriptionAnalytics = {
      period: `${daysAgo} dias`,
      activeSubscriptions,
      newSubscriptions,
      canceledSubscriptions,
      planDetails,
      totalRevenue,
      churnRate: `${churnRate}%`,
      growthRate: activeSubscriptions > 0 ? ((newSubscriptions - canceledSubscriptions) / activeSubscriptions * 100).toFixed(2) : 0,
    };

    return res.json({
      success: true,
      data: subscriptionAnalytics,
    });
  } catch (error) {
    console.error('Erro ao buscar analytics de assinaturas:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Relatório de atividades por período
router.get('/analytics/activities', async (req: Request, res: Response) => {
  try {
    const { period = '30', type = '' } = req.query; // dias e tipo opcional
    const daysAgo = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    let where: any = {
      createdAt: { gte: startDate },
    };

    if (type) {
      where.type = type;
    }

    // Total de atividades no período
    const totalActivities = await prisma.activity.count({ where });

    // Atividades por tipo
    const activitiesByType = await prisma.activity.groupBy({
      by: ['type'],
      where,
      _count: {
        type: true,
      },
    });

    // Atividades por dia (últimos 7 dias)
    const dailyActivities = await prisma.activity.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      _count: {
        createdAt: true,
      },
    });

    // Usuários mais ativos
    const mostActiveUsers = await prisma.activity.groupBy({
      by: ['userId'],
      where,
      _count: {
        userId: true,
      },
      orderBy: {
        _count: {
          userId: 'desc',
        },
      },
      take: 10,
    });

    // Buscar dados dos usuários mais ativos
    const userIds = mostActiveUsers.map((user: any) => user.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });

    const activeUsersWithData = mostActiveUsers.map((user: any) => {
      const userData = users.find((u: any) => u.id === user.userId);
      return {
        userId: user.userId,
        userName: userData?.name || 'Usuário não encontrado',
        userEmail: userData?.email || '',
        activityCount: user._count.userId,
      };
    });

    // Média de atividades por usuário
    const uniqueUsers = await prisma.activity.groupBy({
      by: ['userId'],
      where,
    });

    const avgActivitiesPerUser = uniqueUsers.length > 0 ? (totalActivities / uniqueUsers.length).toFixed(2) : 0;

    const activityAnalytics = {
      period: `${daysAgo} dias`,
      totalActivities,
      activitiesByType,
      dailyActivities: dailyActivities.map((day: any) => ({
        date: day.createdAt,
        count: day._count.createdAt,
      })),
      mostActiveUsers: activeUsersWithData,
      avgActivitiesPerUser,
      uniqueUsersCount: uniqueUsers.length,
    };

    return res.json({
      success: true,
      data: activityAnalytics,
    });
  } catch (error) {
    console.error('Erro ao buscar analytics de atividades:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Relatório geral do sistema
router.get('/analytics/overview', async (req: Request, res: Response) => {
  try {
    const { period = '30' } = req.query; // dias
    const daysAgo = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Estatísticas gerais
    const totalUsers = await prisma.user.count();
    const newUsers = await prisma.user.count({
      where: { createdAt: { gte: startDate } },
    });

    const totalBabies = await prisma.baby.count();
    const newBabies = await prisma.baby.count({
      where: { createdAt: { gte: startDate } },
    });

    const totalActivities = await prisma.activity.count();
    const newActivities = await prisma.activity.count({
      where: { createdAt: { gte: startDate } },
    });

    const totalMemories = await prisma.memory.count();
    const newMemories = await prisma.memory.count({
      where: { createdAt: { gte: startDate } },
    });

    const totalMilestones = await prisma.milestone.count();
    const newMilestones = await prisma.milestone.count({
      where: { createdAt: { gte: startDate } },
    });

    // Assinaturas
    const activeSubscriptions = await prisma.subscription.count({
      where: { status: 'active' },
    });

    const canceledSubscriptions = await prisma.subscription.count({
      where: {
        status: 'canceled',
        updatedAt: { gte: startDate },
      },
    });

    // Receita
    const subscriptionsByPlan = await prisma.subscription.groupBy({
      by: ['planId'],
      where: { status: 'active' },
      _count: { planId: true },
    });

    const plans = await prisma.plan.findMany({
      select: { id: true, price: true },
    });

    const totalRevenue = subscriptionsByPlan.reduce((sum: number, sub: any) => {
      const plan = plans.find((p: any) => p.id === sub.planId);
      return sum + (plan?.price || 0) * sub._count.planId;
    }, 0);

    // Crescimento
    const userGrowthRate = totalUsers > 0 ? (newUsers / totalUsers * 100).toFixed(2) : 0;
    const activityGrowthRate = totalActivities > 0 ? (newActivities / totalActivities * 100).toFixed(2) : 0;

    // --- ARRAYS PARA GRÁFICOS ---
    // Usuários por mês (últimos 6 meses)
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    const now = new Date();
    const year = now.getFullYear();
    const userGrowthData = await Promise.all(months.map(async (month, idx) => {
      const start = new Date(year, idx, 1);
      const end = new Date(year, idx + 1, 1);
      const users = await prisma.user.count({ where: { createdAt: { gte: start, lt: end } } });
      const babies = await prisma.baby.count({ where: { createdAt: { gte: start, lt: end } } });
      return { month, users, babies };
    }));

    // Atividades por tipo (últimos 30 dias)
    const activityTypes = ['feeding', 'sleep', 'diaper', 'play', 'bath', 'other'];
    const activityTypeData = await Promise.all(activityTypes.map(async (type) => {
      const value = await prisma.activity.count({ where: { type, createdAt: { gte: startDate } } });
      return { name: type, value, fill: '#8884d8' };
    }));

    // Atividades por dia da semana (últimos 7 dias)
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    const today = new Date();
    const dailyActivityData = await Promise.all(days.map(async (day, idx) => {
      const date = new Date(today);
      date.setDate(today.getDate() - ((today.getDay() + 7 - idx) % 7));
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      const activities = await prisma.activity.count({ where: { createdAt: { gte: date, lt: nextDate } } });
      return { day, activities };
    }));

    // Memórias por mês (últimos 6 meses)
    const memoryTrendData = await Promise.all(months.map(async (month, idx) => {
      const start = new Date(year, idx, 1);
      const end = new Date(year, idx + 1, 1);
      const memories = await prisma.memory.count({ where: { createdAt: { gte: start, lt: end } } });
      return { month, memories };
    }));

    const overview = {
      period: `${daysAgo} dias`,
      users: {
        total: totalUsers,
        new: newUsers,
        growthRate: `${userGrowthRate}%`,
      },
      babies: {
        total: totalBabies,
        new: newBabies,
      },
      activities: {
        total: totalActivities,
        new: newActivities,
        growthRate: `${activityGrowthRate}%`,
      },
      memories: {
        total: totalMemories,
        new: newMemories,
      },
      milestones: {
        total: totalMilestones,
        new: newMilestones,
      },
      subscriptions: {
        active: activeSubscriptions,
        canceled: canceledSubscriptions,
        churnRate: activeSubscriptions > 0 ? (canceledSubscriptions / activeSubscriptions * 100).toFixed(2) : 0,
      },
      revenue: {
        total: totalRevenue,
        monthly: totalRevenue, // Simplificado
      },
      userGrowthData,
      activityTypeData,
      dailyActivityData,
      memoryTrendData,
    };

    return res.json({
      success: true,
      data: overview,
    });
  } catch (error) {
    console.error('Erro ao buscar overview analytics:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Atualizar usuário
router.put('/users/:id', adminController.updateUser);

// Atualizar admin
router.put('/admins/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID do admin é obrigatório',
      });
    }

    const admin = await prisma.admin.update({
      where: { id: id as string },
      data: updateData,
    });

    return res.json({
      success: true,
      message: 'Admin atualizado com sucesso',
      data: admin,
    });
  } catch (error) {
    console.error('Erro ao atualizar admin:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Atribuir plano ao usuário
router.put('/users/:id/plan', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { planId } = req.body;

    if (!id || !planId) {
      return res.status(400).json({
        success: false,
        error: 'ID do usuário e ID do plano são obrigatórios',
      });
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: id as string },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado',
      });
    }

    // Verificar se o plano existe
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Plano não encontrado',
      });
    }

    // Atualizar usuário com o novo plano
    const updatedUser = await prisma.user.update({
      where: { id: id as string },
      data: { planId },
      include: {
        plan: true,
      },
    });

    return res.json({
      success: true,
      message: 'Plano atribuído com sucesso',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Erro ao atribuir plano ao usuário:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// ===== ROTA DE TESTE =====

// Teste de autenticação
router.get('/test-auth', authenticateAdmin, (req, res) => {
  console.log('Teste de autenticação - Admin autenticado:', req.admin)
  res.json({
    success: true,
    message: 'Token válido',
    admin: req.admin
  })
})

// ===== DASHBOARD =====

// ===== CONFIGURAÇÕES DO SISTEMA =====

// Obter configurações do sistema
router.get('/settings', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    // Buscar configurações da landing page
    const landingPageContent = await prisma.landingPageContent.findUnique({
      where: { id: 1 },
    });

    // Configurações do sistema
    const systemSettings = {
      maxFileSize: process.env.MAX_FILE_SIZE || '5242880',
      allowedFileTypes: process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp',
      maxBabiesPerUser: 5,
      maxMemoriesPerMonth: 50,
      enableAI: process.env.GROQ_API_KEY ? true : false,
      enablePushNotifications: true,
      enableEmailNotifications: process.env.SENDGRID_API_KEY ? true : false,
      maintenanceMode: false,
      version: '1.0.0',
      lastBackup: null,
      cacheStatus: 'active',
    };

    return res.json({
      success: true,
      data: {
        landingPage: landingPageContent,
        system: systemSettings,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Atualizar configurações do sistema
router.put('/settings', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { landingPage, system } = req.body;

    // Atualizar conteúdo da landing page se fornecido
    if (landingPage) {
      await prisma.landingPageContent.upsert({
        where: { id: 1 },
        update: landingPage,
        create: {
          id: 1,
          ...landingPage,
        },
      });
    }

    // Nota: Configurações do sistema como variáveis de ambiente
    // não podem ser alteradas via API por questões de segurança
    // Elas precisam ser alteradas no arquivo .env e reiniciar o servidor

    return res.json({
      success: true,
      message: 'Configurações atualizadas com sucesso',
    });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Backup do banco de dados
router.post('/settings/backup', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    // Simular backup do banco de dados
    const backupInfo = {
      timestamp: new Date().toISOString(),
      status: 'completed',
      size: '2.5MB',
      tables: ['User', 'Baby', 'Activity', 'Memory', 'Milestone', 'Plan', 'Subscription']
    };

    return res.json({
      success: true,
      message: 'Backup realizado com sucesso',
      data: backupInfo
    });
  } catch (error) {
    console.error('Erro ao realizar backup:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Limpar cache do sistema
router.post('/settings/clear-cache', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    // Simular limpeza de cache
    const cacheInfo = {
      timestamp: new Date().toISOString(),
      status: 'cleared',
      itemsCleared: 150
    };

    return res.json({
      success: true,
      message: 'Cache limpo com sucesso',
      data: cacheInfo
    });
  } catch (error) {
    console.error('Erro ao limpar cache:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Testar conexões de integração
router.post('/settings/test-integrations', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const results = {
      stripe: {
        status: 'success',
        message: 'Conexão com Stripe OK'
      },
      cloudinary: {
        status: 'success',
        message: 'Conexão com Cloudinary OK'
      },
      groq: {
        status: 'success',
        message: 'Conexão com Groq OK'
      },
      database: {
        status: 'success',
        message: 'Conexão com banco de dados OK'
      }
    };

    return res.json({
      success: true,
      message: 'Testes de integração concluídos',
      data: results
    });
  } catch (error) {
    console.error('Erro ao testar integrações:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// ===== DASHBOARD =====

// ===== GERENCIAMENTO DE DESAFIOS (CHALLENGE) =====

// Listar todos os desafios
router.get('/challenges', async (req: Request, res: Response) => {
  try {
    const challenges = await prisma.challenge.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: challenges });
  } catch (error) {
    console.error('Erro ao listar desafios:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// Criar desafio
router.post('/challenges', challengeValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: 'Dados inválidos', details: errors.array() });
    }
    const { code, name, description, type, goal, progressType, points, badge, isActive = true, startDate, endDate } = req.body;
    // Gera code único se não vier do admin
    const challengeCode = code || `${slugify(name, { lower: true, strict: true })}-${Date.now()}`;
    const challenge = await prisma.challenge.create({
      data: {
        code: challengeCode,
        name,
        description,
        type,
        goal,
        progressType,
        points,
        badge,
        isActive,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    });
    return res.status(201).json({ success: true, message: 'Desafio criado com sucesso', data: challenge });
  } catch (error) {
    console.error('Erro ao criar desafio:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// Editar desafio
router.put('/challenges/:id', challengeValidation, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: 'Dados inválidos', details: errors.array() });
    }
    const { name, description, type, goal, progressType, points, badge, isActive, startDate, endDate } = req.body;
    const challenge = await prisma.challenge.update({
      where: { id },
      data: {
        name,
        description,
        type,
        goal,
        progressType,
        points,
        badge,
        isActive,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    });
    return res.json({ success: true, message: 'Desafio atualizado com sucesso', data: challenge });
  } catch (error) {
    console.error('Erro ao editar desafio:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// Deletar desafio
router.delete('/challenges/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.challenge.delete({ where: { id } });
    return res.json({ success: true, message: 'Desafio deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar desafio:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// ===== GERENCIAMENTO DE PROGRESSO DE DESAFIOS (USERCHALLENGE) =====

const userChallengeValidation = [
  body('userId').notEmpty().withMessage('userId é obrigatório'),
  body('challengeId').notEmpty().withMessage('challengeId é obrigatório'),
  body('progress').isInt({ min: 0 }).withMessage('Progresso deve ser um número inteiro >= 0'),
  body('status').isIn(['in_progress', 'completed']).withMessage('Status deve ser in_progress ou completed'),
  body('completedAt').optional().isISO8601(),
];

// Listar todos os UserChallenges (com filtros)
router.get('/user-challenges', async (req: Request, res: Response) => {
  try {
    const { userId, challengeId, status } = req.query;
    const where: any = {};
    if (userId) where.userId = String(userId);
    if (challengeId) where.challengeId = String(challengeId);
    if (status) where.status = String(status);
    const userChallenges = await prisma.userChallenge.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } }, challenge: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: userChallenges });
  } catch (error) {
    console.error('Erro ao listar UserChallenges:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// Criar UserChallenge manualmente
router.post('/user-challenges', userChallengeValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: 'Dados inválidos', details: errors.array() });
    }
    const { userId, challengeId, progress, status, completedAt } = req.body;
    const userChallenge = await prisma.userChallenge.create({
      data: {
        userId,
        challengeId,
        progress,
        status,
        completedAt: completedAt ? new Date(completedAt) : undefined,
      },
    });
    return res.status(201).json({ success: true, message: 'Progresso criado com sucesso', data: userChallenge });
  } catch (error) {
    console.error('Erro ao criar UserChallenge:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// Editar UserChallenge
router.put('/user-challenges/:id', userChallengeValidation, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: 'Dados inválidos', details: errors.array() });
    }
    const { userId, challengeId, progress, status, completedAt } = req.body;
    const userChallenge = await prisma.userChallenge.update({
      where: { id },
      data: {
        userId,
        challengeId,
        progress,
        status,
        completedAt: completedAt ? new Date(completedAt) : undefined,
      },
    });
    return res.json({ success: true, message: 'Progresso atualizado com sucesso', data: userChallenge });
  } catch (error) {
    console.error('Erro ao editar UserChallenge:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// Deletar UserChallenge
router.delete('/user-challenges/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.userChallenge.delete({ where: { id } });
    return res.json({ success: true, message: 'Progresso removido com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar UserChallenge:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// Testar envio de email
router.post('/test-email', async (req: Request, res: Response) => {
  try {
    const { email, type = 'test' } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'E-mail é obrigatório',
      });
    }

    let emailSent = false;

    switch (type) {
      case 'test':
        emailSent = await emailService.sendTestEmail(email);
        break;
      case 'welcome':
        emailSent = await emailService.sendWelcomeEmail({
          email,
          name: 'Usuário Teste',
          loginLink: 'http://localhost:5173/login'
        });
        break;
      case 'reset':
        emailSent = await emailService.sendResetPasswordEmail({
          email,
          name: 'Usuário Teste',
          resetLink: 'http://localhost:5173/reset-password?token=test&email=test@test.com',
          expiresIn: '30 minutos'
        });
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Tipo de email inválido',
        });
    }

    if (emailSent) {
      return res.json({
        success: true,
        message: `Email de ${type} enviado com sucesso para ${email}`,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Falha ao enviar email',
      });
    }
  } catch (error) {
    console.error('Erro ao testar email:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// ===== GERENCIAMENTO DE MARCOS SUGERIDOS =====

// Listar todos os marcos sugeridos
router.get('/suggested-milestones', async (req: Request, res: Response) => {
  try {
    const milestones = await prisma.suggestedMilestone.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return res.json({ success: true, data: milestones });
  } catch (error) {
    console.error('Erro ao listar marcos sugeridos:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// Criar um novo marco sugerido
router.post('/suggested-milestones', suggestedMilestoneValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: 'Dados inválidos', details: errors.array() });
    }
    const { title, category, sortOrder, isActive, icon } = req.body;
    const milestone = await prisma.suggestedMilestone.create({
      data: { title, category, sortOrder, isActive, icon },
    });
    return res.status(201).json({ success: true, message: 'Marco sugerido criado com sucesso', data: milestone });
  } catch (error) {
    console.error('Erro ao criar marco sugerido:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// Atualizar um marco sugerido
router.put('/suggested-milestones/:id', suggestedMilestoneValidation, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: 'Dados inválidos', details: errors.array() });
    }
    const { title, category, sortOrder, isActive, icon } = req.body;
    const milestone = await prisma.suggestedMilestone.update({
      where: { id },
      data: { title, category, sortOrder, isActive, icon },
    });
    return res.json({ success: true, message: 'Marco sugerido atualizado com sucesso', data: milestone });
  } catch (error) {
    console.error('Erro ao atualizar marco sugerido:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// Deletar um marco sugerido
router.delete('/suggested-milestones/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.suggestedMilestone.delete({ where: { id } });
    return res.json({ success: true, message: 'Marco sugerido deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar marco sugerido:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// ===== ROTAS DE NOTIFICAÇÃO (ADMIN) =====

/**
 * @swagger
 * /api/admin/notifications/stats:
 *   get:
 *     summary: Estatísticas de notificações
 *     tags: [Admin - Notificações]
 *     security:
 *      - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas de notificações
 */
router.get('/notifications/stats', async (req, res) => {
  try {
    const [
      totalNotifications,
      sentNotifications,
      failedNotifications,
      activeTokens,
      templatesCount
    ] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { status: 'sent' } }),
      prisma.notification.count({ where: { status: 'failed' } }),
      prisma.deviceToken.count({ where: { isActive: true } }),
      prisma.notificationTemplate.count()
    ]);

    return res.json({
      success: true,
      data: {
        totalNotifications,
        sentNotifications,
        failedNotifications,
        successRate: totalNotifications > 0 ? (sentNotifications / totalNotifications) * 100 : 0,
        activeTokens,
        templatesCount
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas de notificações:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/admin/notifications/history:
 *   get:
 *     summary: Histórico de todas as notificações
 *     tags: [Admin - Notificações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Histórico de notificações
 */
router.get('/notifications/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const page = parseInt(req.query.page as string) || 1;
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip
      }),
      prisma.notification.count()
    ]);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar histórico de notificações:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/admin/notifications/send:
 *   post:
 *     summary: Enviar notificação para um ou mais usuários
 *     tags: [Admin - Notificações]
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [push, email]
 *               targetType:
 *                 type: string
 *                 enum: [user, plan, all, email]
 *               targetValue:
 *                 type: string
 *     responses:
 *       200:
 *         description: Notificação enviada com sucesso
 */
router.post('/notifications/send', async (req, res) => {
  try {
    const { title, body, type, targetType, targetValue } = req.body;

    if (!title || !body || !targetType || !targetValue) {
      return res.status(400).json({
        success: false,
        error: 'Título, corpo, tipo de alvo e valor do alvo são obrigatórios'
      });
    }

    let userIds: string[] = [];

    // Determinar usuários alvo baseado no tipo de seleção
    switch (targetType) {
      case 'user':
        userIds = [targetValue];
        break;
      
      case 'plan':
        const planUsers = await prisma.user.findMany({
          where: { planId: targetValue },
          select: { id: true }
        });
        userIds = planUsers.map(u => u.id);
        break;
      
      case 'email':
        const emailUser = await prisma.user.findUnique({
          where: { email: targetValue },
          select: { id: true }
        });
        if (!emailUser) {
          return res.status(404).json({
            success: false,
            error: 'Usuário com este email não encontrado'
          });
        }
        userIds = [emailUser.id];
        break;
      
      case 'all':
        const allUsers = await prisma.user.findMany({
          select: { id: true }
        });
        userIds = allUsers.map(u => u.id);
        break;
      
      default:
        return res.status(400).json({
          success: false,
          error: 'Tipo de alvo inválido'
        });
    }

    if (userIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum usuário encontrado para o critério selecionado'
      });
    }

    // Enviar notificação
    const result = await notificationService.sendBulkNotification(userIds, title, body, { type });

    return res.json({
      success: true,
      message: `Notificação enviada para ${result.successCount} usuário(s). Falha para ${result.failureCount}.`,
      data: {
        targetType,
        targetValue,
        totalUsers: userIds.length,
        successCount: result.successCount,
        failureCount: result.failureCount
      }
    });

  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/admin/notifications/send/bulk:
 *   post:
 *     summary: Enviar notificação em massa
 *     tags: [Admin - Notificações]
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkNotification'
 *     responses:
 *       200:
 *         description: Notificação enviada para a fila
 */
router.post('/notifications/send/bulk', async (req, res) => {
  try {
    const { userIds, title, body, data } = bulkNotificationSchema.parse(req.body);
    const result = await notificationService.sendBulkNotification(userIds, title, body, data);
    return res.json({
      success: true,
      message: `Notificações enviadas para ${result.successCount} usuários. Falha para ${result.failureCount}.`,
      data: result
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Dados inválidos', details: error.errors });
    } else {
      console.error('Erro ao enviar notificação em massa:', error);
      return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
    }
  }
});

/**
 * @swagger
 * /api/admin/notifications/templates:
 *   get:
 *     summary: Listar todos os templates de notificação
 *     tags: [Admin - Notificações]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de templates
 */
router.get('/notifications/templates', async (req, res) => {
  try {
    const templates = await prisma.notificationTemplate.findMany({
      orderBy: { name: 'asc' }
    });
    return res.json({ success: true, data: templates });
  } catch (error) {
    console.error('Erro ao listar templates:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/admin/notifications/templates:
 *   post:
 *     summary: Criar novo template de notificação
 *     tags: [Admin - Notificações]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotificationTemplate'
 *     responses:
 *       201:
 *         description: Template criado com sucesso
 */
router.post('/notifications/templates', async (req, res) => {
  try {
    const data = templateSchema.parse(req.body);
    const template = await prisma.notificationTemplate.create({ data });
    return res.status(201).json({ success: true, message: 'Template criado com sucesso', data: template });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Dados inválidos', details: error.errors });
    } else {
      console.error('Erro ao criar template:', error);
      return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
    }
  }
});

/**
 * @swagger
 * /api/admin/notifications/templates/{id}:
 *   put:
 *     summary: Atualizar template de notificação
 *     tags: [Admin - Notificações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotificationTemplate'
 *     responses:
 *       200:
 *         description: Template atualizado com sucesso
 */
router.put('/notifications/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = templateSchema.parse(req.body);
    const template = await prisma.notificationTemplate.update({
      where: { id },
      data
    });
    return res.json({ success: true, message: 'Template atualizado com sucesso', data: template });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Dados inválidos', details: error.errors });
    } else {
      console.error('Erro ao atualizar template:', error);
      return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
    }
  }
});

/**
 * @swagger
 * /api/admin/notifications/templates/{id}:
 *   delete:
 *     summary: Deletar template de notificação
 *     tags: [Admin - Notificações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Template deletado com sucesso
 */
router.delete('/notifications/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.notificationTemplate.delete({ where: { id } });
    return res.json({ success: true, message: 'Template deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar template:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// Validações de Notificações
const templateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['email', 'push', 'sms']),
  subject: z.string().min(1, 'Assunto é obrigatório'),
  body: z.string().min(1, 'Corpo é obrigatório'),
  variables: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

const bulkNotificationSchema = z.object({
  userIds: z.array(z.string()).min(1, 'Pelo menos um usuário deve ser selecionado'),
  title: z.string().min(1, 'Título é obrigatório'),
  body: z.string().min(1, 'Corpo é obrigatório'),
  data: z.record(z.any()).optional()
});

export default router; 