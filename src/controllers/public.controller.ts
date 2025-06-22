import { Request, Response } from 'express';
import prisma from '@/config/database';

/**
 * Controller para buscar todos os planos ativos
 * @param req Request
 * @param res Response
 */
export const getPublicPlans = async (req: Request, res: Response) => {
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
        milestoneLimit: true,
        activityLimit: true,
        aiLimit: true,
        photoQuality: true,
        familySharing: true,
        exportFeatures: true,
        prioritySupport: true,
        aiFeatures: true,
        offlineMode: true,
        stripePriceId: true,
        stripeYearlyPriceId: true,
      },
    });

    return res.status(200).json({
      success: true,
      plans,
    });
  } catch (error) {
    console.error('Erro ao buscar planos públicos:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor ao buscar planos.',
    });
  }
}; 