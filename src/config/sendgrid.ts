import sgMail from '@sendgrid/mail';

// Configurar SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('✅ SendGrid configurado com sucesso');
} else {
  console.warn('⚠️ SendGrid não configurado - SENDGRID_API_KEY não encontrada');
}

export default sgMail;

// Configurações padrão
export const EMAIL_CONFIG = {
  from: {
    email: process.env.SENDGRID_FROM_EMAIL || 'noreply@babydiary.com',
    name: process.env.SENDGRID_FROM_NAME || 'Baby Diary'
  },
  replyTo: process.env.SENDGRID_REPLY_TO || 'suporte@babydiary.com'
};

// Templates do SendGrid (IDs dos templates)
export const EMAIL_TEMPLATES = {
  RESET_PASSWORD: process.env.SENDGRID_TEMPLATE_RESET_PASSWORD || 'd-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  WELCOME: process.env.SENDGRID_TEMPLATE_WELCOME || 'd-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  SUBSCRIPTION_CONFIRMED: process.env.SENDGRID_TEMPLATE_SUBSCRIPTION || 'd-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  FAMILY_INVITE: process.env.SENDGRID_TEMPLATE_FAMILY_INVITE || 'd-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  MILESTONE_REMINDER: process.env.SENDGRID_TEMPLATE_MILESTONE || 'd-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
}; 