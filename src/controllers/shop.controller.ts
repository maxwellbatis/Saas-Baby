import { Request, Response } from 'express';
import prisma from '@/config/database';
import { createPagarmeOrder, getPagarmeOrder, cancelPagarmeOrder, PagarmeOrder, PagarmeCustomer, PagarmeAddress, PagarmeItem, PagarmePayment, PagarmeShipping } from '../config/pagarme';
import { validationResult } from 'express-validator';
import { body } from 'express-validator';
import { PrismaClient } from '@prisma/client';

const prismaClient = new PrismaClient();

// ================= PRODUTOS =================
// Listar todos os produtos
export const getAllShopItems = async (req: Request, res: Response) => {
  try {
    const items = await prisma.shopItem.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        categoryObj: true,
        tags: { include: { tag: true } }
      }
    });
    return res.json({ success: true, data: items });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao buscar produtos' });
  }
};

// Buscar produto por ID ou slug
export const getShopItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ success: false, error: 'ID não fornecido' });
    }

    const isNumeric = /^\d+$/.test(id);
    
    let item;
    if (isNumeric) {
      // Buscar por ID numérico
      item = await prisma.shopItem.findUnique({ 
        where: { id: parseInt(id) },
        include: {
          categoryObj: true,
          tags: { include: { tag: true } }
        }
      });
    } else {
      // Buscar por slug
      item = await prisma.shopItem.findUnique({ 
        where: { slug: id },
        include: {
          categoryObj: true,
          tags: { include: { tag: true } }
        }
      });
    }
    
    if (!item) {
      return res.status(404).json({ success: false, error: 'Produto não encontrado' });
    }
    return res.json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao buscar produto' });
  }
};

// Buscar produto por slug
export const getShopItemBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    const item = await prisma.shopItem.findUnique({ 
      where: { slug },
      include: {
        categoryObj: true,
        tags: { include: { tag: true } }
      }
    });
    
    if (!item) {
      return res.status(404).json({ success: false, error: 'Produto não encontrado' });
    }
    return res.json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao buscar produto' });
  }
};

// Função para gerar slug a partir do nome
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .trim()
    .replace(/^-+|-+$/g, ''); // Remove hífens no início e fim
}

// Função para gerar slug único
async function generateUniqueSlug(name: string): Promise<string> {
  let slug = generateSlug(name);
  let counter = 1;
  let uniqueSlug = slug;

  while (true) {
    const existing = await prismaClient.shopItem.findUnique({
      where: { slug: uniqueSlug }
    });

    if (!existing) {
      break;
    }

    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
}

// Criar produto
export const createShopItem = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      type,
      category,
      price,
      imageUrl,
      isActive = true,
      isLimited = false,
      stock,
      sortOrder = 0,
      categoryId,
      tags,
      gallery,
      promoPrice,
      coupon,
      promoStart,
      promoEnd,
      mainImage,
      isPromo = false
    } = req.body;

    const slug = await generateUniqueSlug(name);

    const shopItem = await prisma.shopItem.create({
      data: {
        name,
        description,
        type,
        category,
        price,
        imageUrl,
        isActive,
        isLimited,
        stock,
        sortOrder,
        categoryId,
        gallery,
        promoPrice,
        coupon,
        promoStart,
        promoEnd,
        mainImage,
        isPromo,
        slug
      }
    });

    // Adicionar tags se fornecidas
    if (tags && tags.length > 0) {
      const tagConnections = tags.map((tagId: string) => ({
        shopItemId: shopItem.id,
        tagId
      }));

      await prisma.shopItemTag.createMany({
        data: tagConnections
      });
    }

    return res.status(201).json({ success: true, data: shopItem });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return res.status(500).json({ success: false, error: 'Erro ao criar produto' });
  }
};

// Atualizar produto
export const updateShopItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ success: false, error: 'ID não fornecido' });
    }
    
    const {
      name,
      description,
      type,
      category,
      price,
      imageUrl,
      isActive,
      isLimited,
      stock,
      sortOrder,
      categoryId,
      tags,
      gallery,
      promoPrice,
      coupon,
      promoStart,
      promoEnd,
      mainImage,
      isPromo
    } = req.body;

    // Buscar produto atual para verificar se o nome mudou
    const currentProduct = await prisma.shopItem.findUnique({
      where: { id: parseInt(id) }
    });

    if (!currentProduct) {
      return res.status(404).json({ success: false, error: 'Produto não encontrado' });
    }

    // Gerar novo slug se o nome mudou
    let slug = currentProduct.slug;
    if (name && name !== currentProduct.name) {
      slug = await generateUniqueSlug(name);
    }

    const shopItem = await prisma.shopItem.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        type,
        category,
        price,
        imageUrl,
        isActive,
        isLimited,
        stock,
        sortOrder,
        categoryId,
        gallery,
        promoPrice,
        coupon,
        promoStart,
        promoEnd,
        mainImage,
        isPromo,
        slug
      }
    });

    // Atualizar tags se fornecidas
    if (tags) {
      // Remover tags existentes
      await prisma.shopItemTag.deleteMany({
        where: { shopItemId: parseInt(id) }
      });

      // Adicionar novas tags
      if (tags.length > 0) {
        const tagConnections = tags.map((tagId: string) => ({
          shopItemId: parseInt(id),
          tagId
        }));

        await prisma.shopItemTag.createMany({
          data: tagConnections
        });
      }
    }

    return res.json({ success: true, data: shopItem });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return res.status(500).json({ success: false, error: 'Erro ao atualizar produto' });
  }
};

// Deletar produto
export const deleteShopItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ success: false, error: 'ID não fornecido' });
    }
    
    await prisma.shopItem.delete({ where: { id: parseInt(id) } });
    return res.json({ success: true, message: 'Produto deletado com sucesso' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao deletar produto' });
  }
};

// ================= CATEGORIAS =================
// Listar todas as categorias
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
    return res.json({ success: true, data: categories });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao buscar categorias' });
  }
};

// Buscar categoria por ID
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return res.status(404).json({ success: false, error: 'Categoria não encontrada' });
    }
    return res.json({ success: true, data: category });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao buscar categoria' });
  }
};

// Criar nova categoria
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, isActive, sortOrder } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Nome é obrigatório' });
    }
    const category = await prisma.category.create({
      data: { name, description, isActive: isActive ?? true, sortOrder: sortOrder ?? 0 },
    });
    return res.status(201).json({ success: true, data: category });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao criar categoria' });
  }
};

// Atualizar categoria
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, isActive, sortOrder } = req.body;
    const category = await prisma.category.update({
      where: { id },
      data: { name, description, isActive, sortOrder },
    });
    return res.json({ success: true, data: category });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao atualizar categoria' });
  }
};

// Deletar categoria
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    return res.json({ success: true, message: 'Categoria deletada com sucesso' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao deletar categoria' });
  }
};

// ================= TAGS =================
// Listar todas as tags
export const getAllTags = async (req: Request, res: Response) => {
  try {
    const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' } });
    return res.json({ success: true, data: tags });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao buscar tags' });
  }
};

// Buscar tag por ID
export const getTagById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tag = await prisma.tag.findUnique({ where: { id } });
    if (!tag) {
      return res.status(404).json({ success: false, error: 'Tag não encontrada' });
    }
    return res.json({ success: true, data: tag });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao buscar tag' });
  }
};

// Criar nova tag
export const createTag = async (req: Request, res: Response) => {
  try {
    const { name, description, isActive } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Nome é obrigatório' });
    }
    const tag = await prisma.tag.create({
      data: { name, description, isActive: isActive ?? true },
    });
    return res.status(201).json({ success: true, data: tag });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao criar tag' });
  }
};

// Atualizar tag
export const updateTag = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;
    const tag = await prisma.tag.update({
      where: { id },
      data: { name, description, isActive },
    });
    return res.json({ success: true, data: tag });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao atualizar tag' });
  }
};

// Deletar tag
export const deleteTag = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.tag.delete({ where: { id } });
    return res.json({ success: true, message: 'Tag deletada com sucesso' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao deletar tag' });
  }
};

// ================= BANNERS =================
// Listar todos os banners
export const getAllBanners = async (req: Request, res: Response) => {
  try {
    const location = req.query.location as string | undefined;
    const where: any = {};
    if (location) {
      where.location = location;
    }
    const banners = await prisma.banner.findMany({
      where,
      orderBy: { sortOrder: 'asc' }
    });
    return res.json({ success: true, data: banners });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao buscar banners' });
  }
};

// Buscar banners ativos (público)
export const getActiveBanners = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const location = req.query.location as string | undefined;
    const where: any = {
      isActive: true,
      OR: [
        { startDate: null, endDate: null },
        { startDate: { lte: now }, endDate: null },
        { startDate: null, endDate: { gte: now } },
        { startDate: { lte: now }, endDate: { gte: now } }
      ]
    };
    if (location) {
      where.location = location;
    }
    const banners = await prisma.banner.findMany({
      where,
      orderBy: { sortOrder: 'asc' }
    });
    return res.json({ success: true, data: banners });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao buscar banners' });
  }
};

// Buscar banner por ID
export const getBannerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const banner = await prisma.banner.findUnique({ where: { id } });
    if (!banner) {
      return res.status(404).json({ success: false, error: 'Banner não encontrado' });
    }
    return res.json({ success: true, data: banner });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao buscar banner' });
  }
};

// Criar banner
export const createBanner = async (req: Request, res: Response) => {
  try {
    const {
      title,
      subtitle,
      description,
      imageUrl,
      bgGradient,
      ctaText,
      ctaLink,
      badge,
      isActive,
      sortOrder,
      startDate,
      endDate,
      targetUrl,
      targetType,
      targetId,
      location
    } = req.body;

    const newBanner = await prisma.banner.create({
      data: {
        title,
        subtitle,
        description,
        imageUrl,
        bgGradient,
        ctaText,
        ctaLink,
        badge,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        targetUrl,
        targetType,
        targetId,
        location: location || 'loja',
        createdBy: (req as any).admin?.id || 'system'
      }
    });
    return res.status(201).json({ success: true, data: newBanner });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao criar banner', details: error });
  }
};

// Atualizar banner
export const updateBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      subtitle,
      description,
      imageUrl,
      bgGradient,
      ctaText,
      ctaLink,
      badge,
      isActive,
      sortOrder,
      startDate,
      endDate,
      targetUrl,
      targetType,
      targetId,
      location
    } = req.body;

    const updatedBanner = await prisma.banner.update({
      where: { id },
      data: {
        title,
        subtitle,
        description,
        imageUrl,
        bgGradient,
        ctaText,
        ctaLink,
        badge,
        isActive,
        sortOrder,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        targetUrl,
        targetType,
        targetId,
        location: location || 'loja'
      }
    });
    return res.json({ success: true, data: updatedBanner });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao atualizar banner', details: error });
  }
};

// Deletar banner
export const deleteBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.banner.delete({ where: { id } });
    return res.json({ success: true, message: 'Banner deletado com sucesso' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao deletar banner' });
  }
};

// ===== CHECKOUT REAL COM PAGAR.ME =====

// Validações para checkout real
const checkoutRealValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Pelo menos um item é obrigatório'),
  body('customer.name')
    .notEmpty()
    .withMessage('Nome do cliente é obrigatório'),
  body('customer.email')
    .isEmail()
    .withMessage('Email do cliente é obrigatório'),
  body('payment_method')
    .isIn(['credit_card', 'boleto', 'pix'])
    .withMessage('Método de pagamento inválido'),
  body('shipping_address')
    .isObject()
    .withMessage('Endereço de entrega é obrigatório'),
];

// Criar pedido real com Pagar.me
export const createRealOrder = async (req: Request, res: Response) => {
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

    const {
      items,
      customer,
      payment_method,
      shipping_address,
      installments = 1,
      card_token,
      card_data
    } = req.body;

    // Buscar produtos no banco para validar preços e estoque
    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.shopItem.findMany({
      where: { id: { in: productIds } }
    });

    if (products.length !== items.length) {
      return res.status(400).json({
        success: false,
        error: 'Alguns produtos não foram encontrados',
      });
    }

    // Validar estoque
    for (const product of products) {
      const item = items.find((i: any) => i.productId === product.id);
      if (product.stock !== null && product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Produto ${product.name} não tem estoque suficiente`,
        });
      }
    }

    // Calcular valor total
    let totalAmount = 0;
    const pagarmeItems: PagarmeItem[] = [];

    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) continue;

      const itemPrice = product.isPromo && product.promoPrice ? product.promoPrice : product.price;
      const itemTotal = itemPrice * item.quantity;
      totalAmount += itemTotal;

      pagarmeItems.push({
        amount: itemTotal,
        description: product.name,
        quantity: item.quantity,
        code: product.id.toString() // Converter ID para string
      });
    }

    // Adicionar frete se necessário
    if (shipping_address && shipping_address.shipping_cost > 0) {
      totalAmount += shipping_address.shipping_cost;
    }

    // Preparar dados do cliente para Pagar.me
    const pagarmeCustomer: PagarmeCustomer = {
      name: customer.name,
      email: customer.email,
      document: customer.document,
      type: 'individual',
      phones: customer.phone ? {
        mobile_phone: {
          country_code: '55',
          area_code: customer.phone.substring(0, 2),
          number: customer.phone.substring(2).replace(/\D/g, '')
        }
      } : undefined
    };

    // Preparar endereço de entrega
    const pagarmeShipping: PagarmeShipping = {
      amount: shipping_address.shipping_cost || 0,
      description: 'Frete padrão',
      recipient_name: customer.name,
      recipient_phone: customer.phone || '',
      address: {
        street: shipping_address.street,
        number: shipping_address.number,
        zip_code: shipping_address.zip_code.replace(/\D/g, ''),
        neighborhood: shipping_address.neighborhood,
        city: shipping_address.city,
        state: shipping_address.state,
        country: 'BR',
        complement: shipping_address.complement
      },
      type: 'standard'
    };

    // Preparar pagamento
    const pagarmePayment: PagarmePayment = {
      payment_method: payment_method
    };

    if (payment_method === 'credit_card') {
      if (card_token) {
        pagarmePayment.credit_card = {
          installments: installments,
          statement_descriptor: 'Baby Diary',
          card_token: card_token
        };
      } else if (card_data) {
        pagarmePayment.credit_card = {
          installments: installments,
          statement_descriptor: 'Baby Diary',
          card: {
            number: card_data.number,
            holder_name: card_data.holder_name,
            exp_month: parseInt(card_data.exp_month),
            exp_year: parseInt(card_data.exp_year),
            cvv: card_data.cvv,
            billing_address: {
              street: shipping_address.street,
              number: shipping_address.number,
              zip_code: shipping_address.zip_code.replace(/\D/g, ''),
              neighborhood: shipping_address.neighborhood,
              city: shipping_address.city,
              state: shipping_address.state,
              country: 'BR',
              complement: shipping_address.complement
            }
          }
        };
      }
    } else if (payment_method === 'boleto') {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 3); // Vencimento em 3 dias
      
      pagarmePayment.boleto = {
        instructions: ['Pagar até a data de vencimento'],
        due_at: dueDate.toISOString(),
        document_number: customer.document || '',
        type: 'DM'
      };
    } else if (payment_method === 'pix') {
      pagarmePayment.pix = {
        expires_in: 3600 // 1 hora
      };
    }

    // Criar pedido no Pagar.me
    const pagarmeOrderData: PagarmeOrder = {
      items: pagarmeItems,
      customer: pagarmeCustomer,
      payments: [pagarmePayment],
      shipping: pagarmeShipping,
      code: `ORDER-${Date.now()}`,
      metadata: {
        user_id: req.user.userId,
        source: 'baby_diary_shop'
      }
    };

    const pagarmeOrder = await createPagarmeOrder(pagarmeOrderData);

    // Criar pedido no banco local
    const localOrder = await prisma.pedido.create({
      data: {
        userId: req.user.userId,
        status: 'pending',
        paymentId: pagarmeOrder.id,
        totalAmount: totalAmount,
        items: items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: products.find(p => p.id === item.productId)?.price || 0
        }))
      } as any,
    });

    // Atualizar estoque dos produtos
    for (const product of products) {
      const item = items.find((i: any) => i.productId === product.id);
      if (product.stock !== null) {
        await prisma.shopItem.update({
          where: { id: product.id },
          data: { stock: product.stock - item.quantity }
        });
      }
    }

    console.log('✅ Pedido criado com sucesso:', {
      localOrderId: localOrder.id,
      paymentId: pagarmeOrder.id,
      totalAmount: totalAmount
    });

    return res.json({
      success: true,
      data: {
        orderId: localOrder.id,
        status: pagarmeOrder.status,
        totalAmount: totalAmount,
        paymentUrl: pagarmeOrder.charges?.[0]?.last_transaction?.url,
        qrCode: pagarmeOrder.charges?.[0]?.last_transaction?.qr_code,
        boletoUrl: pagarmeOrder.charges?.[0]?.last_transaction?.url,
        pixCode: pagarmeOrder.charges?.[0]?.last_transaction?.qr_code?.text
      }
    });

  } catch (error: any) {
    console.error('❌ Erro ao criar pedido real:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor',
    });
  }
};

// Consultar status do pedido
export const getOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    // Buscar pedido no banco local
    const localOrder = await prisma.pedido.findFirst({
      where: {
        id: orderId,
        userId: req.user.userId
      }
    });

    if (!localOrder) {
      return res.status(404).json({
        success: false,
        error: 'Pedido não encontrado',
      });
    }

    // Se tem ID do Pagar.me, buscar status atualizado
    if ((localOrder as any).paymentId) {
      try {
        const pagarmeOrder = await getPagarmeOrder((localOrder as any).paymentId);
        
        // Atualizar status no banco se mudou
        if (pagarmeOrder.status !== localOrder.status) {
          await prisma.pedido.update({
            where: { id: localOrder.id },
            data: { status: pagarmeOrder.status }
          });
          localOrder.status = pagarmeOrder.status;
        }

        return res.json({
          success: true,
          data: {
            orderId: localOrder.id,
            status: pagarmeOrder.status,
            totalAmount: (localOrder as any).totalAmount,
            items: localOrder.items,
            createdAt: localOrder.createdAt,
            updatedAt: localOrder.updatedAt,
            paymentUrl: pagarmeOrder.charges?.[0]?.last_transaction?.url,
            qrCode: pagarmeOrder.charges?.[0]?.last_transaction?.qr_code,
            boletoUrl: pagarmeOrder.charges?.[0]?.last_transaction?.url,
            pixCode: pagarmeOrder.charges?.[0]?.last_transaction?.qr_code?.text
          }
        });
      } catch (pagarmeError) {
        console.error('Erro ao buscar pedido no Pagar.me:', pagarmeError);
        // Retornar dados locais se não conseguir buscar no Pagar.me
      }
    }

    // Retornar dados locais
    return res.json({
      success: true,
      data: {
        orderId: localOrder.id,
        status: localOrder.status,
        totalAmount: (localOrder as any).totalAmount,
        items: localOrder.items,
        createdAt: localOrder.createdAt,
        updatedAt: localOrder.updatedAt
      }
    });

  } catch (error: any) {
    console.error('❌ Erro ao consultar status do pedido:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor',
    });
  }
};

// Listar pedidos do usuário
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const orders = await prisma.pedido.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      success: true,
      data: orders
    });

  } catch (error: any) {
    console.error('❌ Erro ao listar pedidos:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor',
    });
  }
};

// Cancelar pedido
export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    // Buscar pedido no banco local
    const localOrder = await prisma.pedido.findFirst({
      where: {
        id: orderId,
        userId: req.user.userId
      }
    });

    if (!localOrder) {
      return res.status(404).json({
        success: false,
        error: 'Pedido não encontrado',
      });
    }

    if (localOrder.status === 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Não é possível cancelar um pedido já pago',
      });
    }

    // Cancelar no Pagar.me se tiver ID
    if ((localOrder as any).paymentId) {
      try {
        await cancelPagarmeOrder((localOrder as any).paymentId);
      } catch (pagarmeError) {
        console.error('Erro ao cancelar no Pagar.me:', pagarmeError);
      }
    }

    // Atualizar status no banco local
    await prisma.pedido.update({
      where: { id: localOrder.id },
      data: { status: 'canceled' }
    });

    // Restaurar estoque dos produtos
    for (const item of localOrder.items as any[]) {
      await prisma.shopItem.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity
          }
        }
      });
    }

    return res.json({
      success: true,
      data: { message: 'Pedido cancelado com sucesso' }
    });

  } catch (error: any) {
    console.error('❌ Erro ao cancelar pedido:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor',
    });
  }
};

// Exportar validação para uso nas rotas
export { checkoutRealValidation };

// ===== MÉTODOS PARA STRIPE =====

// Criar pedido usando Stripe
export const createStripeOrder = async (req: Request, res: Response) => {
  try {
    console.log('🔍 createStripeOrder - Iniciando...');
    console.log('🔍 Headers:', req.headers);
    console.log('🔍 User:', req.user);
    console.log('🔍 Body:', req.body);

    if (!req.user) {
      console.log('❌ Usuário não autenticado');
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const { items, customerInfo, shippingAddress, successUrl, cancelUrl } = req.body;
    console.log('🔍 Dados recebidos:', { items, customerInfo, shippingAddress, successUrl, cancelUrl });

    // Validações básicas
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log('❌ Items inválidos:', items);
      return res.status(400).json({
        success: false,
        error: 'Items são obrigatórios e devem ser um array não vazio',
      });
    }
    if (!customerInfo || !shippingAddress) {
      console.log('❌ Dados do cliente ou endereço ausentes:', { customerInfo, shippingAddress });
      return res.status(400).json({
        success: false,
        error: 'Informações do cliente e endereço de entrega são obrigatórios',
      });
    }

    // Buscar produtos no banco para validar preços e estoque
    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.shopItem.findMany({ where: { id: { in: productIds } } });
    if (products.length !== items.length) {
      return res.status(400).json({ success: false, error: 'Alguns produtos não foram encontrados' });
    }
    // Validar estoque
    for (const product of products) {
      const item = items.find((i: any) => i.productId === product.id);
      if (product.stock !== null && product.stock < item.quantity) {
        return res.status(400).json({ success: false, error: `Produto ${product.name} não tem estoque suficiente` });
      }
    }
    // Calcular valor total
    let totalAmount = 0;
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) continue;
      const itemPrice = product.isPromo && product.promoPrice ? product.promoPrice : product.price;
      totalAmount += itemPrice * item.quantity;
    }
    // Salvar pedido no banco antes do Stripe
    const localOrder = await prisma.pedido.create({
      data: {
        userId: req.user.userId,
        status: 'pending',
        paymentMethod: 'stripe',
        totalAmount: totalAmount,
        customerInfo,
        shippingAddress,
        items,
        metadata: {},
      } as any,
    });
    // URLs padrão se não fornecidas
    const finalSuccessUrl = successUrl || `${process.env.FRONTEND_URL || 'https://babydiary.shop'}/loja/success?session_id={CHECKOUT_SESSION_ID}`;
    const finalCancelUrl = cancelUrl || `${process.env.FRONTEND_URL || 'https://babydiary.shop'}/loja/checkout`;
    // Importar o serviço Stripe
    const { StripeService } = await import('../services/stripe.service');
    const stripeService = new StripeService();
    // Criar sessão de checkout do Stripe
    const session = await stripeService.createShopOrderCheckoutSession(
      req.user.userId,
      items,
      customerInfo,
      shippingAddress,
      finalSuccessUrl,
      finalCancelUrl
    );

    console.log('✅ Sessão de checkout Stripe criada:', session.id);

    // Atualizar pedido com o stripeSessionId
    await prisma.pedido.update({
      where: { id: localOrder.id },
      data: {
        metadata: { 
          stripe_session_id: session.id, 
          source: 'stripe' 
        } as any,
      } as any,
    });
    return res.json({
      success: true,
      data: {
        orderId: localOrder.id,
        sessionId: session.id,
        url: session.url,
      },
    });
  } catch (error: any) {
    console.error('❌ Erro ao criar pedido Stripe:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor',
    });
  }
};

// Processar webhook do Stripe para pedidos da loja
export const processStripeWebhook = async (req: Request, res: Response) => {
  try {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      console.error('❌ Webhook secret ou assinatura não configurados');
      return res.status(400).json({
        success: false,
        error: 'Configuração de webhook ausente',
      });
    }

    // Importar Stripe
    const Stripe = (await import('stripe')).default;
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });

    let event: any;

    try {
      event = stripeInstance.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error(`❌ Erro na verificação da assinatura do webhook: ${err.message}`);
      return res.status(400).json({
        success: false,
        error: `Webhook Error: ${err.message}`,
      });
    }

    // Processar apenas eventos de checkout da loja
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // Verificar se é um pedido da loja (não assinatura)
      if (session.mode === 'payment' && session.metadata?.source === 'baby_diary_shop') {
        console.log('🔄 Processando pedido da loja via Stripe:', session.id);
        
        const { StripeService } = await import('../services/stripe.service');
        const stripeService = new StripeService();
        
        await stripeService.processShopOrderPayment(session.id);
        
        console.log('✅ Pedido da loja processado com sucesso:', session.id);
      }
    }

    return res.json({ received: true });
  } catch (error: any) {
    console.error('❌ Erro ao processar webhook Stripe:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

// Buscar status do pedido Stripe
export const getStripeOrderStatus = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID é obrigatório',
      });
    }

    // Importar Stripe
    const Stripe = (await import('stripe')).default;
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });

    // Buscar sessão no Stripe
    const session = await stripeInstance.checkout.sessions.retrieve(sessionId);

    // Buscar pedido no banco
    const { StripeService } = await import('../services/stripe.service');
    const stripeService = new StripeService();
    const order = await stripeService.getOrderByStripeSessionId(sessionId);

    return res.json({
      success: true,
      data: {
        session,
        order,
        status: session.payment_status,
        url: session.url,
      },
    });
  } catch (error: any) {
    console.error('❌ Erro ao buscar status do pedido Stripe:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor',
    });
  }
}; 
