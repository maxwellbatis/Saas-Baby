import { Router } from 'express';
import { authenticateUser } from '../middlewares/auth';
import { NotificationService } from '../services/notification.service';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const router = Router();
const notificationService = new NotificationService();
const prisma = new PrismaClient();

// Schemas de validação
const registerTokenSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  platform: z.enum(['ios', 'android', 'web'], {
    errorMap: () => ({ message: 'Plataforma deve ser ios, android ou web' })
  }),
  deviceInfo: z.record(z.any()).optional()
});

// ===== ENDPOINTS PARA USUÁRIOS =====

/**
 * @swagger
 * /api/notifications/register-token:
 *   post:
 *     summary: Registrar token de dispositivo para notificações push
 *     tags: [Notificações]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               platform:
 *                 type: string
 *                 enum: [ios, android, web]
 *               deviceInfo:
 *                 type: object
 *     responses:
 *       200:
 *         description: Token registrado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/register-token', authenticateUser, async (req, res) => {
  try {
    const { token, platform, deviceInfo } = registerTokenSchema.parse(req.body);
    const userId = req.user!.userId;

    const success = await notificationService.registerDeviceToken(
      userId,
      token,
      platform,
      deviceInfo
    );

    if (success) {
      res.json({
        success: true,
        message: 'Token registrado com sucesso'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Falha ao registrar token'
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      });
    } else {
      console.error('Erro ao registrar token:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
});

/**
 * @swagger
 * /api/notifications/unregister-token:
 *   delete:
 *     summary: Remover token de dispositivo
 *     tags: [Notificações]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token removido com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.delete('/unregister-token', authenticateUser, async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token é obrigatório'
      });
    }

    const success = await notificationService.unregisterDeviceToken(token);

    if (success) {
      return res.json({
        success: true,
        message: 'Token removido com sucesso'
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Falha ao remover token'
      });
    }
  } catch (error) {
    console.error('Erro ao remover token:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/notifications/history:
 *   get:
 *     summary: Buscar histórico de notificações do usuário
 *     tags: [Notificações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limite de notificações
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Página
 *     responses:
 *       200:
 *         description: Histórico de notificações
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Não autorizado
 */
router.get('/history', authenticateUser, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const limit = parseInt(req.query.limit as string) || 50;
    const page = parseInt(req.query.page as string) || 1;

    const result = await notificationService.getNotificationHistory(userId, limit, page);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Marcar notificação como lida
 *     tags: [Notificações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da notificação
 *     responses:
 *       200:
 *         description: Notificação marcada como lida
 *       404:
 *         description: Notificação não encontrada
 */
router.put('/:id/read', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    if (!id) {
      return res.status(400).json({ success: false, error: 'ID da notificação é obrigatório.' });
    }

    // Verificar se a notificação pertence ao usuário
    const notification = await prisma.notification.findFirst({
      where: { id: id, userId: userId },
    });

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notificação não encontrada ou não pertence ao usuário.' });
    }

    const success = await notificationService.markAsRead(id);
    
    if (success) {
      return res.json({ success: true, message: 'Notificação marcada como lida.' });
    } else {
      return res.status(500).json({ success: false, error: 'Falha ao marcar notificação como lida.' });
    }
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor.' });
  }
});

export default router; 
