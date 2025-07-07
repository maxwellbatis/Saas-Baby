import { PrismaClient } from '@prisma/client';
import emailService from '../src/services/email.service';
import '../src/config/sendgrid';
import { runAutomationJob } from './automation-funnel-job';

const prisma = new PrismaClient();

jest.mock('../src/services/email.service');
const mockedEmailService = emailService as jest.Mocked<typeof emailService>;

describe('Job de automação de funil', () => {
  let leadId: string;
  let ruleId: string;
  let templateId: string;

  beforeAll(async () => {
    // Criar template
    const template = await prisma.emailTemplate.create({
      data: {
        name: 'Job Test Template',
        subject: 'Assunto Job {{name}}',
        body: '<p>Olá {{name}}</p>',
      },
    });
    templateId = template.id;
    // Criar regra
    const rule = await prisma.automationRule.create({
      data: {
        name: 'Job Test Rule',
        triggerStatus: 'novo',
        delayMinutes: 0,
        templateId,
        active: true,
      },
    });
    ruleId = rule.id;
    // Criar lead
    const lead = await prisma.leadSaas.create({
      data: {
        name: 'Lead Job',
        email: 'leadjob@example.com',
        whatsapp: '11999999999',
        status: 'novo',
      },
    });
    leadId = lead.id;
    // Mock do envio de email
    mockedEmailService.sendSimpleEmail.mockResolvedValue(true);
  });

  afterAll(async () => {
    await prisma.automationHistory.deleteMany({ where: { leadId } });
    await prisma.leadSaas.delete({ where: { id: leadId } });
    await prisma.automationRule.delete({ where: { id: ruleId } });
    await prisma.emailTemplate.delete({ where: { id: templateId } });
    await prisma.$disconnect();
  });

  it('deve processar o job e enviar email automático para lead elegível', async () => {
    await runAutomationJob();
    // Verificar se o email foi enviado
    expect(mockedEmailService.sendSimpleEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'leadjob@example.com',
        subject: expect.stringContaining('Lead Job'),
        html: expect.stringContaining('Lead Job'),
      })
    );
    // Verificar se o histórico foi criado
    const history = await prisma.automationHistory.findFirst({ where: { leadId, ruleId } });
    expect(history).toBeTruthy();
    expect(history?.status).toBe('success');
  });
}); 