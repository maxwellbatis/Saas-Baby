// Serviço de notificações
import prisma from '../config/database';
import { messaging } from '../config/firebase';
import * as admin from 'firebase-admin';
import { Prisma } from '@prisma/client';

export interface PushNotificationPayload {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  imageUrl?: string;
  clickAction?: string;
}

export class NotificationService {
  async sendPushNotification(payload: PushNotificationPayload): Promise<boolean> {
    if (!messaging) {
      console.warn('[Firebase] Notificações push desabilitadas (Firebase não configurado)');
      return false;
    }
    try {
      const deviceTokens = await prisma.deviceToken.findMany({
        where: {
          userId: payload.userId,
          isActive: true
        }
      });

      if (deviceTokens.length === 0) {
        console.log(`[Firebase] Nenhum token de dispositivo encontrado para o usuário ${payload.userId}.`);
        await this.saveNotification({
          userId: payload.userId,
          type: 'push',
          title: payload.title,
          body: payload.body,
          data: payload.data,
          status: 'no_token',
          sentAt: new Date()
        });
        return false;
      }

      const tokens = deviceTokens.map((dt: { token: string }) => dt.token);

      const notificationPayload: admin.messaging.Notification = {
        title: payload.title,
        body: payload.body,
      };

      if (payload.imageUrl) {
        notificationPayload.imageUrl = payload.imageUrl;
      }

      const message: admin.messaging.MulticastMessage = {
        notification: notificationPayload,
        data: (payload.data || {}) as Record<string, string>,
        android: {
          notification: {
            clickAction: payload.clickAction || 'FLUTTER_NOTIFICATION_CLICK',
            channelId: 'baby_diary_channel',
            priority: 'high'
          }
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: payload.title,
                body: payload.body
              },
              sound: 'default',
              badge: 1
            }
          }
        },
        tokens: tokens
      };

      const response = await messaging.sendEachForMulticast(message);

      const successCount = response.successCount;
      const failureCount = response.failureCount;
      const status = failureCount === 0 ? 'sent' : (successCount > 0 ? 'partial_success' : 'failed');

      await this.saveNotification({
        userId: payload.userId,
        type: 'push',
        title: payload.title,
        body: payload.body,
        data: payload.data ? { ...(payload.data as Record<string, any>), successCount: successCount, failureCount: failureCount } : { successCount: successCount, failureCount: failureCount },
        status: status,
        sentAt: new Date()
      });

      if (failureCount > 0) {
        const invalidTokens: string[] = [];
        response.responses.forEach((resp: admin.messaging.SendResponse, idx: number) => {
          if (!resp.success && tokens[idx] && (resp.error?.code === 'messaging/invalid-argument' || resp.error?.code === 'messaging/registration-token-not-registered')) {
            invalidTokens.push(tokens[idx]);
          }
        });

        if (invalidTokens.length > 0) {
          console.log(`[Firebase] Desativando ${invalidTokens.length} tokens inválidos.`);
          await prisma.deviceToken.updateMany({
            where: {
              token: {
                in: invalidTokens
              }
            },
            data: {
              isActive: false
            }
          });
        }
      }

      console.log(`[Firebase] Notificação enviada para ${payload.userId}: ${successCount} sucessos, ${failureCount} falhas.`);
      return successCount > 0;

    } catch (error) {
      console.error('[Firebase] Erro ao enviar notificação push:', error);
      await this.saveNotification({
        userId: payload.userId,
        type: 'push',
        title: payload.title,
        body: payload.body,
        data: payload.data,
        status: 'failed',
        sentAt: new Date()
      });
      return false;
    }
  }

  async sendBulkNotification(userIds: string[], title: string, body: string, data?: Record<string, string>): Promise<{ successCount: number; failureCount: number }> {
    let totalSuccess = 0;
    let totalFailure = 0;

    for (const userId of userIds) {
      const success = await this.sendPushNotification({ userId, title, body, data: data });
      if (success) {
        totalSuccess++;
      } else {
        totalFailure++;
      }
    }
    return { successCount: totalSuccess, failureCount: totalFailure };
  }

  async sendTemplateNotification(userId: string, templateName: string, variables: Record<string, string> = {}): Promise<boolean> {
    try {
      const template = await prisma.notificationTemplate.findFirst({
        where: { name: templateName, isActive: true }
      });

      if (!template) {
        console.error(`[Template] Template \"${templateName}\" não encontrado ou inativo.`);
        return false;
      }

      let title = template.subject;
      let body = template.body;

      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        title = title.replace(regex, value);
        body = body.replace(regex, value);
      });

      return await this.sendPushNotification({ userId, title, body, data: { template: templateName, ...variables } });
    } catch (error) {
      console.error('[Template] Erro ao enviar notificação com template:', error);
      return false;
    }
  }

  async scheduleNotification(userId: string, title: string, body: string, scheduledAt: Date, data?: Record<string, string>): Promise<string> {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          type: 'scheduled',
          title,
          body,
          data: data || {},
          scheduledAt,
          status: 'pending'
        }
      });
      console.log(`[Scheduler] Notificação agendada para ${scheduledAt.toISOString()}: ID ${notification.id}`);
      return notification.id;
    } catch (error) {
      console.error('[Scheduler] Erro ao agendar notificação:', error);
      throw error;
    }
  }

  async registerDeviceToken(userId: string, token: string, platform: 'ios' | 'android' | 'web', deviceInfo?: Record<string, any>): Promise<boolean> {
    try {
      await prisma.deviceToken.upsert({
        where: { token },
        update: {
          userId,
          platform,
          deviceInfo: deviceInfo || {},
          isActive: true,
          updatedAt: new Date()
        },
        create: {
          userId,
          token,
          platform,
          deviceInfo: deviceInfo || {},
          isActive: true
        }
      });
      console.log(`[Device Token] Token registrado/atualizado para usuário ${userId} (${platform}): ${token}`);
      return true;
    } catch (error) {
      console.error('[Device Token] Erro ao registrar/atualizar token de dispositivo:', error);
      return false;
    }
  }

  async unregisterDeviceToken(token: string): Promise<boolean> {
    try {
      const result = await prisma.deviceToken.updateMany({
        where: { token },
        data: { isActive: false }
      });
      if (result.count > 0) {
        console.log(`[Device Token] Token desativado: ${token}`);
        return true;
      } else {
        console.log(`[Device Token] Token não encontrado para desativar: ${token}`);
        return false;
      }
    } catch (error) {
      console.error('[Device Token] Erro ao desativar token de dispositivo:', error);
      return false;
    }
  }

  async getNotificationHistory(userId: string, limit: number = 50, page: number = 1) {
    try {
      const offset = (page - 1) * limit;
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          type: true,
          title: true,
          body: true,
          data: true,
          status: true,
          sentAt: true,
          readAt: true,
          createdAt: true
        }
      });

      const total = await prisma.notification.count({ where: { userId } });

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('[History] Erro ao buscar histórico de notificações:', error);
      return { notifications: [], pagination: { page, limit, total: 0, pages: 0 } };
    }
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const notification = await prisma.notification.update({
        where: { id: notificationId },
        data: { readAt: new Date() }
      });
      console.log(`[Read Status] Notificação ${notificationId} marcada como lida.`);
      return !!notification;
    } catch (error) {
      console.error(`[Read Status] Erro ao marcar notificação ${notificationId} como lida:`, error);
      return false;
    }
  }

  private async saveNotification(data: {
    userId: string;
    type: string;
    title: string;
    body: string;
    data?: Record<string, any>;
    status: 'sent' | 'failed' | 'scheduled' | 'partial_success' | 'no_token';
    sentAt: Date;
  }): Promise<void> {
    try {
      await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          body: data.body,
          data: (data.data || {}) as Prisma.InputJsonValue,
          status: data.status,
          sentAt: data.sentAt
        }
      });
    } catch (error) {
      console.error('[DB] Erro ao salvar notificação no banco de dados:', error);
    }
  }

  async processScheduledNotifications(): Promise<void> {
    try {
      const scheduledNotifications = await prisma.notification.findMany({
        where: {
          type: 'scheduled',
          status: 'pending',
          scheduledAt: { lte: new Date() }
        }
      });

      if (scheduledNotifications.length > 0) {
        console.log(`[Scheduler] Processando ${scheduledNotifications.length} notificações agendadas.`);
      }

      for (const notification of scheduledNotifications) {
        try {
          const success = await this.sendPushNotification({
            userId: notification.userId,
            title: notification.title,
            body: notification.body,
            data: notification.data as Record<string, any> | undefined
          });

          await prisma.notification.update({
            where: { id: notification.id },
            data: {
              status: success ? 'sent' : 'failed',
              sentAt: new Date()
            }
          });
        } catch (error) {
          console.error(`[Scheduler] Erro ao processar notificação agendada ${notification.id}:`, error);
          await prisma.notification.update({
            where: { id: notification.id },
            data: { status: 'failed', sentAt: new Date() }
          });
        }
      }
    } catch (error) {
      console.error('[Scheduler] Erro geral ao processar notificações agendadas:', error);
    }
  }
}

export const notificationService = new NotificationService();
