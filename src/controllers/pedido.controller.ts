import { Request, Response } from 'express';
import prisma from '@/config/database';

// Listar todos os pedidos do usuário autenticado
export const getAllPedidos = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    }
    const pedidos = await prisma.pedido.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: pedidos });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao buscar pedidos' });
  }
};

// Buscar pedido por ID
export const getPedidoById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    }
    const pedido = await prisma.pedido.findUnique({ where: { id } });
    if (!pedido || pedido.userId !== userId) {
      return res.status(404).json({ success: false, error: 'Pedido não encontrado' });
    }
    return res.json({ success: true, data: pedido });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao buscar pedido' });
  }
};

// Criar novo pedido
export const createPedido = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    }
    const { status, paymentId, totalAmount, items } = req.body;
    if (!totalAmount || !items) {
      return res.status(400).json({ success: false, error: 'Valor e itens são obrigatórios' });
    }
    const pedido = await prisma.pedido.create({
      data: {
        userId,
        status: status || 'pending',
        paymentId,
        totalAmount,
        items,
      } as any,
    });
    return res.status(201).json({ success: true, data: pedido });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao criar pedido' });
  }
};

// Atualizar pedido
export const updatePedido = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    }
    const pedido = await prisma.pedido.findUnique({ where: { id } });
    if (!pedido || pedido.userId !== userId) {
      return res.status(404).json({ success: false, error: 'Pedido não encontrado' });
    }
    const { status, paymentId, totalAmount, items } = req.body;
    const pedidoAtualizado = await prisma.pedido.update({
      where: { id },
      data: { status, paymentId, totalAmount, items } as any,
    });
    return res.json({ success: true, data: pedidoAtualizado });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao atualizar pedido' });
  }
};

// Deletar pedido
export const deletePedido = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    }
    const pedido = await prisma.pedido.findUnique({ where: { id } });
    if (!pedido || pedido.userId !== userId) {
      return res.status(404).json({ success: false, error: 'Pedido não encontrado' });
    }
    await prisma.pedido.delete({ where: { id } });
    return res.json({ success: true, message: 'Pedido deletado com sucesso' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao deletar pedido' });
  }
}; 