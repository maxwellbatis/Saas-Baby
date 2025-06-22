import prisma from '../config/database';
import { NotificationService } from './notification.service';

export interface VaccineReminder {
  babyId: string;
  babyName: string;
  vaccineName: string;
  dueDate: Date;
  daysUntilDue: number;
  userId: string;
  userName: string;
  userEmail: string;
}

export class AutomatedNotificationsService {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  async checkVaccineReminders(): Promise<{ sent: number; errors: number }> {
    console.log('🔍 Verificando lembretes de vacinas...');
    
    let sent = 0;
    let errors = 0;

    try {
      const today = new Date();
      const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Buscar vacinas próximas do vencimento
      const upcomingVaccines = await prisma.vaccinationRecord.findMany({
        where: {
          nextDueDate: {
            gte: today,
            lte: sevenDaysFromNow
          }
        }
      });

      console.log(`📋 Encontradas ${upcomingVaccines.length} vacinas próximas do vencimento`);

      for (const vaccine of upcomingVaccines) {
        try {
          // Buscar informações do bebê e usuário
          const baby = await prisma.baby.findUnique({
            where: { id: vaccine.babyId },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  fcmToken: true
                }
              }
            }
          });

          if (!baby || !baby.user) {
            console.log(`⚠️ Bebê ou usuário não encontrado para vacina ${vaccine.id}`);
            continue;
          }

          const daysUntilDue = Math.ceil(
            (vaccine.nextDueDate!.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );

          let title = '';
          let body = '';

          if (daysUntilDue <= 1) {
            title = '🚨 Vacina URGENTE!';
            body = `A vacina ${vaccine.name} do(a) ${baby.name} vence HOJE! Agende imediatamente.`;
          } else if (daysUntilDue <= 3) {
            title = '⚠️ Vacina próxima do vencimento';
            body = `A vacina ${vaccine.name} do(a) ${baby.name} vence em ${daysUntilDue} dias. Não esqueça de agendar!`;
          } else {
            title = '📅 Lembrete de Vacina';
            body = `A vacina ${vaccine.name} do(a) ${baby.name} vence em ${daysUntilDue} dias.`;
          }

          const pushSuccess = await this.notificationService.sendPushNotification({
            userId: baby.user.id,
            title,
            body,
            data: {
              type: 'vaccine_reminder',
              vaccineId: vaccine.id,
              babyId: baby.id,
              dueDate: vaccine.nextDueDate!.toISOString(),
              daysUntilDue: daysUntilDue.toString()
            }
          });

          if (pushSuccess) {
            sent++;
            console.log(`✅ Lembrete enviado para ${baby.user.name} - ${vaccine.name} (${daysUntilDue} dias)`);
          } else {
            errors++;
            console.log(`❌ Falha ao enviar lembrete para ${baby.user.name}`);
          }

        } catch (error) {
          errors++;
          console.error(`❌ Erro ao processar vacina ${vaccine.id}:`, error);
        }
      }

    } catch (error) {
      console.error('❌ Erro ao verificar lembretes de vacinas:', error);
      errors++;
    }

    console.log(`📊 Resumo: ${sent} lembretes enviados, ${errors} erros`);
    return { sent, errors };
  }

  async checkBabyBirthdays(): Promise<{ sent: number; errors: number }> {
    console.log('🎂 Verificando aniversários de bebês...');
    
    let sent = 0;
    let errors = 0;

    try {
      const today = new Date();

      // Buscar bebês que fazem aniversário hoje
      const birthdayBabies = await prisma.baby.findMany({
        where: {
          birthDate: {
            gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
            lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
          },
          isActive: true
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              fcmToken: true
            }
          }
        }
      });

      console.log(`🎉 Encontrados ${birthdayBabies.length} bebês fazendo aniversário hoje`);

      for (const baby of birthdayBabies) {
        try {
          const age = today.getFullYear() - baby.birthDate.getFullYear();
          
          const title = '🎉 Feliz Aniversário!';
          const body = `Parabéns! O(a) ${baby.name} completa ${age} ano(s) hoje! 🎂✨`;

          const pushSuccess = await this.notificationService.sendPushNotification({
            userId: baby.user.id,
            title,
            body,
            data: {
              type: 'birthday_reminder',
              babyId: baby.id,
              age: age.toString()
            }
          });

          if (pushSuccess) {
            sent++;
            console.log(`✅ Parabéns enviado para ${baby.user.name} - ${baby.name} (${age} anos)`);
          } else {
            errors++;
            console.log(`❌ Falha ao enviar parabéns para ${baby.user.name}`);
          }

        } catch (error) {
          errors++;
          console.error(`❌ Erro ao processar aniversário do bebê ${baby.id}:`, error);
        }
      }

    } catch (error) {
      console.error('❌ Erro ao verificar aniversários:', error);
      errors++;
    }

    console.log(`📊 Resumo: ${sent} parabéns enviados, ${errors} erros`);
    return { sent, errors };
  }

  async runAllChecks(): Promise<{
    vaccineReminders: { sent: number; errors: number };
    birthdays: { sent: number; errors: number };
  }> {
    console.log('🤖 Iniciando verificações automáticas...');
    
    const vaccineReminders = await this.checkVaccineReminders();
    const birthdays = await this.checkBabyBirthdays();

    console.log('✅ Verificações automáticas concluídas');
    
    return {
      vaccineReminders,
      birthdays
    };
  }
} 