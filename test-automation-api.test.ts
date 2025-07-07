import request from 'supertest';
import app from './src/index';

const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWN0N3RrMnowMDAwMTVhcXhsaHQ0dzV3IiwiZW1haWwiOiJhZG1pbkBtaWNyb3NhYXMuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzUxOTAxMTI4LCJleHAiOjE3NTI1MDU5Mjh9.FTRgg_i6xsb7b8UG08FSSqBruNQoUEwsLmHDHuoxHzk';

describe('API de Automação de Funil', () => {
  let templateId: string;
  let ruleId: string;

  it('deve criar um template de email', async () => {
    const res = await request(app)
      .post('/api/admin/automation/templates')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Teste Template',
        subject: 'Assunto Teste',
        body: '<p>Olá {{name}}</p>',
      });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    templateId = res.body.id;
  });

  it('deve listar templates de email', async () => {
    const res = await request(app)
      .get('/api/admin/automation/templates')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('deve buscar um template de email', async () => {
    const res = await request(app)
      .get(`/api/admin/automation/templates/${templateId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(templateId);
  });

  it('deve atualizar um template de email', async () => {
    const res = await request(app)
      .put(`/api/admin/automation/templates/${templateId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Template Atualizado', subject: 'Novo Assunto', body: '<p>Atualizado</p>' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Template Atualizado');
  });

  it('deve criar uma regra de automação', async () => {
    const res = await request(app)
      .post('/api/admin/automation/rules')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Regra Teste',
        triggerStatus: 'novo',
        delayMinutes: 1,
        templateId,
        active: true,
      });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    ruleId = res.body.id;
  });

  it('deve listar regras de automação', async () => {
    const res = await request(app)
      .get('/api/admin/automation/rules')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('deve buscar uma regra de automação', async () => {
    const res = await request(app)
      .get(`/api/admin/automation/rules/${ruleId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(ruleId);
  });

  it('deve atualizar uma regra de automação', async () => {
    const res = await request(app)
      .put(`/api/admin/automation/rules/${ruleId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Regra Atualizada', triggerStatus: 'contatado', delayMinutes: 2, templateId, active: false });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Regra Atualizada');
  });

  it('deve deletar uma regra de automação', async () => {
    const res = await request(app)
      .delete(`/api/admin/automation/rules/${ruleId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });

  it('deve deletar um template de email', async () => {
    const res = await request(app)
      .delete(`/api/admin/automation/templates/${templateId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });

  it('deve listar histórico de automação', async () => {
    const res = await request(app)
      .get('/api/admin/automation/history')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
}); 