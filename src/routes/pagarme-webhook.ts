import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../config/database';
import { getPagarmeOrder } from '../config/pagarme';

const router = Router();

// Verificar assinatura do webhook do Pagar.me
const verifyWebhookSignature = (req: Request, signature: string): boolean => {
  const secret = process.env.PAGARME_WEBHOOK_SECRET;
  if (!secret) {
    console.error('PAGARME_WEBHOOK_SECRET não configurado');
    return false;
  }

  const payload = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};

// Processar webhook do Pagar.me
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-hub-signature'] as string;
    
    if (!signature) {
      console.error('❌ Webhook sem assinatura');
      return res.status(400).json({ error: 'Assinatura não fornecida' });
    }

    // Verificar assinatura
    if (!verifyWebhookSignature(req, signature)) {
      console.error('❌ Assinatura do webhook inválida');
      return res.status(401).json({ error: 'Assinatura inválida' });
    }

    const { type, data } = req.body;
    console.log('📡 Webhook recebido:', { type, orderId: data?.id });

    // Processar diferentes tipos de eventos
    switch (type) {
      case 'order.paid':
        await handleOrderPaid(data);
        break;
      
      case 'order.canceled':
        await handleOrderCanceled(data);
        break;
      
      case 'order.failed':
        await handleOrderFailed(data);
        break;
      
      case 'charge.paid':
        await handleChargePaid(data);
        break;
      
      case 'charge.canceled':
        await handleChargeCanceled(data);
        break;
      
      case 'charge.failed':
        await handleChargeFailed(data);
        break;
      
      default:
        console.log('ℹ️ Evento não processado:', type);
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Handler para pedido pago
async function handleOrderPaid(data: any) {
  try {
    const orderId = data.id;
    console.log('✅ Pedido pago:', orderId);

    // Buscar pedido no banco local
    const localOrder = await prisma.pedido.findFirst({
      where: { paymentId: orderId } as any
    });

    if (!localOrder) {
      console.error('❌ Pedido local não encontrado:', orderId);
      return;
    }

    // Atualizar status do pedido
    await prisma.pedido.update({
      where: { id: localOrder.id },
      data: { 
        status: 'paid',
        updatedAt: new Date()
      }
    });

    console.log('✅ Status do pedido atualizado para PAID:', localOrder.id);

    // Aqui você pode adicionar lógica adicional:
    // - Enviar email de confirmação
    // - Atualizar estoque
    // - Gerar nota fiscal
    // - etc.

  } catch (error) {
    console.error('❌ Erro ao processar pedido pago:', error);
  }
}

// Handler para pedido cancelado
async function handleOrderCanceled(data: any) {
  try {
    const orderId = data.id;
    console.log('❌ Pedido cancelado:', orderId);

    const localOrder = await prisma.pedido.findFirst({
      where: { paymentId: orderId } as any
    });

    if (!localOrder) {
      console.error('❌ Pedido local não encontrado:', orderId);
      return;
    }

    // Atualizar status do pedido
    await prisma.pedido.update({
      where: { id: localOrder.id },
      data: { 
        status: 'canceled',
        updatedAt: new Date()
      }
    });

    // Restaurar estoque dos produtos
    const items = localOrder.items as any[];
    for (const item of items) {
      await prisma.shopItem.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity
          }
        }
      });
    }

    console.log('✅ Status do pedido atualizado para CANCELED:', localOrder.id);

  } catch (error) {
    console.error('❌ Erro ao processar pedido cancelado:', error);
  }
}

// Handler para pedido falhou
async function handleOrderFailed(data: any) {
  try {
    const orderId = data.id;
    console.log('❌ Pedido falhou:', orderId);

    const localOrder = await prisma.pedido.findFirst({
      where: { paymentId: orderId } as any
    });

    if (!localOrder) {
      console.error('❌ Pedido local não encontrado:', orderId);
      return;
    }

    // Atualizar status do pedido
    await prisma.pedido.update({
      where: { id: localOrder.id },
      data: { 
        status: 'failed',
        updatedAt: new Date()
      }
    });

    // Restaurar estoque dos produtos
    const items = localOrder.items as any[];
    for (const item of items) {
      await prisma.shopItem.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity
          }
        }
      });
    }

    console.log('✅ Status do pedido atualizado para FAILED:', localOrder.id);

  } catch (error) {
    console.error('❌ Erro ao processar pedido falhou:', error);
  }
}

// Handler para cobrança paga
async function handleChargePaid(data: any) {
  try {
    const chargeId = data.id;
    const orderId = data.order_id;
    console.log('✅ Cobrança paga:', chargeId, 'Pedido:', orderId);

    // Buscar pedido pelo ID da cobrança
    const localOrder = await prisma.pedido.findFirst({
      where: { paymentId: orderId } as any
    });

    if (!localOrder) {
      console.error('❌ Pedido local não encontrado:', orderId);
      return;
    }

    // Atualizar status do pedido
    await prisma.pedido.update({
      where: { id: localOrder.id },
      data: { 
        status: 'paid',
        updatedAt: new Date()
      }
    });

    console.log('✅ Status do pedido atualizado para PAID via cobrança:', localOrder.id);

  } catch (error) {
    console.error('❌ Erro ao processar cobrança paga:', error);
  }
}

// Handler para cobrança cancelada
async function handleChargeCanceled(data: any) {
  try {
    const chargeId = data.id;
    const orderId = data.order_id;
    console.log('❌ Cobrança cancelada:', chargeId, 'Pedido:', orderId);

    const localOrder = await prisma.pedido.findFirst({
      where: { paymentId: orderId } as any
    });

    if (!localOrder) {
      console.error('❌ Pedido local não encontrado:', orderId);
      return;
    }

    // Atualizar status do pedido
    await prisma.pedido.update({
      where: { id: localOrder.id },
      data: { 
        status: 'canceled',
        updatedAt: new Date()
      }
    });

    // Restaurar estoque
    const items = localOrder.items as any[];
    for (const item of items) {
      await prisma.shopItem.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity
          }
        }
      });
    }

    console.log('✅ Status do pedido atualizado para CANCELED via cobrança:', localOrder.id);

  } catch (error) {
    console.error('❌ Erro ao processar cobrança cancelada:', error);
  }
}

// Handler para cobrança falhou
async function handleChargeFailed(data: any) {
  try {
    const chargeId = data.id;
    const orderId = data.order_id;
    console.log('❌ Cobrança falhou:', chargeId, 'Pedido:', orderId);

    const localOrder = await prisma.pedido.findFirst({
      where: { paymentId: orderId } as any
    });

    if (!localOrder) {
      console.error('❌ Pedido local não encontrado:', orderId);
      return;
    }

    // Atualizar status do pedido
    await prisma.pedido.update({
      where: { id: localOrder.id },
      data: { 
        status: 'failed',
        updatedAt: new Date()
      }
    });

    // Restaurar estoque
    const items = localOrder.items as any[];
    for (const item of items) {
      await prisma.shopItem.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity
          }
        }
      });
    }

    console.log('✅ Status do pedido atualizado para FAILED via cobrança:', localOrder.id);

  } catch (error) {
    console.error('❌ Erro ao processar cobrança falhou:', error);
  }
}

export default router; 