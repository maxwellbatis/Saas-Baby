import { PrismaClient } from '@prisma/client';
import emailService from '../src/services/email.service';

const prisma = new PrismaClient();

export async function runAutomationJob() {
  console.log('🚀 Iniciando job de automação de funil de leads...');

  // Buscar regras ativas
  const rules = await prisma.automationRule.findMany({
    where: { active: true },
    include: { template: true },
  });

  for (const rule of rules) {
    // Buscar leads que se encaixam na regra (status e data)
    const leads = await prisma.leadSaas.findMany({
      where: {
        status: rule.triggerStatus,
        createdAt: {
          lte: new Date(Date.now() - rule.delayMinutes * 60 * 1000),
        },
      },
    });

    for (const lead of leads) {
      // Checar se já existe histórico para esse lead/regra
      const alreadySent = await prisma.automationHistory.findFirst({
        where: { leadId: lead.id, ruleId: rule.id },
      });
      if (alreadySent) continue;
      try {
        // Montar mensagem com variáveis
        const subject = rule.template.subject.replace(/{{name}}/g, lead.name);
        const body = rule.template.body.replace(/{{name}}/g, lead.name);
        // Enviar email
        await emailService.sendSimpleEmail({
          to: lead.email,
          subject,
          html: body,
        });
        // Registrar histórico
        await prisma.automationHistory.create({
          data: {
            leadId: lead.id,
            ruleId: rule.id,
            status: 'success',
          },
        });
        console.log(`✅ Email automático enviado para lead ${lead.email} (regra: ${rule.name})`);
      } catch (err: any) {
        await prisma.automationHistory.create({
          data: {
            leadId: lead.id,
            ruleId: rule.id,
            status: 'error',
            error: err.message || String(err),
          },
        });
        console.error(`❌ Erro ao enviar email para lead ${lead.email}:`, err);
      }
    }
  }

  console.log('🏁 Job de automação finalizado.');
  await prisma.$disconnect();
}

if (require.main === module) {
  runAutomationJob().catch((e) => {
    console.error(e);
    process.exit(1);
  });
} 