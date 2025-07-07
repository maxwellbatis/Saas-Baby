import express, { Router } from 'express';
import prisma from '../config/database';
import { getPublicPlans } from '@/controllers/public.controller';
import { getActiveBanners } from '@/controllers/shop.controller';
import { Request, Response } from 'express';
import { optionalAuthenticateUser } from '../middlewares/auth';
import { createLeadSaas } from '../controllers/public.controller';

const router = Router();

// Obter conteúdo da landing page
router.get('/landing-page', async (req, res) => {
  try {
    let content = await prisma.landingPageContent.findUnique({
      where: { id: 1 },
    });

    if (!content) {
      // Conteúdo padrão se não existir
      content = {
        id: 1,
        heroTitle: 'Seu diário digital para acompanhar o bebê',
        heroSubtitle: 'Registre atividades, memórias e marcos importantes do seu bebê em um só lugar',
        heroImage: null,
        heroVideo: null,
        heroMediaType: null,
        heroMediaUrl: null,
        features: [],
        testimonials: [],
        faq: [],
        stats: [],
        ctaText: null,
        ctaButtonText: null,
        seoTitle: 'Baby Diary - Seu diário digital para acompanhar o bebê',
        seoDescription: 'Registre atividades, memórias e marcos importantes do seu bebê em um só lugar. Nunca perca um momento especial do desenvolvimento do seu pequeno.',
        seoKeywords: 'baby diary, diário do bebê, acompanhamento infantil, desenvolvimento do bebê, memórias do bebê',
        updatedAt: new Date(),
      };
    }

    res.json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error('Erro ao buscar conteúdo da landing page:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

/**
 * @swagger
 * /api/public/plans:
 *   get:
 *     summary: Retorna a lista de planos de assinatura públicos e ativos.
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: Lista de planos retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 plans:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Erro interno do servidor.
 */
router.get('/plans', getPublicPlans);

// Obter estatísticas públicas
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalBabies, totalMemories] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.baby.count({ where: { isActive: true } }),
      prisma.memory.count(),
    ]);

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalBabies,
        totalMemories,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// ===== ROTAS DA LOJA PÚBLICA =====

// Buscar produtos em destaque (com promoção) - DEVE VIR ANTES DA ROTA COM PARÂMETRO
router.get('/shop-items/featured', async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const items = await prisma.shopItem.findMany({
      where: {
        isActive: true,
        isPromo: true,
        type: {
          notIn: ['theme', 'feature', 'bonus', 'cosmetic'] // Excluir produtos de gamificação
        }
      },
      include: {
        categoryObj: true,
        tags: { include: { tag: true } }
      },
      orderBy: { sortOrder: 'asc' },
      take: parseInt(limit as string)
    });

    return res.json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error('Erro ao buscar produtos em destaque:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Listar todos os produtos ativos da loja
router.get('/shop-items', async (req, res) => {
  try {
    const { category, search, sort = 'name', order = 'asc', limit = 50, offset = 0, isPromo } = req.query;

    const where: any = {
      isActive: true,
      type: {
        notIn: ['theme', 'feature', 'bonus', 'cosmetic'] // Excluir produtos de gamificação
      }
    };

    // Filtro por categoria
    if (category) {
      where.categoryObj = {
        id: category as string
      };
    }

    // Filtro por promoção
    if (isPromo !== undefined) {
      where.isPromo = isPromo === 'true';
    }

    // Busca por nome ou descrição
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const items = await prisma.shopItem.findMany({
      where,
      include: {
        categoryObj: true,
        tags: { include: { tag: true } }
      },
      orderBy: { [sort as string]: order as 'asc' | 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const total = await prisma.shopItem.count({ where });

    return res.json({
      success: true,
      data: items,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: total > parseInt(offset as string) + items.length
      }
    });
  } catch (error) {
    console.error('Erro ao buscar produtos da loja:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Buscar produto específico por ID ou slug
router.get('/shop-items/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se é um ID numérico ou slug
    const isNumeric = /^\d+$/.test(id);
    
    let item;
    if (isNumeric) {
      // Buscar por ID numérico
      item = await prisma.shopItem.findFirst({
        where: {
          id: parseInt(id),
          isActive: true,
          type: {
            notIn: ['theme', 'feature', 'bonus', 'cosmetic'] // Excluir produtos de gamificação
          }
        },
        include: {
          categoryObj: true,
          tags: { include: { tag: true } }
        }
      });
    } else {
      // Buscar por slug
      item = await prisma.shopItem.findFirst({
        where: {
          slug: id,
          isActive: true,
          type: {
            notIn: ['theme', 'feature', 'bonus', 'cosmetic'] // Excluir produtos de gamificação
          }
        },
        include: {
          categoryObj: true,
          tags: { include: { tag: true } }
        }
      });
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }

    return res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Listar categorias ativas
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });

    return res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Listar categorias da loja (alias para categories)
router.get('/shop-categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });

    return res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Erro ao buscar categorias da loja:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Buscar banners ativos da loja
router.get('/banners', getActiveBanners);

// Obter conteúdo da página business
router.get('/business-page-content', async (req: Request, res: Response) => {
  try {
    const content = await prisma.businessPageContent.findUnique({
      where: { id: 1 },
    });

    if (!content) {
      return res.json({ 
        success: true, 
        data: {
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
        }
      });
    }

    return res.json({ success: true, data: content });
  } catch (error) {
    console.error('Erro ao buscar conteúdo da página business:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// ===== ROTAS DE CURSOS PÚBLICAS =====

// Listar todos os cursos ativos (público)
router.get('/courses', async (req: Request, res: Response) => {
  try {
    const courses = await (prisma as any).course.findMany({
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

    // Para usuários não autenticados, retornar apenas informações básicas
    const coursesWithBasicInfo = courses.map((course: any) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      category: course.category,
      author: course.author,
      isActive: course.isActive,
      createdAt: course.createdAt,
      modules: course.modules,
      isEnrolled: false,
      progress: 0,
      lastAccessed: null,
      enrolledAt: null
    }));

    res.json({ success: true, data: coursesWithBasicInfo });
  } catch (error) {
    console.error('Erro ao buscar cursos:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// Buscar curso específico por ID (público)
router.get('/courses/:id', optionalAuthenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const course = await (prisma as any).course.findUnique({
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

    let isEnrolled = false;
    let progress = 0;
    let lastAccessed = null;
    let enrolledAt = null;
    let completedLessons: string[] = [];
    // Se o usuário estiver autenticado, buscar inscrição e progresso
    if (req.user && req.user.userId) {
      const enrollment = await (prisma as any).userCourseProgress.findFirst({
        where: {
          userId: req.user.userId,
          courseId: id
        }
      });
      isEnrolled = !!enrollment;
      progress = enrollment?.progress || 0;
      lastAccessed = enrollment?.updatedAt || null;
      enrolledAt = enrollment?.createdAt || null;
      // Aqui você pode buscar as aulas concluídas se tiver esse controle por aula
      // Exemplo: completedLessons = enrollment?.completedLessonsIds || [];
    }

    const courseWithBasicInfo = {
      ...course,
      isEnrolled,
      progress,
      lastAccessed,
      enrolledAt,
      modules: course.modules.map((module: any) => ({
        ...module,
        lessons: module.lessons.map((lesson: any) => ({
          ...lesson,
          isCompleted: completedLessons.includes(lesson.id)
        }))
      }))
    };

    return res.json({ success: true, data: courseWithBasicInfo });
  } catch (error) {
    console.error('Erro ao buscar curso:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

router.post('/lead-saas', createLeadSaas);

export default router; 