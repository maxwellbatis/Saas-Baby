import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { EmailService } from '../services/email.service';

const prisma = new PrismaClient();
const emailService = new EmailService();

export const AutomationController = {
  // Email Templates
  async listTemplates(req: Request, res: Response) {
    const templates = await prisma.emailTemplate.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: templates });
  },
  async getTemplate(req: Request, res: Response) {
    const { id } = req.params;
    const template = await prisma.emailTemplate.findUnique({ where: { id } });
    if (!template) {
      return res.status(404).json({ success: false, error: 'Template não encontrado' });
    }
    return res.json({ success: true, data: template });
  },
  async createTemplate(req: Request, res: Response) {
    const { name, subject, body } = req.body;
    const template = await prisma.emailTemplate.create({ data: { name, subject, body } });
    res.status(201).json({ success: true, data: template });
  },
  async updateTemplate(req: Request, res: Response) {
    const { id } = req.params;
    const { name, subject, body } = req.body;
    const template = await prisma.emailTemplate.update({ where: { id }, data: { name, subject, body } });
    res.json({ success: true, data: template });
  },
  async deleteTemplate(req: Request, res: Response) {
    const { id } = req.params;
    await prisma.emailTemplate.delete({ where: { id } });
    res.status(204).json({ success: true });
  },

  // Automation Rules
  async listRules(req: Request, res: Response) {
    const rules = await prisma.automationRule.findMany({ include: { template: true }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: rules });
  },
  async getRule(req: Request, res: Response) {
    const { id } = req.params;
    const rule = await prisma.automationRule.findUnique({ where: { id }, include: { template: true } });
    if (!rule) {
      return res.status(404).json({ success: false, error: 'Regra não encontrada' });
    }
    return res.json({ success: true, data: rule });
  },
  async createRule(req: Request, res: Response) {
    const { name, triggerStatus, delayMinutes, templateId, active } = req.body;
    const rule = await prisma.automationRule.create({ data: { name, triggerStatus, delayMinutes, templateId, active } });
    res.status(201).json({ success: true, data: rule });
  },
  async updateRule(req: Request, res: Response) {
    const { id } = req.params;
    const { name, triggerStatus, delayMinutes, templateId, active } = req.body;
    const rule = await prisma.automationRule.update({ where: { id }, data: { name, triggerStatus, delayMinutes, templateId, active } });
    res.json({ success: true, data: rule });
  },
  async deleteRule(req: Request, res: Response) {
    const { id } = req.params;
    await prisma.automationRule.delete({ where: { id } });
    res.status(204).json({ success: true });
  },

  // Automation History
  async listHistory(req: Request, res: Response) {
    const { leadId, ruleId } = req.query;
    const where: any = {};
    if (leadId) where.leadId = String(leadId);
    if (ruleId) where.ruleId = String(ruleId);
    const history = await prisma.automationHistory.findMany({ where, orderBy: { sentAt: 'desc' }, include: { rule: true } });
    res.json({ success: true, data: history });
  },

  async sendManualEmail(req: Request, res: Response) {
    const { leadIds, templateId } = req.body;
    if (!Array.isArray(leadIds) || !templateId) {
      return res.status(400).json({ success: false, error: 'leadIds (array) e templateId são obrigatórios' });
    }
    try {
      // Buscar template
      const template = await prisma.emailTemplate.findUnique({ where: { id: templateId } });
      if (!template) {
        return res.status(404).json({ success: false, error: 'Template não encontrado' });
      }
      // Buscar leads
      const leads = await prisma.leadSaas.findMany({ where: { id: { in: leadIds } } });
      if (!leads.length) {
        return res.status(404).json({ success: false, error: 'Nenhum lead encontrado' });
      }
      // Enviar email para cada lead
      const results = [];
      for (const lead of leads) {
        try {
          await emailService.sendSimpleEmail({
            to: lead.email,
            subject: template.subject,
            html: template.body,
          });
          results.push({ leadId: lead.id, success: true });
        } catch (err) {
          results.push({ leadId: lead.id, success: false, error: err instanceof Error ? err.message : err });
        }
      }
      return res.json({ success: true, results });
    } catch (err) {
      return res.status(500).json({ success: false, error: err instanceof Error ? err.message : err });
    }
  },
}; 