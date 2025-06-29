import { Router } from 'express';
import prisma from '@/config/database';
import { getPublicPlans } from '@/controllers/public.controller';
import { getActiveBanners } from '@/controllers/shop.controller';

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

export default router; 