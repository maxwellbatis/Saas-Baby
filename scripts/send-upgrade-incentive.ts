// Script para enviar email de incentivo de upgrade
import { PrismaClient } from '@prisma/client';
import emailService from '../src/services/email.service';

const prisma = new PrismaClient();

const PLAN_FREE = 'Básico'; // Nome do plano gratuito
const PLAN_SUGGESTED = 'Premium'; // Nome do plano sugerido
const UPGRADE_LINK = 'https://app.babydiary.com.br/settings?upgrade=true'; // Link para upgrade

const REASONS = [
  { days: 7, reason: '7_days' },
  { days: 14, reason: '14_days' },
  { days: 30, reason: '30_days' }
];

async function main() {
  for (const { days, reason } of REASONS) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);
    const until = new Date(since);
    until.setHours(23, 59, 59, 999);

    // Buscar usuários do plano gratuito cadastrados exatamente há X dias
    const users = await prisma.user.findMany({
      where: {
        plan: { name: PLAN_FREE },
        createdAt: { gte: since, lte: until },
        isActive: true
      },
      select: { id: true, name: true, email: true }
    });

    for (const user of users) {
      // Verificar se já enviou email para esse motivo
      const alreadySent = await prisma.upgradeEmailLog.findFirst({
        where: { userId: user.id, reason },
      });
      if (alreadySent) continue;

      try {
        const sent = await emailService.sendUpgradeIncentiveEmail({
          email: user.email,
          name: user.name || 'Usuário',
          planName: PLAN_SUGGESTED,
          upgradeLink: UPGRADE_LINK
        });
        await prisma.upgradeEmailLog.create({
          data: {
            userId: user.id,
            email: user.email,
            status: sent ? 'success' : 'failed',
            reason,
            error: sent ? null : 'Falha no envio'
          }
        });
        console.log(`Email de upgrade (${reason}) enviado para ${user.email}: ${sent ? 'OK' : 'FALHA'}`);
      } catch (err: any) {
        await prisma.upgradeEmailLog.create({
          data: {
            userId: user.id,
            email: user.email,
            status: 'failed',
            reason,
            error: err.message || 'Erro desconhecido'
          }
        });
        console.error(`Erro ao enviar email de upgrade para ${user.email}:`, err);
      }
    }
  }
  await prisma.$disconnect();
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); }); 