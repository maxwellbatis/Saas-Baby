import { Router } from 'express';
import prisma from '@/config/database';
import { getPublicPlans } from '@/controllers/public.controller';

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

    res.json({
      success: true,
      data: {
        totalUsers,
        totalBabies,
        totalMemories,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

export default router; 