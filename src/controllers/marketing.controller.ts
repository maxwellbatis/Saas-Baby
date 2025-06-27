import { Request, Response } from 'express';
import prisma from '@/config/database';
import { generateGeminiContent, generateMarketingContent as generateMarketingContentWithGemini } from '@/services/gemini.service';
import { uploadImage, uploadMedia } from '@/config/cloudinary';
import multer from 'multer';
import { socialMediaAPI } from '@/services/socialMediaAPI.service';
const upload = multer();

// Listar campanhas
export const listCampaigns = async (req: Request, res: Response) => {
  try {
    const campaigns = await prisma.marketingCampaign.findMany({
      orderBy: { createdAt: 'desc' },
      include: { interactions: true },
    });
    return res.json({ success: true, data: campaigns });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao listar campanhas' });
  }
};

// Criar campanha
export const createCampaign = async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      type, 
      content, 
      subject, 
      segment, 
      scheduledAt, 
      aiPrompt, 
      aiResponse,
      // Segmentação avançada
      babyAgeMin,
      babyAgeMax,
      motherType,
      planType,
      engagement,
      daysInactive,
      hasMultipleBabies,
      isPremium,
      isVerified,
      lastActivityDays,
      totalMemories,
      totalActivities
    } = req.body;
    
    const createdBy = req.admin?.userId || 'admin';
    const campaign = await prisma.marketingCampaign.create({
      data: {
        name,
        type,
        content,
        subject,
        segment,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        createdBy,
        aiPrompt,
        aiResponse,
        // Segmentação avançada
        babyAgeMin,
        babyAgeMax,
        motherType,
        planType,
        engagement,
        daysInactive,
        hasMultipleBabies,
        isPremium,
        isVerified,
        lastActivityDays,
        totalMemories,
        totalActivities,
      },
    });
    return res.status(201).json({ success: true, data: campaign });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao criar campanha' });
  }
};

// Editar campanha
export const updateCampaign = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      type, 
      content, 
      subject, 
      segment, 
      status, 
      scheduledAt, 
      aiPrompt, 
      aiResponse,
      // Segmentação avançada
      babyAgeMin,
      babyAgeMax,
      motherType,
      planType,
      engagement,
      daysInactive,
      hasMultipleBabies,
      isPremium,
      isVerified,
      lastActivityDays,
      totalMemories,
      totalActivities
    } = req.body;
    
    const campaign = await prisma.marketingCampaign.update({
      where: { id },
      data: {
        name,
        type,
        content,
        subject,
        segment,
        status,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        aiPrompt,
        aiResponse,
        // Segmentação avançada
        babyAgeMin,
        babyAgeMax,
        motherType,
        planType,
        engagement,
        daysInactive,
        hasMultipleBabies,
        isPremium,
        isVerified,
        lastActivityDays,
        totalMemories,
        totalActivities,
      },
    });
    return res.json({ success: true, data: campaign });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao editar campanha' });
  }
};

// Deletar campanha
export const deleteCampaign = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.marketingCampaign.delete({ where: { id } });
    return res.json({ success: true, message: 'Campanha deletada com sucesso' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao deletar campanha' });
  }
};

// Função utilitária para corrigir BigInt em arrays de estatísticas
function fixBigInt(arr: any[] | any) {
  // Garantir que arr seja sempre um array
  if (!Array.isArray(arr)) {
    return [];
  }
  
  return arr.map((item) => ({
    ...item,
    count: typeof item.count === 'bigint' ? Number(item.count) : item.count,
  }));
}

// Obter estatísticas de segmentação
export const getSegmentationStats = async (req: Request, res: Response) => {
  try {
    // Estatísticas por idade do bebê
    const babyAgeStats = await prisma.$queryRaw`
      SELECT 
        CASE 
          WHEN EXTRACT(MONTH FROM AGE(NOW(), "birthDate")) < 3 THEN '0-3 meses'
          WHEN EXTRACT(MONTH FROM AGE(NOW(), "birthDate")) < 6 THEN '3-6 meses'
          WHEN EXTRACT(MONTH FROM AGE(NOW(), "birthDate")) < 12 THEN '6-12 meses'
          WHEN EXTRACT(MONTH FROM AGE(NOW(), "birthDate")) < 24 THEN '1-2 anos'
          ELSE '2+ anos'
        END as age_group,
        COUNT(*) as count
      FROM "Baby"
      WHERE "isActive" = true
      GROUP BY age_group
      ORDER BY age_group
    `;

    // Estatísticas por plano
    const planStats = await prisma.plan.findMany({
      include: {
        _count: {
          select: { users: true }
        }
      }
    });

    // Estatísticas por engajamento
    const engagementStats = await prisma.$queryRaw`
      SELECT 
        CASE 
          WHEN "lastLoginAt" IS NULL THEN 'Nunca logou'
          WHEN "lastLoginAt" > NOW() - INTERVAL '7 days' THEN 'Ativa (7 dias)'
          WHEN "lastLoginAt" > NOW() - INTERVAL '30 days' THEN 'Ativa (30 dias)'
          WHEN "lastLoginAt" > NOW() - INTERVAL '90 days' THEN 'Inativa (90 dias)'
          ELSE 'Muito inativa'
        END as engagement_level,
        COUNT(*) as count
      FROM "User"
      WHERE "isActive" = true
      GROUP BY engagement_level
      ORDER BY engagement_level
    `;

    // Estatísticas por tipo de mãe (baseado no número de bebês)
    const motherTypeStats = await prisma.$queryRaw`
      SELECT 
        CASE 
          WHEN baby_count = 1 THEN 'Primeira vez'
          WHEN baby_count = 2 THEN 'Experiente'
          WHEN baby_count = 3 THEN 'Muito experiente'
          ELSE 'Família grande'
        END as mother_type,
        COUNT(*) as count
      FROM (
        SELECT u.id, COUNT(b.id) as baby_count
        FROM "User" u
        LEFT JOIN "Baby" b ON u.id = b."userId" AND b."isActive" = true
        WHERE u."isActive" = true
        GROUP BY u.id
      ) user_babies
      GROUP BY mother_type
      ORDER BY mother_type
    `;

    return res.json({
      success: true,
      data: {
        babyAgeStats: fixBigInt(babyAgeStats || []),
        planStats: planStats.map((p) => ({
          ...p,
          _count: { users: typeof p._count.users === 'bigint' ? Number(p._count.users) : p._count.users },
        })),
        engagementStats: fixBigInt(engagementStats || []),
        motherTypeStats: fixBigInt(motherTypeStats || []),
      }
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas de segmentação:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Erro ao obter estatísticas',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

// Calcular usuários que se encaixam na segmentação
export const getTargetUsers = async (req: Request, res: Response) => {
  try {
    const {
      babyAgeMin,
      babyAgeMax,
      motherType,
      planType,
      engagement,
      daysInactive,
      hasMultipleBabies,
      isPremium,
      isVerified,
      lastActivityDays,
      totalMemories,
      totalActivities
    } = req.body;

    let whereClause = 'WHERE u."isActive" = true';
    const params: any[] = [];
    let paramIndex = 1;

    // Filtro por idade do bebê
    if (babyAgeMin !== undefined || babyAgeMax !== undefined) {
      whereClause += ` AND EXISTS (
        SELECT 1 FROM "Baby" b 
        WHERE b."userId" = u.id 
        AND b."isActive" = true
        ${babyAgeMin !== undefined ? `AND EXTRACT(MONTH FROM AGE(NOW(), b."birthDate")) >= $${paramIndex++}` : ''}
        ${babyAgeMax !== undefined ? `AND EXTRACT(MONTH FROM AGE(NOW(), b."birthDate")) <= $${paramIndex++}` : ''}
      )`;
      if (babyAgeMin !== undefined) params.push(babyAgeMin);
      if (babyAgeMax !== undefined) params.push(babyAgeMax);
    }

    // Filtro por tipo de mãe (número de bebês)
    if (motherType) {
      const babyCountMap: { [key: string]: number } = {
        'primeira_vez': 1,
        'experiente': 2,
        'muito_experiente': 3,
        'familia_grande': 4
      };
      const minBabies = babyCountMap[motherType] || 1;
      whereClause += ` AND (
        SELECT COUNT(*) FROM "Baby" b 
        WHERE b."userId" = u.id AND b."isActive" = true
      ) >= $${paramIndex++}`;
      params.push(minBabies);
    }

    // Filtro por plano
    if (planType) {
      whereClause += ` AND p.name ILIKE $${paramIndex++}`;
      params.push(`%${planType}%`);
    }

    // Filtro por engajamento
    if (engagement) {
      switch (engagement) {
        case 'ativa':
          whereClause += ` AND u."lastLoginAt" > NOW() - INTERVAL '7 days'`;
          break;
        case 'inativa':
          whereClause += ` AND (u."lastLoginAt" IS NULL OR u."lastLoginAt" < NOW() - INTERVAL '30 days')`;
          break;
        case 'nova':
          whereClause += ` AND u."createdAt" > NOW() - INTERVAL '7 days'`;
          break;
        case 'retornando':
          whereClause += ` AND u."lastLoginAt" > NOW() - INTERVAL '1 day' AND u."lastLoginAt" < NOW() - INTERVAL '7 days'`;
          break;
      }
    }

    // Filtro por dias inativos
    if (daysInactive !== undefined) {
      whereClause += ` AND (u."lastLoginAt" IS NULL OR u."lastLoginAt" < NOW() - INTERVAL '${daysInactive} days')`;
    }

    // Filtro por múltiplos bebês
    if (hasMultipleBabies !== undefined) {
      if (hasMultipleBabies) {
        whereClause += ` AND (
          SELECT COUNT(*) FROM "Baby" b 
          WHERE b."userId" = u.id AND b."isActive" = true
        ) > 1`;
      } else {
        whereClause += ` AND (
          SELECT COUNT(*) FROM "Baby" b 
          WHERE b."userId" = u.id AND b."isActive" = true
        ) = 1`;
      }
    }

    // Filtro por premium
    if (isPremium !== undefined) {
      if (isPremium) {
        whereClause += ` AND p.name ILIKE '%premium%'`;
      } else {
        whereClause += ` AND p.name ILIKE '%básico%'`;
      }
    }

    // Filtro por email verificado
    if (isVerified !== undefined) {
      whereClause += ` AND u."emailVerified" = $${paramIndex++}`;
      params.push(isVerified);
    }

    // Filtro por última atividade
    if (lastActivityDays !== undefined) {
      whereClause += ` AND (u."lastLoginAt" IS NULL OR u."lastLoginAt" < NOW() - INTERVAL '${lastActivityDays} days')`;
    }

    // Filtro por total de memórias
    if (totalMemories !== undefined) {
      whereClause += ` AND (
        SELECT COUNT(*) FROM "Memory" m 
        WHERE m."userId" = u.id
      ) >= $${paramIndex++}`;
      params.push(totalMemories);
    }

    // Filtro por total de atividades
    if (totalActivities !== undefined) {
      whereClause += ` AND (
        SELECT COUNT(*) FROM "Activity" a 
        WHERE a."userId" = u.id
      ) >= $${paramIndex++}`;
      params.push(totalActivities);
    }

    const query = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u."emailVerified",
        u."lastLoginAt",
        u."createdAt",
        p.name as plan_name,
        (SELECT COUNT(*) FROM "Baby" b WHERE b."userId" = u.id AND b."isActive" = true) as baby_count,
        (SELECT COUNT(*) FROM "Memory" m WHERE m."userId" = u.id) as memory_count,
        (SELECT COUNT(*) FROM "Activity" a WHERE a."userId" = u.id) as activity_count
      FROM "User" u
      LEFT JOIN "Plan" p ON u."planId" = p.id
      ${whereClause}
      ORDER BY u."createdAt" DESC
      LIMIT 100
    `;

    const targetUsers = await prisma.$queryRawUnsafe(query, ...params);
    const totalCount = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "User" u LEFT JOIN "Plan" p ON u."planId" = p.id ${whereClause}`, ...params);

    return res.json({
      success: true,
      data: {
        users: targetUsers,
        totalCount: (totalCount as any)[0]?.count || 0,
        filters: {
          babyAgeMin,
          babyAgeMax,
          motherType,
          planType,
          engagement,
          daysInactive,
          hasMultipleBabies,
          isPremium,
          isVerified,
          lastActivityDays,
          totalMemories,
          totalActivities
        }
      }
    });
  } catch (error) {
    console.error('Erro ao calcular usuários alvo:', error);
    return res.status(500).json({ success: false, error: 'Erro ao calcular usuários alvo' });
  }
};

// Gerar conteúdo com IA para marketing
export const generateMarketingContent = async (req: Request, res: Response) => {
  try {
    console.log('[IA] Body recebido:', req.body);
    const { type, platform, targetAudience, tone, category, specificTopic, duration, format } = req.body;
    
    // Usar a função especializada do Gemini
    const result = await generateMarketingContentWithGemini(
      type,
      platform,
      targetAudience,
      {
        category,
        specificTopic,
        tone,
        duration,
        format
      }
    );
    
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Erro ao gerar conteúdo de marketing:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Erro ao gerar conteúdo',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

// (Opcional) Endpoint para integração com Gemini (Google AI)
export const generateWithGemini = async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ 
        success: false, 
        error: 'Prompt é obrigatório' 
      });
    }

    const content = await generateGeminiContent(prompt);
    
    return res.json({
      success: true,
      data: {
        content,
        prompt
      }
    });
  } catch (error) {
    console.error('Erro ao gerar conteúdo com Gemini:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Erro ao gerar conteúdo',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

// ===== BIBLIOTECA DE MARKETING DIGITAL =====

// Posts para Redes Sociais
export const getSocialMediaPosts = async (req: Request, res: Response) => {
  try {
    const { category, platform, targetAudience } = req.query;
    
    const where: any = { isActive: true };
    if (category) where.category = category;
    if (platform) where.platform = platform;
    if (targetAudience) where.targetAudience = targetAudience;

    const posts = await prisma.socialMediaPost.findMany({
      where,
      orderBy: { sortOrder: 'asc' }
    });

    return res.json({ success: true, data: posts });
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
};

export const createSocialMediaPost = async (req: Request, res: Response) => {
  try {
    const {
      title = '',
      description = '',
      category = '',
      platform = '',
      contentType = 'post',
      imageUrl = '',
      videoUrl = '',
      caption = '',
      hashtags = '',
      cta = '',
      targetAudience = '',
      isActive = true,
      sortOrder = 0,
      createdBy = 'admin'
    } = req.body;

    const socialMediaPost = await prisma.socialMediaPost.create({
      data: {
        title,
        description,
        category,
        platform,
        contentType,
        imageUrl,
        videoUrl,
        caption,
        hashtags,
        cta,
        targetAudience,
        isActive,
        sortOrder,
        createdBy,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Post criado com sucesso',
      data: socialMediaPost,
    });
  } catch (error) {
    console.error('Erro ao criar post:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

export const updateSocialMediaPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const post = await prisma.socialMediaPost.update({ where: { id }, data });
    return res.json({ success: true, data: post });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao editar post' });
  }
};

export const deleteSocialMediaPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.socialMediaPost.delete({ where: { id } });
    return res.json({ success: true, message: 'Post deletado com sucesso' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao deletar post' });
  }
};

// Anúncios
export const getAdvertisements = async (req: Request, res: Response) => {
  try {
    const { platform, adType, targetAudience } = req.query;
    
    const where: any = { isActive: true };
    if (platform) where.platform = platform;
    if (adType) where.adType = adType;
    if (targetAudience) where.targetAudience = targetAudience;

    const ads = await prisma.advertisement.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, data: ads });
  } catch (error) {
    console.error('Erro ao buscar anúncios:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
};

export const createAdvertisement = async (req: Request, res: Response) => {
  try {
    const {
      title = '',
      platform = '',
      adType = 'image',
      copyShort = '',
      copyLong = '',
      headline = '',
      description = '',
      cta = '',
      imageUrl = '',
      videoUrl = '',
      targetAudience = '',
      interests = '[]',
      budget = 0,
      isActive = true,
      createdBy = 'admin'
    } = req.body;

    const advertisement = await prisma.advertisement.create({
      data: {
        title,
        platform,
        adType,
        copyShort,
        copyLong,
        headline,
        description,
        cta,
        imageUrl,
        videoUrl,
        targetAudience,
        interests: typeof interests === 'string' ? interests : JSON.stringify(interests),
        budget,
        isActive,
        createdBy,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Anúncio criado com sucesso',
      data: advertisement,
    });
  } catch (error) {
    console.error('Erro ao criar anúncio:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

export const updateAdvertisement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const ad = await prisma.advertisement.update({ where: { id }, data });
    return res.json({ success: true, data: ad });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao editar anúncio' });
  }
};

export const deleteAdvertisement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.advertisement.delete({ where: { id } });
    return res.json({ success: true, message: 'Anúncio deletado com sucesso' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao deletar anúncio' });
  }
};

// Vídeos
export const getVideoContents = async (req: Request, res: Response) => {
  try {
    const { platform, videoType, targetAudience } = req.query;
    
    const where: any = { isActive: true };
    if (platform) where.platform = platform;
    if (videoType) where.videoType = videoType;
    if (targetAudience) where.targetAudience = targetAudience;

    const videos = await prisma.videoContent.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, data: videos });
  } catch (error) {
    console.error('Erro ao buscar vídeos:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
};

export const createVideoContent = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      platform,
      videoType,
      duration,
      videoUrl,
      thumbnailUrl,
      script,
      music,
      hashtags,
      targetAudience
    } = req.body;

    const createdBy = req.admin?.userId || 'admin';

    const video = await prisma.videoContent.create({
      data: {
        title,
        description,
        platform,
        videoType: videoType || 'reel',
        duration: duration || 30,
        videoUrl,
        thumbnailUrl,
        script: script || description || 'Roteiro do vídeo',
        music,
        hashtags: hashtags || '#babydiary #maternidade',
        targetAudience,
        createdBy
      }
    });

    return res.status(201).json({ success: true, data: video });
  } catch (error) {
    console.error('Erro ao criar vídeo:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
};

export const updateVideoContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const video = await prisma.videoContent.update({ where: { id }, data });
    return res.json({ success: true, data: video });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao editar vídeo' });
  }
};

export const deleteVideoContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.videoContent.delete({ where: { id } });
    return res.json({ success: true, message: 'Vídeo deletado com sucesso' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao deletar vídeo' });
  }
};

// Argumentos de Venda
export const getSalesArguments = async (req: Request, res: Response) => {
  try {
    const { category, targetAudience } = req.query;
    
    const where: any = { isActive: true };
    if (category) where.category = category;
    if (targetAudience) where.targetAudience = targetAudience;

    const salesArguments = await prisma.salesArgument.findMany({
      where,
      orderBy: { sortOrder: 'asc' }
    });

    return res.json({ success: true, data: salesArguments });
  } catch (error) {
    console.error('Erro ao buscar argumentos:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
};

export const createSalesArgument = async (req: Request, res: Response) => {
  try {
    const {
      title,
      category,
      argument,
      examples,
      targetAudience,
      conversionRate,
      sortOrder
    } = req.body;

    const createdBy = req.admin?.userId || 'admin';

    const salesArg = await prisma.salesArgument.create({
      data: {
        title,
        category: category || 'emocional',
        argument: argument || title || 'Argumento de venda',
        examples: examples || [],
        targetAudience,
        conversionRate,
        sortOrder: sortOrder || 0,
        createdBy
      }
    });

    return res.status(201).json({ success: true, data: salesArg });
  } catch (error) {
    console.error('Erro ao criar argumento:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
};

export const updateSalesArgument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const arg = await prisma.salesArgument.update({ where: { id }, data });
    return res.json({ success: true, data: arg });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao editar argumento' });
  }
};

export const deleteSalesArgument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.salesArgument.delete({ where: { id } });
    return res.json({ success: true, message: 'Argumento deletado com sucesso' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao deletar argumento' });
  }
};

// Links de Afiliados
export const getAffiliateLinks = async (req: Request, res: Response) => {
  try {
    const links = await prisma.affiliateLink.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, data: links });
  } catch (error) {
    console.error('Erro ao buscar links:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
};

export const createAffiliateLink = async (req: Request, res: Response) => {
  try {
    const {
      name,
      baseUrl,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm
    } = req.body;

    const createdBy = req.admin?.userId || 'admin';

    // Construir URL completa com parâmetros UTM
    const url = new URL(baseUrl);
    url.searchParams.set('utm_source', utmSource);
    url.searchParams.set('utm_medium', utmMedium);
    url.searchParams.set('utm_campaign', utmCampaign);
    if (utmContent) url.searchParams.set('utm_content', utmContent);
    if (utmTerm) url.searchParams.set('utm_term', utmTerm);

    const link = await prisma.affiliateLink.create({
      data: {
        name,
        baseUrl,
        utmSource,
        utmMedium,
        utmCampaign,
        utmContent,
        utmTerm,
        fullUrl: url.toString(),
        createdBy
      }
    });

    return res.status(201).json({ success: true, data: link });
  } catch (error) {
    console.error('Erro ao criar link:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
};

export const updateAffiliateLink = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const link = await prisma.affiliateLink.update({ where: { id }, data });
    return res.json({ success: true, data: link });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao editar link' });
  }
};

export const deleteAffiliateLink = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.affiliateLink.delete({ where: { id } });
    return res.json({ success: true, message: 'Link deletado com sucesso' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao deletar link' });
  }
};

// Upload de mídia para biblioteca digital
export const uploadDigitalMedia = [
  upload.single('file'),
  async (req: any, res: any) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          error: 'Arquivo não enviado' 
        });
      }

      // Validar tipo de arquivo
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv'];
      const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];

      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          error: 'Tipo de arquivo não suportado. Tipos aceitos: JPEG, PNG, WebP, GIF, MP4, AVI, MOV, WMV, FLV'
        });
      }

      // Validar tamanho do arquivo (10MB para imagens, 100MB para vídeos)
      const maxImageSize = 10 * 1024 * 1024; // 10MB
      const maxVideoSize = 100 * 1024 * 1024; // 100MB
      const maxSize = allowedImageTypes.includes(req.file.mimetype) ? maxImageSize : maxVideoSize;

      if (req.file.size > maxSize) {
        const maxSizeMB = maxSize / (1024 * 1024);
        return res.status(400).json({
          success: false,
          error: `Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`
        });
      }

      // Determinar pasta baseada no tipo de arquivo
      const isVideo = allowedVideoTypes.includes(req.file.mimetype);
      const folder = isVideo ? 'baby-diary/marketing/videos' : 'baby-diary/marketing/images';

      // Fazer upload para o Cloudinary
      const result = await uploadImage(req.file, folder);

      return res.json({ 
        success: true, 
        data: {
          url: result.secureUrl, 
          publicId: result.publicId,
          type: isVideo ? 'video' : 'image',
          filename: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype
        }
      });
    } catch (error) {
      console.error('Erro ao fazer upload de mídia:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao fazer upload de mídia',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
];

// Download de mídia
export const downloadDigitalMedia = async (req: Request, res: Response) => {
  try {
    const { publicId, filename } = req.query;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        error: 'ID público da mídia é obrigatório'
      });
    }

    // Gerar URL de download do Cloudinary
    const downloadUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/fl_attachment:${filename || 'download'}/${publicId}`;

    return res.json({
      success: true,
      data: {
        downloadUrl,
        filename: filename || 'download'
      }
    });
  } catch (error) {
    console.error('Erro ao gerar URL de download:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao gerar URL de download'
    });
  }
};

// Deletar mídia
export const deleteDigitalMedia = async (req: Request, res: Response) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        error: 'ID público da mídia é obrigatório'
      });
    }

    // Deletar do Cloudinary
    const { deleteImage } = await import('../config/cloudinary');
    await deleteImage(publicId);

    return res.json({
      success: true,
      message: 'Mídia deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar mídia:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao deletar mídia'
    });
  }
};

export const getMarketingLibrary = async (req: Request, res: Response) => {
  try {
    const createdBy = req.admin?.userId || 'admin';

    const [posts, ads, videos, salesArgs, links] = await Promise.all([
      prisma.socialMediaPost.findMany({
        where: { createdBy },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.advertisement.findMany({
        where: { createdBy },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.videoContent.findMany({
        where: { createdBy },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.salesArgument.findMany({
        where: { createdBy },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.affiliateLink.findMany({
        where: { createdBy },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return res.json({
      success: true,
      data: {
        posts,
        ads,
        videos,
        arguments: salesArgs,
        links,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar biblioteca de marketing:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const { timeRange = '30d' } = req.query;
    const createdBy = req.admin?.userId || 'admin';

    // Calcular datas baseadas no timeRange
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Buscar dados em paralelo
    const [
      campaigns,
      posts,
      ads,
      totalCampaigns,
      totalPosts,
      totalAds
    ] = await Promise.all([
      // Campanhas ativas no período
      prisma.marketingCampaign.findMany({
        where: {
          createdBy,
          createdAt: { gte: startDate },
          status: 'active'
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      // Posts no período
      prisma.socialMediaPost.findMany({
        where: {
          createdBy,
          createdAt: { gte: startDate }
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      // Anúncios no período
      prisma.advertisement.findMany({
        where: {
          createdBy,
          createdAt: { gte: startDate }
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      // Total de campanhas
      prisma.marketingCampaign.count({
        where: { createdBy }
      }),
      // Total de posts
      prisma.socialMediaPost.count({
        where: { createdBy }
      }),
      // Total de anúncios
      prisma.advertisement.count({
        where: { createdBy }
      })
    ]);

    // Gerar dados simulados de performance (em produção, viriam de APIs externas)
    const generatePerformanceData = (items: any[], type: string) => {
      return items.map(item => {
        const baseReach = Math.floor(Math.random() * 10000) + 1000;
        const baseEngagement = Math.random() * 0.1 + 0.02; // 2-12%
        
        return {
          id: item.id,
          name: item.title || item.name,
          type: type,
          status: item.status || 'active',
          sentAt: item.createdAt,
          openRate: Math.random() * 0.3 + 0.1, // 10-40%
          clickRate: Math.random() * 0.15 + 0.02, // 2-17%
          conversionRate: Math.random() * 0.05 + 0.01, // 1-6%
          reach: baseReach,
          engagement: Math.floor(baseReach * baseEngagement),
          // Dados específicos para posts
          ...(type === 'post' && {
            platform: item.platform,
            publishedAt: item.createdAt,
            likes: Math.floor(baseReach * 0.08),
            shares: Math.floor(baseReach * 0.03),
            comments: Math.floor(baseReach * 0.02),
          }),
          // Dados específicos para anúncios
          ...(type === 'ad' && {
            platform: item.platform,
            impressions: baseReach * 2,
            clicks: Math.floor(baseReach * 0.05),
            ctr: Math.random() * 0.1 + 0.01, // 1-11%
            spend: Math.floor(Math.random() * 500) + 50,
            conversions: Math.floor(baseReach * 0.02),
            cpa: Math.floor(Math.random() * 50) + 10,
          })
        };
      });
    };

    // Gerar dados de tendências
    const generateTrendsData = () => {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
      const trends = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        trends.push({
          date: date.toISOString().split('T')[0],
          reach: Math.floor(Math.random() * 5000) + 1000,
          engagement: Math.floor(Math.random() * 500) + 100,
          conversions: Math.floor(Math.random() * 50) + 10,
        });
      }
      
      return trends;
    };

    // Gerar dados de segmentação
    const generateSegmentationData = () => ({
      byPlatform: [
        { platform: 'Facebook', reach: 15000, engagement: 0.08, conversions: 0.03 },
        { platform: 'Instagram', reach: 12000, engagement: 0.12, conversions: 0.04 },
        { platform: 'TikTok', reach: 8000, engagement: 0.15, conversions: 0.02 },
        { platform: 'Google Ads', reach: 20000, engagement: 0.05, conversions: 0.06 },
      ],
      byAudience: [
        { audience: 'Gestantes', reach: 10000, engagement: 0.10, conversions: 0.04 },
        { audience: 'Mães de Bebês', reach: 15000, engagement: 0.12, conversions: 0.05 },
        { audience: 'Mães de Crianças', reach: 8000, engagement: 0.08, conversions: 0.03 },
      ],
      byContentType: [
        { type: 'Post', reach: 12000, engagement: 0.11, conversions: 0.03 },
        { type: 'Anúncio', reach: 18000, engagement: 0.06, conversions: 0.05 },
        { type: 'Vídeo', reach: 9000, engagement: 0.15, conversions: 0.04 },
      ]
    });

    const analyticsData = {
      overview: {
        totalCampaigns,
        activeCampaigns: campaigns.length,
        totalPosts,
        totalAds,
        totalEngagement: Math.floor(Math.random() * 50000) + 10000,
        totalReach: Math.floor(Math.random() * 200000) + 50000,
      },
      performance: {
        campaigns: generatePerformanceData(campaigns, 'campaign'),
        posts: generatePerformanceData(posts, 'post'),
        ads: generatePerformanceData(ads, 'ad'),
      },
      trends: {
        daily: generateTrendsData(),
        weekly: [], // Implementar se necessário
        monthly: [], // Implementar se necessário
      },
      segmentation: generateSegmentationData(),
    };

    return res.json({
      success: true,
      data: analyticsData,
    });
  } catch (error) {
    console.error('Erro ao buscar analytics:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

// ===== CALENDÁRIO EDITORIAL =====

export const getScheduledPosts = async (req: Request, res: Response) => {
  try {
    const { month, year, platform, status } = req.query;
    const createdBy = req.admin?.userId || 'admin';

    let where: any = { createdBy };

    // Filtrar por mês/ano se fornecido
    if (month && year) {
      const startDate = new Date(parseInt(year as string), parseInt(month as string) - 1, 1);
      const endDate = new Date(parseInt(year as string), parseInt(month as string), 0);
      where.scheduledAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Filtrar por plataforma se fornecido
    if (platform) {
      where.platform = platform;
    }

    // Filtrar por status se fornecido
    if (status) {
      where.status = status;
    }

    const scheduledPosts = await prisma.scheduledPost.findMany({
      where,
      orderBy: { scheduledAt: 'asc' },
    });

    return res.json({
      success: true,
      data: scheduledPosts,
    });
  } catch (error) {
    console.error('Erro ao buscar posts agendados:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

export const createScheduledPost = async (req: Request, res: Response) => {
  try {
    const {
      title,
      content,
      platform,
      contentType,
      scheduledAt,
      targetAudience,
      category,
      hashtags,
      imageUrl,
      videoUrl,
      status = 'scheduled'
    } = req.body;

    const createdBy = req.admin?.userId || 'admin';

    const scheduledPost = await prisma.scheduledPost.create({
      data: {
        title,
        content,
        platform,
        contentType,
        scheduledAt: new Date(scheduledAt),
        targetAudience,
        category,
        hashtags,
        imageUrl,
        videoUrl,
        status,
        createdBy,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Post agendado com sucesso',
      data: scheduledPost,
    });
  } catch (error) {
    console.error('Erro ao agendar post:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

export const updateScheduledPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const createdBy = req.admin?.userId || 'admin';

    // Verificar se o post existe e pertence ao admin
    const existingPost = await prisma.scheduledPost.findFirst({
      where: { id, createdBy },
    });

    if (!existingPost) {
      return res.status(404).json({
        success: false,
        error: 'Post agendado não encontrado',
      });
    }

    // Tratar data de agendamento se fornecida
    if (updateData.scheduledAt) {
      updateData.scheduledAt = new Date(updateData.scheduledAt);
    }

    const updatedPost = await prisma.scheduledPost.update({
      where: { id },
      data: updateData,
    });

    return res.json({
      success: true,
      message: 'Post atualizado com sucesso',
      data: updatedPost,
    });
  } catch (error) {
    console.error('Erro ao atualizar post agendado:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

export const deleteScheduledPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const createdBy = req.admin?.userId || 'admin';

    // Verificar se o post existe e pertence ao admin
    const existingPost = await prisma.scheduledPost.findFirst({
      where: { id, createdBy },
    });

    if (!existingPost) {
      return res.status(404).json({
        success: false,
        error: 'Post agendado não encontrado',
      });
    }

    await prisma.scheduledPost.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: 'Post removido com sucesso',
    });
  } catch (error) {
    console.error('Erro ao remover post agendado:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

// ===== HASHTAG ANALYTICS =====

export const getHashtagAnalytics = async (req: Request, res: Response) => {
  try {
    const { platform = 'all', category, period = '7d', search } = req.query;
    
    console.log('🔍 Buscando analytics de hashtags...', { platform, category, period, search });

    // Buscar hashtags em tendência das APIs reais
    let trendingHashtags: any[] = [];
    
    if (platform === 'all' || platform === 'instagram') {
      try {
        const instagramTrending = await socialMediaAPI.getTrendingHashtags('instagram');
        trendingHashtags.push(...instagramTrending);
      } catch (error) {
        console.error('Erro ao buscar hashtags do Instagram:', error);
      }
    }
    
    if (platform === 'all' || platform === 'facebook') {
      try {
        const facebookTrending = await socialMediaAPI.getTrendingHashtags('facebook');
        trendingHashtags.push(...facebookTrending);
      } catch (error) {
        console.error('Erro ao buscar hashtags do Facebook:', error);
      }
    }

    // Filtrar por categoria se especificado
    if (category && category !== 'all') {
      trendingHashtags = trendingHashtags.filter(h => h.category === category);
    }

    // Filtrar por busca se especificado
    if (search) {
      const searchLower = search.toString().toLowerCase();
      trendingHashtags = trendingHashtags.filter(h => 
        h.hashtag.toLowerCase().includes(searchLower)
      );
    }

    // Gerar métricas gerais
    const totalHashtags = trendingHashtags.length;
    const totalReach = trendingHashtags.reduce((sum, h) => sum + h.reach, 0);
    const avgGrowth = trendingHashtags.length > 0 
      ? trendingHashtags.reduce((sum, h) => sum + parseFloat(h.growth.replace('%', '')), 0) / trendingHashtags.length 
      : 0;

    // Análise por categoria
    const categoryAnalysis = trendingHashtags.reduce((acc, hashtag) => {
      const category = hashtag.category;
      if (!acc[category]) {
        acc[category] = {
          count: 0,
          totalReach: 0,
          avgGrowth: 0,
          hashtags: []
        };
      }
      acc[category].count++;
      acc[category].totalReach += hashtag.reach;
      acc[category].hashtags.push(hashtag);
      return acc;
    }, {} as any);

    // Calcular média de crescimento por categoria
    Object.keys(categoryAnalysis).forEach(category => {
      const hashtags = categoryAnalysis[category].hashtags;
      const totalGrowth = hashtags.reduce((sum: number, h: any) => 
        sum + parseFloat(h.growth.replace('%', '')), 0
      );
      categoryAnalysis[category].avgGrowth = hashtags.length > 0 ? totalGrowth / hashtags.length : 0;
    });

    // Análise por dificuldade
    const difficultyAnalysis = trendingHashtags.reduce((acc, hashtag) => {
      const difficulty = hashtag.difficulty;
      if (!acc[difficulty]) {
        acc[difficulty] = { count: 0, hashtags: [] };
      }
      acc[difficulty].count++;
      acc[difficulty].hashtags.push(hashtag);
      return acc;
    }, {} as any);

    // Dados de performance por plataforma
    const platformAnalysis = trendingHashtags.reduce((acc, hashtag) => {
      const platform = hashtag.platform;
      if (!acc[platform]) {
        acc[platform] = {
          count: 0,
          totalReach: 0,
          avgGrowth: 0,
          hashtags: []
        };
      }
      acc[platform].count++;
      acc[platform].totalReach += hashtag.reach;
      acc[platform].hashtags.push(hashtag);
      return acc;
    }, {} as any);

    // Calcular média de crescimento por plataforma
    Object.keys(platformAnalysis).forEach(platform => {
      const hashtags = platformAnalysis[platform].hashtags;
      const totalGrowth = hashtags.reduce((sum: number, h: any) => 
        sum + parseFloat(h.growth.replace('%', '')), 0
      );
      platformAnalysis[platform].avgGrowth = hashtags.length > 0 ? totalGrowth / hashtags.length : 0;
    });

    // Status das APIs
    const apiStatus = {
      instagram: socialMediaAPI.isInstagramConfigured(),
      facebook: socialMediaAPI.isFacebookConfigured()
    };

    return res.json({
      success: true,
      data: {
        metrics: {
          totalHashtags,
          totalReach,
          avgGrowth: Math.round(avgGrowth * 100) / 100,
          trendingCount: trendingHashtags.filter(h => h.trending).length
        },
        trendingHashtags: trendingHashtags.slice(0, 20), // Top 20
        categoryAnalysis,
        difficultyAnalysis,
        platformAnalysis,
        apiStatus,
        filters: {
          platform,
          category,
          period,
          search
        }
      }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar analytics de hashtags:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

export const getHashtagSuggestions = async (req: Request, res: Response) => {
  try {
    const { platform = 'all', category, content, targetAudience } = req.query;
    
    console.log('💡 Gerando sugestões de hashtags...', { platform, category, content, targetAudience });

    // Buscar hashtags em tendência das APIs reais
    let allTrendingHashtags: any[] = [];
    
    if (platform === 'all' || platform === 'instagram') {
      try {
        const instagramTrending = await socialMediaAPI.getTrendingHashtags('instagram');
        allTrendingHashtags.push(...instagramTrending);
      } catch (error) {
        console.error('Erro ao buscar hashtags do Instagram:', error);
      }
    }
    
    if (platform === 'all' || platform === 'facebook') {
      try {
        const facebookTrending = await socialMediaAPI.getTrendingHashtags('facebook');
        allTrendingHashtags.push(...facebookTrending);
      } catch (error) {
        console.error('Erro ao buscar hashtags do Facebook:', error);
      }
    }

    // Filtrar por categoria se especificado
    if (category && category !== 'all') {
      allTrendingHashtags = allTrendingHashtags.filter(h => h.category === category);
    }

    // Gerar sugestões baseadas no conteúdo
    let suggestions = allTrendingHashtags;

    if (content) {
      const contentLower = content.toString().toLowerCase();
      
      // Filtrar hashtags relevantes ao conteúdo
      suggestions = allTrendingHashtags.filter(hashtag => {
        const hashtagLower = hashtag.hashtag.toLowerCase();
        return hashtagLower.includes(contentLower) || 
               contentLower.includes(hashtagLower.replace('#', ''));
      });

      // Se não encontrou hashtags específicas, usar hashtags da mesma categoria
      if (suggestions.length === 0) {
        const contentWords = contentLower.split(' ');
        suggestions = allTrendingHashtags.filter(hashtag => 
          contentWords.some(word => hashtag.category.includes(word))
        );
      }
    }

    // Filtrar por audiência se especificado
    if (targetAudience) {
      const audienceLower = targetAudience.toString().toLowerCase();
      suggestions = suggestions.filter(hashtag => {
        if (audienceLower.includes('maternidade') || audienceLower.includes('mae')) {
          return hashtag.category === 'maternidade' || hashtag.category === 'gestacao';
        }
        if (audienceLower.includes('bebe') || audienceLower.includes('bebê')) {
          return hashtag.category === 'bebe' || hashtag.category === 'desenvolvimento';
        }
        return true;
      });
    }

    // Ordenar por relevância (crescimento + alcance)
    suggestions.sort((a, b) => {
      const aScore = parseFloat(a.growth.replace('%', '')) + (a.reach / 10000);
      const bScore = parseFloat(b.growth.replace('%', '')) + (b.reach / 10000);
      return bScore - aScore;
    });

    // Gerar sugestões inteligentes baseadas em IA
    const aiSuggestions = await generateAISuggestions(content, targetAudience, platform);

    // Combinar sugestões reais com sugestões de IA
    const combinedSuggestions = [
      ...suggestions.slice(0, 10), // Top 10 das APIs reais
      ...aiSuggestions.slice(0, 5)  // Top 5 da IA
    ];

    return res.json({
      success: true,
      data: {
        suggestions: combinedSuggestions,
        trending: suggestions.slice(0, 5),
        aiSuggestions,
        filters: {
          platform,
          category,
          content,
          targetAudience
        }
      }
    });
  } catch (error) {
    console.error('❌ Erro ao gerar sugestões de hashtags:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

export const analyzeHashtagPerformance = async (req: Request, res: Response) => {
  try {
    const { hashtag, platform = 'all' } = req.query;
    
    if (!hashtag) {
      return res.status(400).json({
        success: false,
        error: 'Hashtag é obrigatória'
      });
    }

    console.log('📊 Analisando performance da hashtag:', hashtag, 'plataforma:', platform);

    // Buscar dados reais das APIs
    let hashtagData: any = {};

    if (platform === 'all' || platform === 'instagram') {
      try {
        const instagramData = await socialMediaAPI.getInstagramHashtagData(hashtag.toString());
        if (instagramData) {
          hashtagData.instagram = instagramData;
        }
      } catch (error) {
        console.error('Erro ao buscar dados do Instagram:', error);
      }
    }

    if (platform === 'all' || platform === 'facebook') {
      try {
        const facebookData = await socialMediaAPI.getFacebookHashtagData(hashtag.toString());
        if (facebookData) {
          hashtagData.facebook = facebookData;
        }
      } catch (error) {
        console.error('Erro ao buscar dados do Facebook:', error);
      }
    }

    // Se não encontrou dados reais, usar dados simulados
    if (Object.keys(hashtagData).length === 0) {
      if (platform === 'all' || platform === 'instagram') {
        hashtagData.instagram = socialMediaAPI.getFallbackData(hashtag.toString(), 'instagram');
      }
      if (platform === 'all' || platform === 'facebook') {
        hashtagData.facebook = socialMediaAPI.getFallbackData(hashtag.toString(), 'facebook');
      }
    }

    // Calcular métricas agregadas
    const platforms = Object.keys(hashtagData);
    const totalReach = platforms.reduce((sum, p) => sum + hashtagData[p].reach, 0);
    const totalEngagement = platforms.reduce((sum, p) => sum + hashtagData[p].engagement, 0);
    const totalPosts = platforms.reduce((sum, p) => sum + hashtagData[p].posts, 0);
    const avgEngagementRate = platforms.length > 0 
      ? platforms.reduce((sum, p) => sum + hashtagData[p].engagementRate, 0) / platforms.length 
      : 0;

    // Análise de tendência
    const trendingAnalysis = platforms.map(p => ({
      platform: p,
      trending: hashtagData[p].trending,
      performance: hashtagData[p].performance,
      difficulty: hashtagData[p].difficulty
    }));

    // Recomendações
    const recommendations = generateHashtagRecommendations(hashtagData, hashtag.toString());

    return res.json({
      success: true,
      data: {
        hashtag,
        platforms: hashtagData,
        aggregatedMetrics: {
          totalReach,
          totalEngagement,
          totalPosts,
          avgEngagementRate: Math.round(avgEngagementRate * 100) / 100,
          platformsCount: platforms.length
        },
        trendingAnalysis,
        recommendations,
        analysis: {
          overallPerformance: calculateOverallPerformance(hashtagData),
          bestPlatform: findBestPlatform(hashtagData),
          improvementTips: generateImprovementTips(hashtagData)
        }
      }
    });
  } catch (error) {
    console.error('❌ Erro ao analisar performance da hashtag:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

export const getTrendingHashtags = async (req: Request, res: Response) => {
  try {
    const { platform = 'all', limit = '10' } = req.query;
    
    console.log('🔥 Buscando hashtags em tendência...', { platform, limit });

    let trendingHashtags: any[] = [];
    
    if (platform === 'all' || platform === 'instagram') {
      try {
        const instagramTrending = await socialMediaAPI.getTrendingHashtags('instagram');
        trendingHashtags.push(...instagramTrending);
      } catch (error) {
        console.error('Erro ao buscar hashtags do Instagram:', error);
      }
    }
    
    if (platform === 'all' || platform === 'facebook') {
      try {
        const facebookTrending = await socialMediaAPI.getTrendingHashtags('facebook');
        trendingHashtags.push(...facebookTrending);
      } catch (error) {
        console.error('Erro ao buscar hashtags do Facebook:', error);
      }
    }

    // Ordenar por crescimento
    trendingHashtags.sort((a, b) => {
      const aGrowth = parseFloat(a.growth.replace('%', ''));
      const bGrowth = parseFloat(b.growth.replace('%', ''));
      return bGrowth - aGrowth;
    });

    // Limitar resultados
    const limitNum = parseInt(limit.toString());
    trendingHashtags = trendingHashtags.slice(0, limitNum);

    // Análise por categoria
    const categoryBreakdown = trendingHashtags.reduce((acc, hashtag) => {
      const category = hashtag.category;
      if (!acc[category]) {
        acc[category] = { count: 0, hashtags: [] };
      }
      acc[category].count++;
      acc[category].hashtags.push(hashtag);
      return acc;
    }, {} as any);

    return res.json({
      success: true,
      data: {
        trendingHashtags,
        categoryBreakdown,
        totalCount: trendingHashtags.length,
        filters: { platform, limit }
      }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar hashtags em tendência:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Funções auxiliares
async function generateAISuggestions(content: any, targetAudience: any, platform: any): Promise<any[]> {
  try {
    // Simular sugestões de IA baseadas no contexto
    const suggestions = [
      {
        hashtag: '#maternidade2024',
        growth: '+35%',
        reach: 750000,
        category: 'maternidade',
        trending: true,
        difficulty: 'medium',
        platform: platform === 'all' ? 'instagram' : platform,
        aiGenerated: true,
        relevance: 'high'
      },
      {
        hashtag: '#bebesaudavel',
        growth: '+28%',
        reach: 520000,
        category: 'saude',
        trending: true,
        difficulty: 'easy',
        platform: platform === 'all' ? 'facebook' : platform,
        aiGenerated: true,
        relevance: 'high'
      }
    ];

    return suggestions;
  } catch (error) {
    console.error('Erro ao gerar sugestões de IA:', error);
    return [];
  }
}

function generateHashtagRecommendations(hashtagData: any, hashtag: string): any[] {
  const recommendations = [];

  // Verificar se a hashtag está performando bem
  const platforms = Object.keys(hashtagData);
  const avgEngagement = platforms.reduce((sum, p) => sum + hashtagData[p].engagement, 0) / platforms.length;

  if (avgEngagement < 1000) {
    recommendations.push({
      type: 'warning',
      title: 'Engajamento Baixo',
      description: `A hashtag #${hashtag} tem engajamento baixo. Considere usar hashtags mais populares.`,
      action: 'Buscar hashtags alternativas'
    });
  }

  if (platforms.length === 1) {
    recommendations.push({
      type: 'info',
      title: 'Expansão de Plataforma',
      description: `Teste a hashtag #${hashtag} em outras plataformas para aumentar o alcance.`,
      action: 'Testar em múltiplas plataformas'
    });
  }

  return recommendations;
}

function calculateOverallPerformance(hashtagData: any): string {
  const platforms = Object.keys(hashtagData);
  const avgEngagement = platforms.reduce((sum, p) => sum + hashtagData[p].engagement, 0) / platforms.length;
  
  if (avgEngagement > 5000) return 'excellent';
  if (avgEngagement > 2000) return 'good';
  if (avgEngagement > 500) return 'average';
  return 'poor';
}

function findBestPlatform(hashtagData: any): string {
  const platforms = Object.keys(hashtagData);
  if (platforms.length === 0) return 'none';

  return platforms.reduce((best, platform) => {
    return hashtagData[platform].engagement > hashtagData[best].engagement ? platform : best;
  });
}

function generateImprovementTips(hashtagData: any): string[] {
  const tips = [];
  const platforms = Object.keys(hashtagData);

  if (platforms.length === 0) {
    tips.push('Teste a hashtag em diferentes plataformas para encontrar onde ela performa melhor.');
    return tips;
  }

  const avgEngagement = platforms.reduce((sum, p) => sum + hashtagData[p].engagement, 0) / platforms.length;

  if (avgEngagement < 1000) {
    tips.push('Combine com hashtags mais populares para aumentar o alcance.');
    tips.push('Use a hashtag em horários de pico de engajamento.');
  }

  if (platforms.length === 1) {
    tips.push('Expanda para outras plataformas para maximizar o alcance.');
  }

  return tips;
} 