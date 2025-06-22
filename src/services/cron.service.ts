import { AutomatedNotificationsService } from './automated-notifications.service';

export class CronService {
  private automatedNotifications: AutomatedNotificationsService;
  private intervals: NodeJS.Timeout[] = [];

  constructor() {
    this.automatedNotifications = new AutomatedNotificationsService();
  }

  /**
   * Inicia todos os cron jobs
   */
  startAllJobs(): void {
    console.log('⏰ Iniciando cron jobs...');
    
    // Verificar lembretes de vacinas diariamente às 9h
    this.startVaccineRemindersJob();
    
    // Verificar aniversários diariamente às 8h
    this.startBirthdayRemindersJob();
    
    console.log('✅ Cron jobs iniciados com sucesso');
  }

  /**
   * Para todos os cron jobs
   */
  stopAllJobs(): void {
    console.log('⏹️ Parando cron jobs...');
    
    this.intervals.forEach(interval => {
      clearInterval(interval);
    });
    
    this.intervals = [];
    console.log('✅ Cron jobs parados');
  }

  /**
   * Job para lembretes de vacinas - executa diariamente às 9h
   */
  private startVaccineRemindersJob(): void {
    const runVaccineCheck = async () => {
      const now = new Date();
      const hour = now.getHours();
      
      // Só executa às 9h da manhã
      if (hour === 9) {
        console.log('🕘 Executando verificação de lembretes de vacinas...');
        try {
          const result = await this.automatedNotifications.checkVaccineReminders();
          console.log(`📊 Resultado: ${result.sent} enviados, ${result.errors} erros`);
        } catch (error) {
          console.error('❌ Erro ao executar verificação de vacinas:', error);
        }
      }
    };

    // Executa a cada hora para verificar se é 9h
    const interval = setInterval(runVaccineCheck, 60 * 60 * 1000); // 1 hora
    this.intervals.push(interval);
    
    // Executa imediatamente se for 9h
    runVaccineCheck();
    
    console.log('💉 Job de lembretes de vacinas agendado (9h diariamente)');
  }

  /**
   * Job para aniversários - executa diariamente às 8h
   */
  private startBirthdayRemindersJob(): void {
    const runBirthdayCheck = async () => {
      const now = new Date();
      const hour = now.getHours();
      
      // Só executa às 8h da manhã
      if (hour === 8) {
        console.log('🕗 Executando verificação de aniversários...');
        try {
          const result = await this.automatedNotifications.checkBabyBirthdays();
          console.log(`📊 Resultado: ${result.sent} enviados, ${result.errors} erros`);
        } catch (error) {
          console.error('❌ Erro ao executar verificação de aniversários:', error);
        }
      }
    };

    // Executa a cada hora para verificar se é 8h
    const interval = setInterval(runBirthdayCheck, 60 * 60 * 1000); // 1 hora
    this.intervals.push(interval);
    
    // Executa imediatamente se for 8h
    runBirthdayCheck();
    
    console.log('🎂 Job de aniversários agendado (8h diariamente)');
  }

  /**
   * Executa verificações manualmente (para testes)
   */
  async runManualChecks(): Promise<{
    vaccineReminders: { sent: number; errors: number };
    birthdays: { sent: number; errors: number };
  }> {
    console.log('🔧 Executando verificações manuais...');
    
    const result = await this.automatedNotifications.runAllChecks();
    
    console.log('✅ Verificações manuais concluídas');
    return result;
  }
} 