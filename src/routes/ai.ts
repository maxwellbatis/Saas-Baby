import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '@/config/database';
import { AIService } from '@/services/ai.service';
import { AIController } from '../controllers/ai.controller';
import { checkAILimit } from '@/middlewares/auth';

const router = Router();
const aiService = new AIService();
const aiController = new AIController();

// Validações
const chatValidation = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Mensagem deve ter entre 1 e 1000 caracteres'),
  body('babyAge')
    .optional()
    .isInt({ min: 0, max: 72 })
    .withMessage('Idade do bebê deve ser entre 0 e 72 meses'),
];

const sleepAnalysisValidation = [
  body('babyId')
    .notEmpty()
    .withMessage('ID do bebê é obrigatório'),
  body('days')
    .optional()
    .isInt({ min: 1, max: 30 })
    .withMessage('Dias deve ser entre 1 e 30'),
];

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: Chat com IA para dúvidas gerais
 *     tags: [IA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Meu bebê está dormindo pouco, o que fazer?"
 *               babyId:
 *                 type: string
 *                 example: "id_do_bebe"
 *               babyAge:
 *                 type: integer
 *                 example: 6
 *     responses:
 *       200:
 *         description: Resposta da IA
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     response:
 *                       type: string
 *                     context:
 *                       type: object
 *       401:
 *         description: Não autorizado
 */
// Chat com IA
router.post('/chat', chatValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array(),
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const { message, babyId, babyAge } = req.body;

    // Buscar informações do usuário e bebês
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        babies: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            birthDate: true,
            gender: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado',
      });
    }

    // Buscar bebê específico se fornecido
    let selectedBaby = null;
    if (babyId) {
      selectedBaby = user.babies.find(baby => baby.id === babyId);
    } else {
      selectedBaby = user.babies[0];
    }

    if (!selectedBaby) {
      return res.status(404).json({
        success: false,
        error: 'Bebê não encontrado',
      });
    }

    // Calcular idade em meses
    const calculatedAge = babyAge || Math.floor(
      (new Date().getTime() - new Date(selectedBaby.birthDate).getTime()) / 
      (1000 * 60 * 60 * 24 * 30.44)
    );

    // Usar IA real do Groq
    const response = await aiService.chat(req.user.userId, message, {
      userName: user.name,
      babyName: selectedBaby.name,
      babyAge: calculatedAge,
      babyGender: selectedBaby.gender === 'male' ? 'Menino' : 'Menina'
    });

    return res.json({
      success: true,
      data: {
        response,
        context: {
          babyAge: calculatedAge,
          babyCount: user.babies.length,
        },
      },
    });
  } catch (error) {
    console.error('Erro no chat com IA:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

/**
 * @swagger
 * /api/ai/analyze-sleep:
 *   post:
 *     summary: Analisar padrão de sono do bebê
 *     tags: [IA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               babyId:
 *                 type: string
 *                 example: "id_do_bebe"
 *               days:
 *                 type: integer
 *                 example: 7
 *     responses:
 *       200:
 *         description: Análise de sono
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     analysis:
 *                       type: string
 *                     statistics:
 *                       type: object
 *                     records:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Não autorizado
 */
// Análise de sono
router.post('/analyze-sleep', sleepAnalysisValidation, checkAILimit, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array(),
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const { babyId, days = 7 } = req.body;

    // Verificar se o bebê pertence ao usuário
    const baby = await prisma.baby.findFirst({
      where: {
        id: babyId,
        userId: req.user.userId,
        isActive: true,
      },
    });

    if (!baby) {
      return res.status(404).json({
        success: false,
        error: 'Bebê não encontrado',
      });
    }

    // Simular análise de sono (em produção, usar dados reais)
    const analysis = `Análise do sono do ${baby.name} nos últimos ${days} dias: O padrão de sono está adequado para a idade. Recomendações: manter horários regulares e criar uma rotina relaxante antes de dormir.`;

    return res.json({
      success: true,
      data: {
        analysis,
        statistics: {
          totalRecords: 7,
          averageSleep: 480, // 8 horas em minutos
          averageSleepFormatted: '8h 0min',
          period: `${days} dias`,
        },
        records: [],
      },
    });
  } catch (error) {
    console.error('Erro na análise de sono:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

/**
 * @swagger
 * /api/ai/suggest-activities:
 *   post:
 *     summary: Sugestões de atividades para o bebê
 *     tags: [IA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               babyId:
 *                 type: string
 *                 example: "id_do_bebe"
 *               category:
 *                 type: string
 *                 example: "motor"
 *     responses:
 *       200:
 *         description: Sugestões de atividades
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
 *                     type: string
 *       401:
 *         description: Não autorizado
 */
// Sugestões de atividades
router.post('/suggest-activities', checkAILimit, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const { babyId, category } = req.body;

    // Buscar informações do bebê
    const baby = await prisma.baby.findFirst({
      where: {
        id: babyId,
        userId: req.user.userId,
        isActive: true,
      },
    });

    if (!baby) {
      return res.status(404).json({
        success: false,
        error: 'Bebê não encontrado',
      });
    }

    // Calcular idade do bebê em meses
    const ageInMonths = Math.floor(
      (new Date().getTime() - new Date(baby.birthDate).getTime()) / 
      (1000 * 60 * 60 * 24 * 30.44)
    );

    // Simular sugestões de atividades (em produção, usar Groq)
    const suggestions = [
      {
        title: 'Atividade de Desenvolvimento Motor',
        description: 'Ajude o bebê a praticar movimentos básicos',
        age: ageInMonths,
        category: category || 'general',
        duration: 15,
        materials: ['Brinquedos coloridos', 'Almofadas'],
      },
      {
        title: 'Estimulação Sensorial',
        description: 'Atividades para desenvolver os sentidos',
        age: ageInMonths,
        category: 'sensory',
        duration: 10,
        materials: ['Texturas diferentes', 'Sons suaves'],
      },
    ];

    return res.json({
      success: true,
      data: {
        suggestions,
        babyAge: ageInMonths,
        category: category || 'general',
      },
    });
  } catch (error) {
    console.error('Erro ao gerar sugestões:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Rota para alertas inteligentes de saúde
router.get('/health-alerts', checkAILimit, aiController.getHealthAlerts);

// Rota para conselhos personalizados
router.get('/personalized-advice', checkAILimit, aiController.getPersonalizedAdvice);

// Rota para dicas de alimentação
router.get('/feeding-tips', checkAILimit, aiController.getFeedingTips);

// Rota para previsão de marcos de desenvolvimento
router.post('/predict-milestones', checkAILimit, aiController.predictMilestones);

// Rota para analytics de uso da IA
router.get('/usage-stats', aiController.getAIUsageStats);

export default router; 