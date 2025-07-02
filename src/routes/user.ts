import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '@/config/database';
import { checkBabyLimit, verifyBabyOwnership, checkMemoryLimit, checkMilestoneLimit, checkActivityLimit } from '@/middlewares/auth';
import { GamificationService } from '@/services/gamification';
import { NotificationService } from '../services/notification.service';
import { Prisma } from '@prisma/client';
import { getAllPedidos, getPedidoById, createPedido, updatePedido, deletePedido } from '../controllers/pedido.controller';
import { authenticateUser } from '../middlewares/auth';

const router = Router();

const notificationService = new NotificationService();

/**
 * @swagger
 * components:
 *   schemas:
 *     BabyCreateRequest:
 *       type: object
 *       required:
 *         - name
 *         - birthDate
 *         - gender
 *       properties:
 *         name:
 *           type: string
 *         birthDate:
 *           type: string
 *           format: date
 *         gender:
 *           type: string
 *           enum: [male, female]
 *         photoUrl:
 *           type: string
 *     Milestone:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *           enum: [motor, cognitive, social, language, general]
 *         babyId:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *         photoUrl:
 *           type: string
 *         userId:
 *           type: string
 *     MilestoneCreateRequest:
 *       type: object
 *       required:
 *         - title
 *         - babyId
 *         - date
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *           enum: [motor, cognitive, social, language, general]
 *         babyId:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *         photoUrl:
 *           type: string
 */

// Validações para bebês
const babyValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nome deve ter entre 2 e 50 caracteres'),
  body('gender')
    .optional()
    .isIn(['male', 'female'])
    .withMessage('Gênero deve ser "male" ou "female"'),
  body('birthDate')
    .isISO8601()
    .withMessage('Data de nascimento deve ser uma data válida'),
];

// Validações para atividades
const activityValidation = [
  body('type')
    .isIn(['sleep', 'feeding', 'diaper', 'play', 'bath', 'medicine', 'general'])
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

// ===== GERENCIAMENTO DE BEBÊS =====

/**
 * @swagger
 * /api/user/babies:
 *   get:
 *     summary: Listar bebês do usuário
 *     tags: [Bebês]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de bebês
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Baby'
 */
// Listar bebês do usuário
router.get('/babies', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const babies = await prisma.baby.findMany({
      where: {
        userId: req.user.userId,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      data: babies,
    });
  } catch (error) {
    console.error('Erro ao listar bebês:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

/**
 * @swagger
 * /api/user/babies:
 *   post:
 *     summary: Criar bebê
 *     tags: [Bebês]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BabyCreateRequest'
 *     responses:
 *       201:
 *         description: Bebê criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Baby'
 */
// Criar novo bebê
router.post('/babies', babyValidation, checkBabyLimit, async (req: Request, res: Response) => {
  try {
    console.log('Iniciando criação de bebê...');
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validação falhou ao criar bebê:', errors.array());
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array(),
      });
    }

    if (!req.user) {
      console.error('Usuário não autenticado ao criar bebê');
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const { name, gender, birthDate, photoUrl, photo } = req.body;
    console.log('Dados recebidos para criar bebê:', { name, gender, birthDate, photoUrl, photo, userId: req.user.userId });

    // Validar data de nascimento
    const birthDateObj = new Date(birthDate);
    if (isNaN(birthDateObj.getTime())) {
      console.error('Data de nascimento inválida:', birthDate);
      return res.status(400).json({
        success: false,
        error: 'Data de nascimento inválida',
      });
    }

    const baby = await prisma.baby.create({
      data: {
        name,
        gender,
        birthDate: birthDateObj,
        photoUrl: photoUrl || photo,
        userId: req.user.userId,
      },
    });

    // === Gamificação centralizada ===
    let gamificationResult: any = null;
    try {
      gamificationResult = await GamificationService.applyAction(req.user.userId, 'baby_added');
      if (gamificationResult && Array.isArray(gamificationResult.newBadges) && gamificationResult.newBadges.length > 0 && notificationService) {
        await notificationService.sendPushNotification({
          userId: req.user.userId,
          title: 'Parabéns! Novo badge conquistado!',
          body: `Você se tornou um Guardião de Memórias! Badge: ${gamificationResult.newBadges.join(', ')}`,
          data: { badges: gamificationResult.newBadges, screen: 'Rewards' },
        });
      }
    } catch (err) {
      console.error('Erro na gamificação automática (bebê):', err);
    }

    console.log('Bebê criado com sucesso:', baby);
    return res.status(201).json({
      success: true,
      message: 'Bebê adicionado com sucesso',
      data: baby,
      gamification: gamificationResult
    });
  } catch (error) {
    console.error('Erro ao criar bebê:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

/**
 * @swagger
 * /api/user/babies/{id}:
 *   get:
 *     summary: Buscar bebê por ID
 *     tags: [Bebês]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do bebê
 *     responses:
 *       200:
 *         description: Bebê encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Baby'
 *       404:
 *         description: Bebê não encontrado
 */
// Buscar bebê por ID (do usuário autenticado)
router.get('/babies/:id', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado.' });
    }
    
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: 'ID do bebê não fornecido.' });
    }
    
    const baby = await prisma.baby.findFirst({
      where: { id, userId: req.user.userId },
      include: {
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
      return res.status(404).json({ success: false, error: 'Bebê não encontrado.' });
    }
    
    return res.json({ success: true, data: baby });
  } catch (error) {
    console.error('Erro ao buscar bebê:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/user/babies/{id}:
 *   put:
 *     summary: Atualizar bebê por ID
 *     tags: [Bebês]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do bebê
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BabyCreateRequest'
 *     responses:
 *       200:
 *         description: Bebê atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Baby'
 *       404:
 *         description: Bebê não encontrado
 */
// Atualizar bebê por ID (do usuário autenticado)
router.put('/babies/:id', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado.' });
    }
    
    const { id } = req.params;
    const updateData = req.body;
    
    if (!id) {
      return res.status(400).json({ success: false, error: 'ID do bebê não fornecido.' });
    }
    
    // Só permite atualizar bebês do próprio usuário
    const baby = await prisma.baby.findFirst({ where: { id, userId: req.user.userId } });
    if (!baby) {
      return res.status(404).json({ success: false, error: 'Bebê não encontrado.' });
    }
    
    // Tratar a data de nascimento se fornecida
    if (updateData.birthDate) {
      // Converter para objeto Date se for string
      if (typeof updateData.birthDate === 'string') {
        updateData.birthDate = new Date(updateData.birthDate);
      }
    }
    
    // Tratar o campo photo se fornecido
    if (updateData.photo) {
      updateData.photoUrl = updateData.photo;
      delete updateData.photo;
    }
    
    const updated = await prisma.baby.update({ where: { id }, data: updateData });
    return res.json({ success: true, message: 'Bebê atualizado com sucesso', data: updated });
  } catch (error) {
    console.error('Erro ao atualizar bebê:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/user/babies/{id}:
 *   delete:
 *     summary: Deletar bebê por ID
 *     tags: [Bebês]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do bebê
 *     responses:
 *       200:
 *         description: Bebê deletado
 *       404:
 *         description: Bebê não encontrado
 */
// Deletar bebê (soft delete)
router.delete('/babies/:id', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID do bebê é obrigatório',
      });
    }

    // Verificar se o bebê existe e pertence ao usuário
    const baby = await prisma.baby.findFirst({
      where: {
        id: id,
        userId: req.user.userId,
        isActive: true,
      },
    });

    if (!baby) {
      return res.status(404).json({
        success: false,
        error: 'Bebê não encontrado ou não pertence ao usuário',
      });
    }

    // Fazer soft delete
    await prisma.baby.update({
      where: { id },
      data: { isActive: false },
    });

    return res.json({
      success: true,
      message: 'Bebê removido com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar bebê:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// ===== ATIVIDADES =====

/**
 * @swagger
 * /api/user/activities:
 *   get:
 *     summary: Listar atividades do usuário
 *     tags: [Atividades]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de atividades
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Activity'
 */
// Listar atividades de um bebê
router.get('/babies/:babyId/activities', verifyBabyOwnership, async (req: Request, res: Response) => {
  try {
    const { babyId } = req.params;
    const { page = '1', limit = '20', type } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    let where: any = { babyId };

    if (type) {
      where.type = type;
    }

    const activities = await prisma.activity.findMany({
      where,
      orderBy: { date: 'desc' },
      skip,
      take: limitNum,
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
    console.error('Erro ao listar atividades:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

/**
 * @swagger
 * /api/user/activities:
 *   post:
 *     summary: Criar atividade
 *     tags: [Atividades]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActivityCreateRequest'
 *     responses:
 *       201:
 *         description: Atividade criada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Activity'
 */
// Criar nova atividade
router.post('/activities', activityValidation, checkActivityLimit, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const { type, title, description, babyId, date, duration, notes } = req.body;

    if (!type || !title || !babyId) {
      return res.status(400).json({
        success: false,
        error: 'Tipo, título e ID do bebê são obrigatórios',
      });
    }

    const activity = await prisma.activity.create({
      data: {
        type,
        title,
        description,
        babyId,
        date: date ? new Date(date) : new Date(),
        duration,
        notes,
        userId: req.user.userId,
      },
      include: {
        baby: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // === Gamificação automática (criação de atividade) ===
    let gamificationResult: any = null;
    try {
      const gamification = await prisma.gamification.findUnique({ where: { userId: req.user.userId } });
      if (gamification) {
        const rules = await prisma.gamificationRule.findMany({ where: { isActive: true } });
        const oldBadges = Array.isArray(gamification.badges) ? gamification.badges.map(String) : [];
        let processedData: any = {
          points: gamification.points,
          level: gamification.level,
          badges: Array.isArray(gamification.badges) ? [...gamification.badges] : [],
          streaks: typeof gamification.streaks === 'object' && gamification.streaks !== null && !Array.isArray(gamification.streaks) ? { ...gamification.streaks } : {},
          achievements: Array.isArray(gamification.achievements) ? [...gamification.achievements] : [],
          dailyProgress: gamification.dailyProgress,
          totalActivities: (gamification.totalActivities || 0) + 1,
          totalMemories: gamification.totalMemories || 0,
          totalMilestones: gamification.totalMilestones || 0,
        };
        for (const rule of rules) {
          if (rule.condition === type || rule.condition === 'any') {
            processedData = GamificationService.applyRule(processedData, rule as any);
          }
        }
        const currentBadges = Array.isArray(processedData.badges) ? processedData.badges.map(String) : [];
        const newBadges = currentBadges.filter((b: string) => !oldBadges.includes(b));
        const updateData: Prisma.GamificationUpdateInput = {
          points: processedData.points,
          level: processedData.level,
          badges: Array.isArray(processedData.badges) && processedData.badges.length > 0 ? processedData.badges : Prisma.JsonNull,
          streaks: processedData.streaks && Object.keys(processedData.streaks).length > 0 ? processedData.streaks : Prisma.JsonNull,
          achievements: Array.isArray(processedData.achievements) && processedData.achievements.length > 0 ? processedData.achievements : Prisma.JsonNull,
          dailyProgress: processedData.dailyProgress,
          totalActivities: processedData.totalActivities,
        };
        gamificationResult = await prisma.gamification.update({
          where: { userId: req.user.userId },
          data: updateData,
        });
        if (newBadges.length > 0 && notificationService) {
          await notificationService.sendPushNotification({
            userId: req.user.userId,
            title: 'Parabéns! Novo badge conquistado!',
            body: `Você desbloqueou o badge: ${newBadges.join(', ')}`,
            data: { badges: newBadges, screen: 'Rewards' },
          });
        }
        gamificationResult.newBadges = newBadges;
      }
    } catch (err) {
      console.error('Erro na gamificação automática (atividade):', err);
    }

    return res.status(201).json({
      success: true,
      message: 'Atividade criada com sucesso',
      data: activity,
      gamification: gamificationResult,
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
router.put('/activities/:id', activityValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array(),
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID da atividade é obrigatório',
      });
    }

    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }

    const activity = await prisma.activity.update({
      where: {
        id,
        userId: req.user.userId,
      },
      data: updateData,
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

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID da atividade é obrigatório',
      });
    }

    await prisma.activity.delete({
      where: {
        id,
        userId: req.user.userId,
      },
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

// ===== MEMÓRIAS =====

/**
 * @swagger
 * /api/user/memories:
 *   get:
 *     summary: Listar memórias do usuário
 *     tags: [Memórias]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de memórias
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Memory'
 */
// Listar memórias do usuário
router.get('/memories', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const { page = 1, limit = 20, babyId } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {
      userId: req.user.userId,
    };

    if (babyId) {
      where.babyId = babyId;
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
      },
      orderBy: { date: 'desc' },
      skip,
      take: parseInt(limit as string),
    });

    const total = await prisma.memory.count({ where });

    return res.json({
      success: true,
      data: memories,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Erro ao listar memórias:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

/**
 * @swagger
 * /api/user/memories:
 *   post:
 *     summary: Criar memória
 *     tags: [Memórias]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MemoryCreateRequest'
 *     responses:
 *       201:
 *         description: Memória criada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Memory'
 */
// Criar nova memória
router.post('/memories', checkMemoryLimit, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const { title, description, babyId, date, photoUrl } = req.body;

    if (!title || !babyId) {
      return res.status(400).json({
        success: false,
        error: 'Título e ID do bebê são obrigatórios',
      });
    }

    const memory = await prisma.memory.create({
      data: {
        title,
        description,
        babyId,
        date: date ? new Date(date) : new Date(),
        photoUrl,
        userId: req.user.userId,
      },
      include: {
        baby: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // === Gamificação automática (memória criada) ===
    let gamificationResult: any = null;
    try {
      const gamification = await prisma.gamification.findUnique({ where: { userId: req.user.userId } });
      if (gamification) {
        const rules = await prisma.gamificationRule.findMany({ where: { isActive: true } });
        const oldBadges = Array.isArray(gamification.badges) ? gamification.badges.map(String) : [];
        let processedData: any = {
          points: gamification.points,
          level: gamification.level,
          badges: Array.isArray(gamification.badges) ? [...gamification.badges] : [],
          streaks: typeof gamification.streaks === 'object' && gamification.streaks !== null && !Array.isArray(gamification.streaks) ? { ...gamification.streaks } : {},
          achievements: Array.isArray(gamification.achievements) ? [...gamification.achievements] : [],
          dailyProgress: gamification.dailyProgress,
          totalActivities: gamification.totalActivities || 0,
          totalMemories: (gamification.totalMemories || 0) + 1,
          totalMilestones: gamification.totalMilestones || 0,
        };
        for (const rule of rules) {
          if (rule.condition === 'memory_created' || rule.condition === 'any') {
            processedData = GamificationService.applyRule(processedData, rule as any);
          }
        }
        const currentBadges = Array.isArray(processedData.badges) ? processedData.badges.map(String) : [];
        const newBadges = currentBadges.filter((b: string) => !oldBadges.includes(b));
        const updateData: Prisma.GamificationUpdateInput = {
          points: processedData.points,
          level: processedData.level,
          badges: Array.isArray(processedData.badges) && processedData.badges.length > 0 ? processedData.badges : Prisma.JsonNull,
          streaks: processedData.streaks && Object.keys(processedData.streaks).length > 0 ? processedData.streaks : Prisma.JsonNull,
          achievements: Array.isArray(processedData.achievements) && processedData.achievements.length > 0 ? processedData.achievements : Prisma.JsonNull,
          dailyProgress: processedData.dailyProgress,
          totalMemories: processedData.totalMemories,
        };
        gamificationResult = await prisma.gamification.update({
          where: { userId: req.user.userId },
          data: updateData,
        });
        if (newBadges.length > 0 && notificationService) {
          await notificationService.sendPushNotification({
            userId: req.user.userId,
            title: 'Parabéns! Novo badge conquistado!',
            body: `Você desbloqueou o badge: ${newBadges.join(', ')}`,
            data: { badges: newBadges, screen: 'Rewards' },
          });
        }
        gamificationResult.newBadges = newBadges;
      }
    } catch (err) {
      console.error('Erro na gamificação automática (memória):', err);
    }

    return res.status(201).json({
      success: true,
      message: 'Memória criada com sucesso',
      data: memory,
      gamification: gamificationResult,
    });
  } catch (error) {
    console.error('Erro ao criar memória:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

/**
 * @swagger
 * /api/user/memories/{id}:
 *   get:
 *     summary: Buscar memória por ID
 *     tags: [Memórias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da memória
 *     responses:
 *       200:
 *         description: Memória encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Memory'
 *       404:
 *         description: Memória não encontrada
 */
// Buscar memória por ID
router.get('/memories/:id', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const { id } = req.params;

    const memory = await prisma.memory.findFirst({
      where: {
        id,
        userId: req.user.userId,
      },
      include: {
        baby: {
          select: {
            id: true,
            name: true,
          },
        },
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

/**
 * @swagger
 * /api/user/memories/{id}:
 *   put:
 *     summary: Atualizar memória por ID
 *     tags: [Memórias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da memória
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MemoryCreateRequest'
 *     responses:
 *       200:
 *         description: Memória atualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Memory'
 *       404:
 *         description: Memória não encontrada
 */
// Atualizar memória por ID
router.put('/memories/:id', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const { id } = req.params;
    const { title, description, date, photoUrl } = req.body;

    // Verificar se a memória existe e pertence ao usuário
    const existingMemory = await prisma.memory.findFirst({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (!existingMemory) {
      return res.status(404).json({
        success: false,
        error: 'Memória não encontrada',
      });
    }

    const memory = await prisma.memory.update({
      where: { id },
      data: {
        title,
        description,
        date: date ? new Date(date) : existingMemory.date,
        photoUrl,
      },
      include: {
        baby: {
          select: {
            id: true,
            name: true,
          },
        },
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

/**
 * @swagger
 * /api/user/memories/{id}:
 *   delete:
 *     summary: Deletar memória por ID
 *     tags: [Memórias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da memória
 *     responses:
 *       200:
 *         description: Memória deletada
 *       404:
 *         description: Memória não encontrada
 */
// Deletar memória por ID
router.delete('/memories/:id', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const { id } = req.params;

    // Verificar se a memória existe e pertence ao usuário
    const existingMemory = await prisma.memory.findFirst({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (!existingMemory) {
      return res.status(404).json({
        success: false,
        error: 'Memória não encontrada',
      });
    }

    await prisma.memory.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: 'Memória excluída com sucesso',
    });
  } catch (error) {
    console.error('Erro ao excluir memória:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// ===== MARCOS =====

/**
 * @swagger
 * /api/user/milestones:
 *   get:
 *     summary: Listar marcos do usuário
 *     tags: [Marcos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de marcos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Milestone'
 */
// Listar marcos do usuário
router.get('/milestones', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const { page = 1, limit = 20, babyId, category } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {
      userId: req.user.userId,
    };

    if (babyId) {
      where.babyId = babyId;
    }

    if (category) {
      where.category = category;
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
      },
      orderBy: { date: 'desc' },
      skip,
      take: parseInt(limit as string),
    });

    const total = await prisma.milestone.count({ where });

    return res.json({
      success: true,
      data: milestones,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Erro ao listar marcos:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

/**
 * @swagger
 * /api/user/milestones/suggested:
 *   get:
 *     summary: Listar marcos sugeridos não registrados para um bebê
 *     tags: [Marcos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: babyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do bebê
 *     responses:
 *       200:
 *         description: Lista de marcos sugeridos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SuggestedMilestone'
 */
router.get('/milestones/suggested', async (req, res) => {
  try {
    console.log('🔍 Buscando marcos sugeridos...');
    console.log('Query params:', req.query);
    console.log('User:', req.user?.userId);
    
    if (!req.user) {
      console.log('❌ Usuário não autenticado');
      return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    }
    const { babyId } = req.query;
    if (!babyId || typeof babyId !== 'string') {
      console.log('❌ babyId inválido:', babyId);
      return res.status(400).json({ success: false, error: 'babyId é obrigatório' });
    }
    
    console.log('👶 Buscando marcos para babyId:', babyId);
    
    // Buscar títulos dos marcos já registrados para este bebê
    const registeredTitles = await prisma.milestone.findMany({
      where: { babyId },
      select: { title: true },
    });
    console.log('📝 Marcos já registrados:', registeredTitles.map(m => m.title));
    
    const registeredTitlesSet = new Set(registeredTitles.map(m => m.title));
    
    // Buscar marcos sugeridos ativos que ainda não foram registrados
    const suggested = await prisma.suggestedMilestone.findMany({
      where: {
        isActive: true,
        title: { notIn: Array.from(registeredTitlesSet) },
      },
      orderBy: { sortOrder: 'asc' },
    });
    
    console.log('🎯 Marcos sugeridos encontrados:', suggested.length);
    console.log('📋 Títulos sugeridos:', suggested.map(s => s.title));
    
    // Sempre retorna array (mesmo vazio), limitado a 11 marcos
    return res.json({ success: true, data: suggested.slice(0, 11) });
  } catch (error) {
    console.error('❌ Erro ao listar marcos sugeridos:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/user/milestones:
 *   post:
 *     summary: Criar marco
 *     tags: [Marcos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MilestoneCreateRequest'
 *     responses:
 *       201:
 *         description: Marco criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Milestone'
 */
// Criar novo marco
router.post('/milestones', checkMilestoneLimit, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const { title, description, babyId, date, category, photoUrl } = req.body;

    if (!title || !babyId) {
      return res.status(400).json({
        success: false,
        error: 'Título e ID do bebê são obrigatórios',
      });
    }

    const milestone = await prisma.milestone.create({
      data: {
        title,
        description,
        babyId,
        date: date ? new Date(date) : new Date(),
        category: category || 'general',
        photoUrl,
        userId: req.user.userId,
      },
      include: {
        baby: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // === Gamificação automática (criação de marco) ===
    let gamificationResult: any = null;
    try {
      const gamification = await prisma.gamification.findUnique({ where: { userId: req.user.userId } });
      if (gamification) {
        const rules = await prisma.gamificationRule.findMany({ where: { isActive: true } });
        const oldBadges = Array.isArray(gamification.badges) ? gamification.badges.map(String) : [];
        let processedData: any = {
          points: gamification.points,
          level: gamification.level,
          badges: Array.isArray(gamification.badges) ? [...gamification.badges] : [],
          streaks: typeof gamification.streaks === 'object' && gamification.streaks !== null && !Array.isArray(gamification.streaks) ? { ...gamification.streaks } : {},
          achievements: Array.isArray(gamification.achievements) ? [...gamification.achievements] : [],
          dailyProgress: gamification.dailyProgress,
          totalActivities: gamification.totalActivities || 0,
          totalMemories: gamification.totalMemories || 0,
          totalMilestones: (gamification.totalMilestones || 0) + 1,
        };
        for (const rule of rules) {
          if (rule.condition === 'milestone_recorded' || rule.condition === 'any') {
            processedData = GamificationService.applyRule(processedData, rule as any);
          }
        }
        const currentBadges = Array.isArray(processedData.badges) ? processedData.badges.map(String) : [];
        const newBadges = currentBadges.filter((b: string) => !oldBadges.includes(b));
        const updateData: Prisma.GamificationUpdateInput = {
          points: processedData.points,
          level: processedData.level,
          badges: Array.isArray(processedData.badges) && processedData.badges.length > 0 ? processedData.badges : Prisma.JsonNull,
          streaks: processedData.streaks && Object.keys(processedData.streaks).length > 0 ? processedData.streaks : Prisma.JsonNull,
          achievements: Array.isArray(processedData.achievements) && processedData.achievements.length > 0 ? processedData.achievements : Prisma.JsonNull,
          dailyProgress: processedData.dailyProgress,
          totalMilestones: processedData.totalMilestones,
        };
        gamificationResult = await prisma.gamification.update({
          where: { userId: req.user.userId },
          data: updateData,
        });
        if (newBadges.length > 0 && notificationService) {
          await notificationService.sendPushNotification({
            userId: req.user.userId,
            title: 'Parabéns! Novo badge conquistado!',
            body: `Você desbloqueou o badge: ${newBadges.join(', ')}`,
            data: { badges: newBadges, screen: 'Rewards' },
          });
        }
        gamificationResult.newBadges = newBadges;
      }
    } catch (err) {
      console.error('Erro na gamificação automática (marco):', err);
    }

    return res.status(201).json({
      success: true,
      message: 'Marco criado com sucesso',
      data: milestone,
      gamification: gamificationResult,
    });
  } catch (error) {
    console.error('Erro ao criar marco:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

/**
 * @swagger
 * /api/user/milestones/{id}:
 *   get:
 *     summary: Buscar marco por ID
 *     tags: [Marcos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do marco
 *     responses:
 *       200:
 *         description: Marco encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Milestone'
 *       404:
 *         description: Marco não encontrado
 */
// Buscar marco por ID
router.get('/milestones/:id', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const { id } = req.params;

    const milestone = await prisma.milestone.findFirst({
      where: {
        id,
        userId: req.user.userId,
      },
      include: {
        baby: {
          select: {
            id: true,
            name: true,
          },
        },
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

/**
 * @swagger
 * /api/user/milestones/{id}:
 *   put:
 *     summary: Atualizar marco por ID
 *     tags: [Marcos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do marco
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MilestoneCreateRequest'
 *     responses:
 *       200:
 *         description: Marco atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Milestone'
 *       404:
 *         description: Marco não encontrado
 */
// Atualizar marco por ID
router.put('/milestones/:id', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const { id } = req.params;
    const { title, description, date, category, photoUrl } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID do marco é obrigatório',
      });
    }

    const milestone = await prisma.milestone.update({
      where: { id },
      data: {
        title,
        description,
        date: date ? new Date(date) : undefined,
        category,
        photoUrl,
      },
      include: {
        baby: {
          select: {
            id: true,
            name: true,
          },
        },
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

/**
 * @swagger
 * /api/user/milestones/{id}:
 *   delete:
 *     summary: Deletar marco por ID
 *     tags: [Marcos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do marco
 *     responses:
 *       200:
 *         description: Marco deletado
 *       404:
 *         description: Marco não encontrado
 */
// Deletar marco por ID
router.delete('/milestones/:id', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID do marco é obrigatório',
      });
    }

    await prisma.milestone.delete({
      where: { id },
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

// ===== MARCOS SUGERIDOS =====
/**
 * @swagger
 * /api/user/milestones/from-suggested:
 *   post:
 *     summary: Criar marco a partir de um sugerido
 *     tags: [Marcos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - suggestedMilestoneId
 *               - babyId
 *             properties:
 *               suggestedMilestoneId:
 *                 type: string
 *               babyId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               photoUrl:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Marco criado
 *       400:
 *         description: Dados inválidos
 */
router.post('/milestones/from-suggested', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    }
    const { suggestedMilestoneId, babyId, date, photoUrl, description } = req.body;
    if (!suggestedMilestoneId || !babyId) {
      return res.status(400).json({ success: false, error: 'suggestedMilestoneId e babyId são obrigatórios' });
    }
    // Buscar o marco sugerido
    const suggested = await prisma.suggestedMilestone.findUnique({
      where: { id: suggestedMilestoneId },
    });
    if (!suggested) {
      return res.status(404).json({ success: false, error: 'Marco sugerido não encontrado' });
    }
    // Impedir duplicidade para o mesmo bebê/título
    const exists = await prisma.milestone.findFirst({
      where: { babyId, title: suggested.title },
    });
    if (exists) {
      return res.status(409).json({ success: false, error: 'Este marco já foi registrado para este bebê' });
    }
    // Criar o marco
    const milestone = await prisma.milestone.create({
      data: {
        title: suggested.title,
        category: suggested.category,
        babyId,
        userId: req.user.userId,
        date: date ? new Date(date) : new Date(),
        photoUrl,
        description,
      },
    });

    // === Gamificação automática (criação de marco) ===
    let gamificationResult: any = null;
    try {
      const gamification = await prisma.gamification.findUnique({ where: { userId: req.user.userId } });
      if (gamification) {
        const rules = await prisma.gamificationRule.findMany({ where: { isActive: true } });
        const oldBadges = Array.isArray(gamification.badges) ? gamification.badges.map(String) : [];
        let processedData: any = {
          points: gamification.points,
          level: gamification.level,
          badges: Array.isArray(gamification.badges) ? [...gamification.badges] : [],
          streaks: typeof gamification.streaks === 'object' && gamification.streaks !== null && !Array.isArray(gamification.streaks) ? { ...gamification.streaks } : {},
          achievements: Array.isArray(gamification.achievements) ? [...gamification.achievements] : [],
          dailyProgress: gamification.dailyProgress,
          totalActivities: gamification.totalActivities || 0,
          totalMemories: gamification.totalMemories || 0,
          totalMilestones: (gamification.totalMilestones || 0) + 1,
        };
        for (const rule of rules) {
          if (rule.condition === 'milestone_recorded' || rule.condition === 'any') {
            processedData = GamificationService.applyRule(processedData, rule as any);
          }
        }
        const currentBadges = Array.isArray(processedData.badges) ? processedData.badges.map(String) : [];
        const newBadges = currentBadges.filter((b: string) => !oldBadges.includes(b));
        const updateData: Prisma.GamificationUpdateInput = {
          points: processedData.points,
          level: processedData.level,
          badges: currentBadges.length > 0 ? currentBadges : Prisma.JsonNull,
          streaks: processedData.streaks,
          achievements: Array.isArray(processedData.achievements) && processedData.achievements.length > 0 ? processedData.achievements : Prisma.JsonNull,
          dailyProgress: processedData.dailyProgress,
          totalMilestones: processedData.totalMilestones,
        };
        gamificationResult = await prisma.gamification.update({
          where: { userId: req.user.userId },
          data: updateData,
        });
        if (newBadges.length > 0 && notificationService) {
          await notificationService.sendPushNotification({
            userId: req.user.userId,
            title: 'Parabéns! Novo badge conquistado!',
            body: `Você desbloqueou o badge: ${newBadges.join(', ')}`,
            data: { badges: newBadges, screen: 'Rewards' },
          });
        }
        gamificationResult.newBadges = newBadges;
      }
    } catch (err) {
      console.error('Erro na gamificação automática (marco):', err);
    }

    return res.status(201).json({ success: true, message: 'Marco criado com sucesso', data: milestone, gamification: gamificationResult });
  } catch (error) {
    console.error('Erro ao criar marco a partir de sugerido:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// ===== GAMIFICAÇÃO =====

// Obter dados de gamificação do usuário
router.get('/gamification', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    // Buscar gamification do usuário
    let gamification = await prisma.gamification.findUnique({
      where: { userId: req.user.userId },
    });
    if (!gamification) {
      gamification = await prisma.gamification.create({
        data: {
          userId: req.user.userId,
          points: 0,
          level: 1,
          badges: [],
          streaks: {},
          achievements: [],
        },
      });
    }

    // Buscar dados complementares em paralelo (com fallback)
    let weeklyChallenges: any[] = [];
    let aiRewards: any[] = [];
    let ranking: any[] = [];
    let shopItems: any[] = [];
    let dailyMissions: any[] = [];
    let activeEvents: any[] = [];
    let userPurchases: any[] = [];
    try {
      const results = await Promise.all([
        GamificationService.generateWeeklyChallenges().catch(() => []),
        GamificationService.generateAIRewards(req.user.userId).catch(() => []),
        GamificationService.getWeeklyRanking(10).catch(() => []),
        GamificationService.getShopItems().catch(() => []),
        GamificationService.getUserMissions(req.user.userId).catch(() => []),
        GamificationService.getActiveEvents().catch(() => []),
        GamificationService.getUserPurchases(req.user.userId).catch(() => []),
      ]);
      weeklyChallenges = results[0];
      aiRewards = results[1];
      ranking = results[2];
      shopItems = results[3];
      dailyMissions = results[4];
      activeEvents = results[5];
      userPurchases = results[6];
    } catch (err) {
      // fallback para arrays vazios
    }

    return res.json({
      success: true,
      gamification,
      weeklyChallenges,
      aiRewards,
      ranking,
      shopItems,
      dailyMissions,
      activeEvents,
      userPurchases
    });
  } catch (error) {
    console.error('Erro ao buscar dados de gamificação:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// ===== PERFIL DO USUÁRIO =====

// Obter perfil do usuário
router.get('/me', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            price: true,
            yearlyPrice: true,
            features: true,
            userLimit: true,
            memoryLimit: true,
            aiLimit: true,
            familySharing: true,
            exportFeatures: true,
            prioritySupport: true,
            aiFeatures: true,
            offlineMode: true,
          }
        },
        subscription: true,
        gamification: true,
        babies: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
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
    console.error('Erro ao buscar perfil:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Atualizar perfil do usuário
router.put('/me', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const { name, phoneNumber, timezone, language, preferences, avatarUrl } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        name,
        phoneNumber,
        timezone,
        language,
        preferences,
        avatarUrl: avatarUrl || undefined,
      },
      include: {
        plan: true,
        subscription: true,
        gamification: true,
      },
    });

    return res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: user,
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// ===== PLANOS E ASSINATURAS =====

// Listar planos disponíveis
router.get('/plans', async (req: Request, res: Response) => {
  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
      select: {
        id: true,
        name: true,
        price: true,
        yearlyPrice: true,
        features: true,
        userLimit: true,
        memoryLimit: true,
        photoQuality: true,
        familySharing: true,
        exportFeatures: true,
        prioritySupport: true,
        aiFeatures: true,
        offlineMode: true,
      },
    });

    return res.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error('Erro ao listar planos:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Obter assinatura do usuário
router.get('/subscription', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.userId },
      include: {
        plan: true,
      },
    });

    return res.json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    console.error('Erro ao buscar assinatura:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

/**
 * @swagger
 * /api/user/challenges:
 *   get:
 *     summary: Listar desafios ativos e progresso do usuário
 *     tags: [Gamificação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de desafios e progresso
 */
router.get('/challenges', async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    // Corrigir filtro de desafios ativos
    const now = new Date();
    const challenges = await prisma.challenge.findMany({
      where: {
        isActive: true,
        OR: [
          { startDate: null, endDate: null },
          { startDate: { lte: now }, endDate: null },
          { startDate: null, endDate: { gte: now } },
          { startDate: { lte: now }, endDate: { gte: now } },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });
    // Buscar progresso do usuário
    const userChallenges = await prisma.userChallenge.findMany({
      where: { userId: req.user!.userId },
    });
    // Montar resposta
    const data = challenges.map((challenge: any) => {
      const userProgress = userChallenges.find((uc: any) => uc.challengeId === challenge.id);
      return {
        ...challenge,
        progress: userProgress?.progress || 0,
        status: userProgress?.status || 'in_progress',
        completedAt: userProgress?.completedAt,
      };
    });
    return res.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao listar desafios:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/user/challenges/{id}/complete:
 *   post:
 *     summary: Marcar desafio como concluído
 *     tags: [Gamificação]
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
 *         description: Desafio marcado como concluído
 */
router.post('/challenges/:id/complete', async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    const { id } = req.params;
    const challenge = await prisma.challenge.findUnique({ where: { id } });
    if (!challenge) return res.status(404).json({ success: false, error: 'Desafio não encontrado' });
    let userChallenge = await prisma.userChallenge.findFirst({ where: { userId: req.user!.userId, challengeId: id } });
    if (!userChallenge) {
      userChallenge = await prisma.userChallenge.create({ data: { userId: req.user!.userId, challengeId: id as string, progress: challenge.goal, status: 'completed', completedAt: new Date() } });
    } else if (userChallenge.status !== 'completed') {
      userChallenge = await prisma.userChallenge.update({ where: { id: userChallenge.id }, data: { progress: challenge.goal, status: 'completed', completedAt: new Date() } });
    }
    // TODO: Adicionar pontos, badge e notificação se aplicável
    return res.json({ success: true, data: userChallenge });
  } catch (error) {
    console.error('Erro ao completar desafio:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/user/ranking:
 *   get:
 *     summary: Ranking dos usuários por pontos de gamificação
 *     tags: [Gamificação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ranking dos usuários
 */
router.get('/ranking', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    // Buscar top 10
    const top = await prisma.gamification.findMany({
      orderBy: [
        { points: 'desc' },
        { level: 'desc' },
        { updatedAt: 'asc' },
      ],
      take: 10,
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
    // Buscar todos para posição do usuário logado
    const all = await prisma.gamification.findMany({
      orderBy: [
        { points: 'desc' },
        { level: 'desc' },
        { updatedAt: 'asc' },
      ],
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
    const userIdx = all.findIndex(g => g.userId === req.user!.userId);
    const userRank = userIdx >= 0 ? userIdx + 1 : null;
    const userData = userIdx >= 0 ? all[userIdx] : null;
    return res.json({
      success: true,
      data: {
        top: top.map((g, i) => ({
          rank: i + 1,
          userId: g.userId,
          name: g.user?.name,
          avatarUrl: g.user?.avatarUrl,
          points: g.points,
          level: g.level,
          badges: g.badges,
        })),
        user: userData ? {
          rank: userRank,
          userId: userData.userId,
          name: userData.user?.name,
          avatarUrl: userData.user?.avatarUrl,
          points: userData.points,
          level: userData.level,
          badges: userData.badges,
        } : null,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/user/babies/{babyId}/growth:
 *   get:
 *     summary: Listar todas as medidas de crescimento do bebê
 *     tags: [Crescimento]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: babyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do bebê
 *     responses:
 *       200:
 *         description: Lista de medidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/GrowthRecord'
 */
router.get('/babies/:babyId/growth', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Usuário não autenticado.' });
    const { babyId } = req.params;
    const baby = await prisma.baby.findFirst({ where: { id: babyId, userId: req.user.userId } });
    if (!baby) return res.status(404).json({ success: false, error: 'Bebê não encontrado.' });
    const growth = await prisma.growthRecord.findMany({ where: { babyId }, orderBy: { date: 'asc' } });
    return res.json({ success: true, data: growth });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao buscar medidas.' });
  }
});

/**
 * @swagger
 * /api/user/babies/{babyId}/growth:
 *   post:
 *     summary: Adicionar nova medida de crescimento
 *     tags: [Crescimento]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: babyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do bebê
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *               weight:
 *                 type: number
 *               height:
 *                 type: number
 *               headCircumference:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Medida criada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GrowthRecord'
 */
router.post('/babies/:babyId/growth', async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Usuário não autenticado.' });
    const { babyId } = req.params;
    const { height, weight, headCircumference, date, notes } = req.body;

    if (!babyId) {
      return res.status(400).json({ success: false, error: 'babyId é obrigatório.' });
    }

    const growth = await prisma.growthRecord.create({
      data: {
        height,
        weight,
        headCircumference,
        babyId: babyId as string, // Garantido não undefined
        userId: req.user.userId,
        date: date ? new Date(date) : new Date(),
        notes,
      },
    });

    // === Gamificação automática (crescimento) ===
    let gamificationResult: any = null;
    try {
      const gamification = await prisma.gamification.findUnique({ where: { userId: req.user.userId } });
      if (gamification) {
        const rules = await prisma.gamificationRule.findMany({ where: { isActive: true } });
        const oldBadges = Array.isArray(gamification.badges) ? gamification.badges.map(String) : [];
        let processedData: any = {
          points: gamification.points,
          level: gamification.level,
          badges: Array.isArray(gamification.badges) ? [...gamification.badges] : [],
          streaks: typeof gamification.streaks === 'object' && gamification.streaks !== null ? gamification.streaks : {},
          achievements: Array.isArray(gamification.achievements) ? [...gamification.achievements] : [],
          dailyProgress: gamification.dailyProgress,
          totalGrowthRecords: (gamification.totalGrowthRecords || 0) + 1,
        };
        for (const rule of rules) {
          if (rule.condition === 'growth_recorded' || rule.condition === 'any') {
            processedData = GamificationService.applyRule(processedData, rule as any);
          }
        }
        const currentBadges = Array.isArray(processedData.badges) ? processedData.badges.map(String) : [];
        const newBadges = currentBadges.filter((b: string) => !oldBadges.includes(b));
        const updateData: Prisma.GamificationUpdateInput = {
          points: processedData.points,
          level: processedData.level,
          badges: Array.isArray(processedData.badges) && processedData.badges.length > 0 ? processedData.badges : Prisma.JsonNull,
          streaks: processedData.streaks && Object.keys(processedData.streaks).length > 0 ? processedData.streaks : Prisma.JsonNull,
          achievements: Array.isArray(processedData.achievements) && processedData.achievements.length > 0 ? processedData.achievements : Prisma.JsonNull,
          dailyProgress: processedData.dailyProgress,
          totalGrowthRecords: processedData.totalGrowthRecords,
        };
        gamificationResult = await prisma.gamification.update({
          where: { userId: req.user.userId },
          data: updateData,
        });
        if (newBadges.length > 0 && notificationService) {
          await notificationService.sendPushNotification({
            userId: req.user.userId,
            title: 'Nova conquista!',
            body: `Você desbloqueou a badge: ${newBadges.join(', ')}`,
            data: { badges: newBadges, screen: 'Rewards' },
          });
        }
        gamificationResult.newBadges = newBadges;
      }
    } catch (error) {
      console.error('Erro na gamificação (crescimento):', error);
    }

    return res.status(201).json({ success: true, message: 'Registro de crescimento adicionado com sucesso', data: growth, gamification: gamificationResult });
  } catch (error) {
    console.error('Erro ao criar registro de crescimento:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/user/growth/{id}:
 *   put:
 *     summary: Editar medida de crescimento
 *     tags: [Crescimento]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da medida
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *               weight:
 *                 type: number
 *               height:
 *                 type: number
 *               headCircumference:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Medida atualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GrowthRecord'
 */
router.put('/growth/:id', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Usuário não autenticado.' });
    const { id } = req.params;
    const { date, weight, height, headCircumference, notes } = req.body;
    const growth = await prisma.growthRecord.findFirst({ where: { id, userId: req.user.userId } });
    if (!growth) return res.status(404).json({ success: false, error: 'Medida não encontrada.' });
    const updated = await prisma.growthRecord.update({
      where: { id },
      data: {
        date: date ? new Date(date) : growth.date,
        weight,
        height,
        headCircumference,
        notes,
      },
    });
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao atualizar medida.' });
  }
});

/**
 * @swagger
 * /api/user/growth/{id}:
 *   delete:
 *     summary: Excluir medida de crescimento
 *     tags: [Crescimento]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da medida
 *     responses:
 *       200:
 *         description: Medida excluída
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.delete('/growth/:id', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Usuário não autenticado.' });
    const { id } = req.params;
    const growth = await prisma.growthRecord.findFirst({ where: { id, userId: req.user.userId } });
    if (!growth) return res.status(404).json({ success: false, error: 'Medida não encontrada.' });
    await prisma.growthRecord.delete({ where: { id } });
    return res.json({ success: true, message: 'Medida excluída com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao excluir medida.' });
  }
});

// ===== NOTIFICAÇÕES DO USUÁRIO =====

/**
 * @swagger
 * /api/user/notifications:
 *   get:
 *     summary: Listar notificações do usuário
 *     tags: [Notificações]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de notificações
 */
router.get('/notifications', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: req.user.userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Limitar a 50 notificações mais recentes
    });

    return res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/user/notifications/{id}/read:
 *   put:
 *     summary: Marcar notificação como lida
 *     tags: [Notificações]
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
 *         description: Notificação marcada como lida
 */
router.put('/notifications/:id/read', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: req.user.userId
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notificação não encontrada'
      });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: {
        readAt: new Date()
      }
    });

    return res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/user/notifications/mark-all-read:
 *   put:
 *     summary: Marcar todas as notificações como lidas
 *     tags: [Notificações]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todas as notificações marcadas como lidas
 */
router.put('/notifications/mark-all-read', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    await prisma.notification.updateMany({
      where: {
        userId: req.user.userId,
        readAt: null
      },
      data: {
        readAt: new Date()
      }
    });

    return res.json({
      success: true,
      message: 'Todas as notificações foram marcadas como lidas'
    });
  } catch (error) {
    console.error('Erro ao marcar todas as notificações como lidas:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Rota para obter estatísticas de uso de IA
router.get('/ai-usage', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    const userId = req.user.userId;

    // Buscar interações de IA do usuário
    const aiInteractions = await prisma.aIInteraction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100, // Últimas 100 interações
    });

    // Calcular estatísticas
    const totalInteractions = aiInteractions.length;
    const thisWeekInteractions = aiInteractions.filter(
      interaction => interaction.createdAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    // Buscar plano do usuário para verificar limite
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { plan: true }
    });

    const aiLimit = (user?.plan as any)?.aiLimit || 10; // Padrão 10 por semana
    const remainingInteractions = Math.max(0, aiLimit - thisWeekInteractions);

    return res.json({
      success: true,
      data: {
        totalInteractions,
        thisWeekInteractions,
        aiLimit,
        remainingInteractions,
        usagePercentage: Math.round((thisWeekInteractions / aiLimit) * 100),
        recentInteractions: aiInteractions.slice(0, 10) // Últimas 10
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas de IA:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

router.post('/babies/:babyId/vaccines', async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Usuário não autenticado.' });
    const { babyId } = req.params;
    const { name, date, nextDueDate, notes } = req.body;

    if (!babyId) {
      return res.status(400).json({ success: false, error: 'babyId é obrigatório.' });
    }

    const vaccine = await prisma.vaccinationRecord.create({
      data: {
        name,
        date: date ? new Date(date) : new Date(),
        nextDueDate: nextDueDate ? new Date(nextDueDate) : undefined,
        babyId: babyId as string,
        userId: req.user.userId,
        notes,
      },
    });

    // === Gamificação automática (vacina) ===
    let gamificationResult: any = null;
    try {
      const gamification = await prisma.gamification.findUnique({ where: { userId: req.user.userId } });
      if (gamification) {
        const rules = await prisma.gamificationRule.findMany({ where: { isActive: true } });
        const oldBadges = Array.isArray(gamification.badges) ? gamification.badges.map(String) : [];
        let processedData: any = {
          points: gamification.points,
          level: gamification.level,
          badges: Array.isArray(gamification.badges) ? [...gamification.badges] : [],
          streaks: typeof gamification.streaks === 'object' && gamification.streaks !== null && !Array.isArray(gamification.streaks) ? { ...gamification.streaks } : {},
          achievements: Array.isArray(gamification.achievements) ? [...gamification.achievements] : [],
          dailyProgress: gamification.dailyProgress,
          totalVaccineRecords: (gamification.totalVaccineRecords || 0) + 1,
        };
        for (const rule of rules) {
          if (rule.condition === 'vaccine_recorded' || rule.condition === 'any') {
            processedData = GamificationService.applyRule(processedData, rule as any);
          }
        }
        const currentBadges = Array.isArray(processedData.badges) ? processedData.badges.map(String) : [];
        const newBadges = currentBadges.filter((b: string) => !oldBadges.includes(b));
        const updateData: Prisma.GamificationUpdateInput = {
          points: processedData.points,
          level: processedData.level,
          badges: Array.isArray(processedData.badges) && processedData.badges.length > 0 ? processedData.badges : Prisma.JsonNull,
          streaks: processedData.streaks && Object.keys(processedData.streaks).length > 0 ? processedData.streaks : Prisma.JsonNull,
          achievements: Array.isArray(processedData.achievements) && processedData.achievements.length > 0 ? processedData.achievements : Prisma.JsonNull,
          dailyProgress: processedData.dailyProgress,
          totalVaccineRecords: processedData.totalVaccineRecords,
        };
        gamificationResult = await prisma.gamification.update({
          where: { userId: req.user.userId },
          data: updateData,
        });
        if (newBadges.length > 0 && notificationService) {
          await notificationService.sendPushNotification({
            userId: req.user.userId,
            title: 'Nova conquista!',
            body: `Você desbloqueou a badge: ${newBadges.join(', ')}`,
            data: { badges: newBadges, screen: 'Rewards' },
          });
        }
        gamificationResult.newBadges = newBadges;
      }
    } catch (error) {
      console.error('Erro na gamificação (vacina):', error);
    }

    return res.status(201).json({ success: true, message: 'Vacina registrada com sucesso', data: vaccine, gamification: gamificationResult });
  } catch (error) {
    console.error('Erro ao registrar vacina:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// Aceitar convite de família por link
router.post('/family/accept', async (req, res) => {
  try {
    const { inviteId, userId } = req.body;
    if (!inviteId || !userId) {
      return res.status(400).json({ success: false, error: 'inviteId e userId são obrigatórios' });
    }
    const familyService = require('../services/family.service').default;
    const result = await familyService.acceptFamilyInvite(inviteId, userId);
    return res.json({ success: true, message: result.message });
  } catch (error) {
    console.error('Erro ao aceitar convite de família:', error);
    return res.status(500).json({ success: false, error: 'Erro ao aceitar convite' });
  }
});

// ===== ROTAS DE FAMÍLIA =====

// Listar membros da família
router.get('/family', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    }

    const familyService = require('../services/family.service').default;
    const familyMembers = await familyService.getFamilyMembers(req.user.userId);

    return res.json({
      success: true,
      data: familyMembers
    });
  } catch (error) {
    console.error('Erro ao listar membros da família:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// Convidar membro da família
router.post('/family', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    }

    const { name, email, relationship } = req.body;

    if (!name || !relationship) {
      return res.status(400).json({ success: false, error: 'Nome e relação são obrigatórios' });
    }

    const familyService = require('../services/family.service').default;
    const result = await familyService.inviteFamilyMember(req.user.userId, {
      name,
      email,
      relationship,
      permissions: ['view'] // Permissão básica de visualização
    });

    return res.json({
      success: true,
      message: result.message,
      data: result.familyMember
    });
  } catch (error: any) {
    console.error('Erro ao convidar membro da família:', error);
    return res.status(400).json({ 
      success: false, 
      error: error.message || 'Erro interno do servidor' 
    });
  }
});

// Remover membro da família
router.delete('/family/:memberId', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    }

    const { memberId } = req.params;

    const familyService = require('../services/family.service').default;
    const result = await familyService.removeFamilyMember(req.user.userId, memberId);

    return res.json({
      success: true,
      message: result.message
    });
  } catch (error: any) {
    console.error('Erro ao remover membro da família:', error);
    return res.status(400).json({ 
      success: false, 
      error: error.message || 'Erro interno do servidor' 
    });
  }
});

// Rotas de pedidos (após as rotas de usuário)
router.get('/pedidos', authenticateUser, getAllPedidos);
router.get('/pedidos/:id', authenticateUser, getPedidoById);
router.post('/pedidos', authenticateUser, createPedido);
router.put('/pedidos/:id', authenticateUser, updatePedido);
router.delete('/pedidos/:id', authenticateUser, deletePedido);

// Rotas de cursos para usuários
router.get('/courses', async (req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      where: { isActive: true },
      include: {
        modules: {
          include: {
            lessons: {
              include: {
                materials: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Adicionar informações de progresso para usuários inscritos (se autenticados)
    const coursesWithProgress = await Promise.all(
      courses.map(async (course: any) => {
        let enrollment: any = null;
        let progress = 0;
        let lastAccessed = null;
        let enrolledAt = null;
        let isEnrolled = false;

        // Se o usuário estiver autenticado, buscar informações de progresso
        if (req.user && req.user.userId) {
          enrollment = await prisma.userCourseProgress.findFirst({
            where: {
              userId: req.user.userId,
              courseId: course.id
            }
          });

          const totalLessons = course.modules.reduce((total: number, module: any) => 
            total + module.lessons.length, 0
          );

          // Calcular progresso baseado no status das aulas
          const completedLessons = course.modules.reduce((total: number, module: any) => 
            total + module.lessons.filter((lesson: any) => 
              enrollment?.status === 'completed'
            ).length, 0
          );

          progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
          lastAccessed = enrollment?.updatedAt;
          enrolledAt = enrollment?.updatedAt;
          isEnrolled = !!enrollment;
        }

        return {
          ...course,
          isEnrolled,
          progress,
          lastAccessed,
          enrolledAt
        };
      })
    );

    res.json({ success: true, data: coursesWithProgress });
    return;
  } catch (error) {
    console.error('Erro ao buscar cursos:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
    return;
  }
});

router.get('/courses/:id', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        modules: {
          include: {
            lessons: {
              include: {
                materials: true
              }
            }
          }
        }
      }
    });

    if (!course) {
      return res.status(404).json({ success: false, error: 'Curso não encontrado' });
    }

    // Verificar se usuário está inscrito
    const enrollment = await prisma.userCourseProgress.findFirst({
      where: {
        userId: req.user!.userId,
        courseId: id
      }
    });

    // Adicionar status de conclusão das aulas
    const courseWithProgress = {
      ...course,
      isEnrolled: !!enrollment,
      modules: course.modules.map(module => ({
        ...module,
        lessons: module.lessons.map(lesson => ({
          ...lesson,
          isCompleted: enrollment?.status === 'completed' || false
        }))
      }))
    };

    res.json({ success: true, data: courseWithProgress });
    return;
  } catch (error) {
    console.error('Erro ao buscar curso:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
    return;
  }
});

router.post('/courses/:id/enroll', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar se curso existe
    const course = await prisma.course.findUnique({
      where: { id }
    });

    if (!course) {
      return res.status(404).json({ success: false, error: 'Curso não encontrado' });
    }

    // Verificar se já está inscrito
    const existingEnrollment = await prisma.userCourseProgress.findFirst({
      where: {
        userId: req.user!.userId,
        courseId: id
      }
    });

    if (existingEnrollment) {
      return res.status(400).json({ success: false, error: 'Você já está inscrito neste curso' });
    }

    // Criar inscrição
    const enrollment = await prisma.userCourseProgress.create({
      data: {
        userId: req.user!.userId,
        courseId: id!,
        lessonId: null,
        status: 'in_progress',
        progress: 0
      }
    });

    res.json({ success: true, data: enrollment });
    return;
  } catch (error) {
    console.error('Erro ao inscrever no curso:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
    return;
  }
});

router.post('/courses/lessons/:id/complete', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar se a aula existe
    const lesson = await prisma.courseLesson.findUnique({
      where: { id },
      include: {
        module: {
          include: {
            course: true
          }
        }
      }
    });

    if (!lesson) {
      return res.status(404).json({ success: false, error: 'Aula não encontrada' });
    }

    // Verificar se usuário está inscrito no curso
    const enrollment = await prisma.userCourseProgress.findFirst({
      where: {
        userId: req.user!.userId,
        courseId: lesson.module.course.id
      }
    });

    if (!enrollment) {
      return res.status(400).json({ success: false, error: 'Você precisa estar inscrito no curso' });
    }

    // Atualizar progresso
    await prisma.userCourseProgress.update({
      where: { id: enrollment.id },
      data: {
        status: 'completed',
        progress: 100
      }
    });

    res.json({ success: true, message: 'Aula marcada como completa' });
    return;
  } catch (error) {
    console.error('Erro ao marcar aula como completa:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
    return;
  }
});

router.get('/my-courses', authenticateUser, async (req: Request, res: Response) => {
  try {
    const enrollments = await prisma.userCourseProgress.findMany({
      where: { userId: req.user!.userId },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: true
              }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    }) as any[];

    const coursesWithProgress = enrollments.map(enrollment => {
      const totalLessons = enrollment.course.modules.reduce((total: number, module: any) => 
        total + module.lessons.length, 0
      );

      const progress = enrollment.progress || 0;

      return {
        ...enrollment.course,
        progress,
        lastAccessed: enrollment.updatedAt,
        enrolledAt: enrollment.updatedAt
      };
    });

    res.json({ success: true, data: coursesWithProgress });
    return;
  } catch (error) {
    console.error('Erro ao buscar meus cursos:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
    return;
  }
});

export default router;