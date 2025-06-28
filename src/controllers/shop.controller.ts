import { Request, Response } from 'express';
import prisma from '@/config/database';
import { createPagarmeOrder, getPagarmeOrder, cancelPagarmeOrder, PagarmeOrder, PagarmeCustomer, PagarmeAddress, PagarmeItem, PagarmePayment, PagarmeShipping } from '../config/pagarme';
import { validationResult } from 'express-validator';
import { body } from 'express-validator';

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

// Buscar produto por ID
export const getShopItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await prisma.shopItem.findUnique({ where: { id } });
    if (!item) {
      return res.status(404).json({ success: false, error: 'Produto não encontrado' });
    }
    return res.json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao buscar produto' });
  }
};

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
        isPromo
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

    const shopItem = await prisma.shopItem.update({
      where: { id },
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
        isPromo
      }
    });

    // Atualizar tags se fornecidas
    if (tags) {
      // Remover tags existentes
      await prisma.shopItemTag.deleteMany({
        where: { shopItemId: id }
      });

      // Adicionar novas tags
      if (tags.length > 0) {
        const tagConnections = tags.map((tagId: string) => ({
          shopItemId: id,
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
    await prisma.shopItem.delete({ where: { id } });
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
    const banners = await prisma.banner.findMany({
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
    const banners = await prisma.banner.findMany({
      where: {
        isActive: true,
        OR: [
          { startDate: null, endDate: null },
          { startDate: { lte: now }, endDate: null },
          { startDate: null, endDate: { gte: now } },
          { startDate: { lte: now }, endDate: { gte: now } }
        ]
      },
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
      targetId
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
      targetId
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
        targetId
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
        code: product.id // Usar ID do produto como código
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
        pagarmeOrderId: pagarmeOrder.id,
        amount: totalAmount,
        items: items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: products.find(p => p.id === item.productId)?.price || 0
        }))
      }
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
      pagarmeOrderId: pagarmeOrder.id,
      amount: totalAmount
    });

    return res.json({
      success: true,
      data: {
        orderId: localOrder.id,
        pagarmeOrderId: pagarmeOrder.id,
        status: pagarmeOrder.status,
        amount: totalAmount,
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
    if (localOrder.pagarmeOrderId) {
      try {
        const pagarmeOrder = await getPagarmeOrder(localOrder.pagarmeOrderId);
        
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
            amount: localOrder.amount,
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
        amount: localOrder.amount,
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
    if (localOrder.pagarmeOrderId) {
      try {
        await cancelPagarmeOrder(localOrder.pagarmeOrderId);
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