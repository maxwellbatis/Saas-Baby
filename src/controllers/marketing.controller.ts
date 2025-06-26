import { Request, Response } from 'express';
import prisma from '@/config/database';
import { generateGeminiContent, generateMarketingContent as generateMarketingContentWithGemini } from '@/services/gemini.service';
import { uploadImage, uploadMedia } from '@/config/cloudinary';
import multer from 'multer';
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
      sortOrder
    } = req.body;

    const createdBy = req.admin?.userId || 'admin';

    const post = await prisma.socialMediaPost.create({
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
        sortOrder: sortOrder || 0,
        createdBy
      }
    });

    return res.status(201).json({ success: true, data: post });
  } catch (error) {
    console.error('Erro ao criar post:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
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
      interests,
      budget
    } = req.body;

    const createdBy = req.admin?.userId || 'admin';

    const ad = await prisma.advertisement.create({
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
        interests: interests || [],
        budget,
        createdBy
      }
    });

    return res.status(201).json({ success: true, data: ad });
  } catch (error) {
    console.error('Erro ao criar anúncio:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
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
        videoType,
        duration,
        videoUrl,
        thumbnailUrl,
        script,
        music,
        hashtags,
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
        category,
        argument,
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

// Gerar conteúdo com IA para marketing
export const generateMarketingContent = async (req: Request, res: Response) => {
  try {
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
    const [socialMediaPosts, advertisements, videoContents, salesArguments, affiliateLinks] = await Promise.all([
      prisma.socialMediaPost.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
      prisma.advertisement.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } }),
      prisma.videoContent.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } }),
      prisma.salesArgument.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
      prisma.affiliateLink.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } })
    ]);
    return res.json({
      success: true,
      data: {
        socialMediaPosts,
        advertisements,
        videoContents,
        salesArguments,
        affiliateLinks
      }
    });
  } catch (error) {
    console.error('Erro ao buscar biblioteca de marketing:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
}; 