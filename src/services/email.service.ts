import sgMail, { MailDataRequired } from '@sendgrid/mail';
import { EMAIL_CONFIG, EMAIL_TEMPLATES } from '../config/sendgrid';

export interface EmailData {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
    disposition: string;
  }>;
}

export interface ResetPasswordData {
  email: string;
  name: string;
  resetLink: string;
  expiresIn: string;
}

export interface WelcomeData {
  email: string;
  name: string;
  loginLink: string;
}

export interface FamilyInviteData {
  email: string;
  inviterName: string;
  babyName: string;
  inviteLink: string;
  relationship: string;
}

export interface SubscriptionData {
  email: string;
  name: string;
  planName: string;
  price: string;
  nextBillingDate: string;
}

export class EmailService {
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = !!process.env.SENDGRID_API_KEY;
    if (!this.isConfigured) {
      console.warn('[Email] SendGrid não configurado - emails não serão enviados');
    }
  }

  /**
   * Envia email usando template do SendGrid
   */
  async sendTemplateEmail(data: EmailData): Promise<boolean> {
    if (!this.isConfigured) {
      console.log(`[Email] Simulando envio para ${data.to}: ${data.subject}`);
      return true;
    }

    try {
      const msg = {
        to: data.to,
        from: {
          email: EMAIL_CONFIG.from.email,
          name: EMAIL_CONFIG.from.name
        },
        replyTo: EMAIL_CONFIG.replyTo,
        subject: data.subject,
        templateId: data.templateId,
        dynamicTemplateData: data.dynamicTemplateData,
        attachments: data.attachments
      };

      await sgMail.send(msg as any);
      console.log(`[Email] Email enviado com sucesso para ${data.to}`);
      return true;
    } catch (error) {
      console.error('[Email] Erro ao enviar email:', error);
      return false;
    }
  }

  /**
   * Envia email simples (sem template)
   */
  async sendSimpleEmail(data: EmailData): Promise<boolean> {
    if (!this.isConfigured) {
      console.log(`[Email] Simulando envio simples para ${data.to}: ${data.subject}`);
      return true;
    }

    try {
      const msg = {
        to: data.to,
        from: {
          email: EMAIL_CONFIG.from.email,
          name: EMAIL_CONFIG.from.name
        },
        replyTo: EMAIL_CONFIG.replyTo,
        subject: data.subject,
        text: data.text,
        html: data.html,
        attachments: data.attachments
      };

      await sgMail.send(msg as any);
      console.log(`[Email] Email simples enviado para ${data.to}`);
      return true;
    } catch (error) {
      console.error('[Email] Erro ao enviar email simples:', error);
      return false;
    }
  }

  /**
   * Envia email de recuperação de senha
   */
  async sendResetPasswordEmail(data: ResetPasswordData): Promise<boolean> {
    const templateData = {
      name: data.name,
      reset_link: data.resetLink,
      expires_in: data.expiresIn,
      support_email: EMAIL_CONFIG.replyTo,
      app_name: 'Baby Diary'
    };

    return this.sendTemplateEmail({
      to: data.email,
      subject: 'Redefinir sua senha - Baby Diary',
      templateId: EMAIL_TEMPLATES.RESET_PASSWORD,
      dynamicTemplateData: templateData
    });
  }

  /**
   * Envia email de boas-vindas
   */
  async sendWelcomeEmail(data: WelcomeData): Promise<boolean> {
    const templateData = {
      name: data.name,
      login_link: data.loginLink,
      support_email: EMAIL_CONFIG.replyTo,
      app_name: 'Baby Diary'
    };

    return this.sendTemplateEmail({
      to: data.email,
      subject: 'Bem-vindo ao Baby Diary! 👶',
      templateId: EMAIL_TEMPLATES.WELCOME,
      dynamicTemplateData: templateData
    });
  }

  /**
   * Envia convite para família
   */
  async sendFamilyInviteEmail(data: FamilyInviteData): Promise<boolean> {
    const templateData = {
      inviter_name: data.inviterName,
      baby_name: data.babyName,
      invite_link: data.inviteLink,
      relationship: data.relationship,
      support_email: EMAIL_CONFIG.replyTo,
      app_name: 'Baby Diary'
    };

    return this.sendTemplateEmail({
      to: data.email,
      subject: `${data.inviterName} convidou você para acompanhar ${data.babyName} no Baby Diary`,
      templateId: EMAIL_TEMPLATES.FAMILY_INVITE,
      dynamicTemplateData: templateData
    });
  }

  /**
   * Envia confirmação de assinatura
   */
  async sendSubscriptionEmail(data: SubscriptionData): Promise<boolean> {
    const templateData = {
      name: data.name,
      plan_name: data.planName,
      price: data.price,
      next_billing_date: data.nextBillingDate,
      support_email: EMAIL_CONFIG.replyTo,
      app_name: 'Baby Diary'
    };

    return this.sendTemplateEmail({
      to: data.email,
      subject: `Assinatura ${data.planName} ativada - Baby Diary`,
      templateId: EMAIL_TEMPLATES.SUBSCRIPTION_CONFIRMED,
      dynamicTemplateData: templateData
    });
  }

  /**
   * Envia email de lembrete de marco
   */
  async sendMilestoneReminderEmail(email: string, name: string, babyName: string, milestone: string): Promise<boolean> {
    const templateData = {
      name: name,
      baby_name: babyName,
      milestone: milestone,
      support_email: EMAIL_CONFIG.replyTo,
      app_name: 'Baby Diary'
    };

    return this.sendTemplateEmail({
      to: email,
      subject: `Lembrete: ${milestone} - ${babyName}`,
      templateId: EMAIL_TEMPLATES.MILESTONE_REMINDER,
      dynamicTemplateData: templateData
    });
  }

  /**
   * Envia email de teste
   */
  async sendTestEmail(to: string): Promise<boolean> {
    return this.sendSimpleEmail({
      to,
      subject: 'Teste de Email - Baby Diary',
      text: 'Este é um email de teste do sistema Baby Diary.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8b5cf6;">Teste de Email - Baby Diary</h2>
          <p>Este é um email de teste do sistema Baby Diary.</p>
          <p>Se você recebeu este email, significa que a configuração do SendGrid está funcionando corretamente!</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Enviado em: ${new Date().toLocaleString('pt-BR')}
          </p>
        </div>
      `
    });
  }

  /**
   * Envia email de incentivo para upgrade de plano
   */
  async sendUpgradeIncentiveEmail(data: { email: string, name: string, planName: string, upgradeLink: string }): Promise<boolean> {
    const templateData = {
      name: data.name,
      plan_name: data.planName,
      upgrade_link: data.upgradeLink,
      support_email: EMAIL_CONFIG.replyTo,
      app_name: 'Baby Diary'
    };
    return this.sendTemplateEmail({
      to: data.email,
      subject: `Desbloqueie todos os recursos do Baby Diary – Faça upgrade para ${data.planName}!`,
      templateId: EMAIL_TEMPLATES.UPGRADE_INCENTIVE,
      dynamicTemplateData: templateData
    });
  }

  /**
   * Envia email de boas-vindas/proposta para lead SaaS
   */
  async sendSaasLeadEmail(data: { email: string, name: string, whatsapp: string }): Promise<boolean> {
    const html = `<p>Olá ${data.name},</p>
      <p>Recebemos seu interesse em ter seu próprio app Baby Diary White-Label!</p>
      <p>Em breve nossa equipe entrará em contato pelo WhatsApp <b>${data.whatsapp}</b> ou por este email.</p>
      <p>Enquanto isso, conheça mais sobre o projeto e veja exemplos ao vivo em <a href="https://babydiary.shop/business" target="_blank">babydiary.shop/business</a>.</p>
      <p>Atenciosamente,<br/>Equipe Baby Diary</p>`;
    return this.sendSimpleEmail({
      to: data.email,
      subject: 'Recebemos seu interesse no Baby Diary White-Label!',
      html
    });
  }

  /**
   * Verifica se o serviço está configurado
   */
  isEmailConfigured(): boolean {
    return this.isConfigured;
  }
}

export default new EmailService(); 