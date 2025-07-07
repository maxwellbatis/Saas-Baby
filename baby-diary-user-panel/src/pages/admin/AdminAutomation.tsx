import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Loader2, Eye, Trash2 } from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

interface AutomationRule {
  id: string;
  name: string;
  triggerStatus: string;
  delayMinutes: number;
  templateId: string;
  active: boolean;
  template?: EmailTemplate;
}

interface AutomationHistory {
  id: string;
  leadId: string;
  ruleId: string;
  sentAt: string;
  status: string;
  error?: string;
  rule?: AutomationRule;
}

const statusColors: Record<string, string> = {
  novo: 'bg-blue-100 text-blue-800',
  contatado: 'bg-yellow-100 text-yellow-800',
  convertido: 'bg-green-100 text-green-800',
  perdido: 'bg-red-100 text-red-800',
};

export default function AdminAutomation() {
  const [tab, setTab] = useState('templates');
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [history, setHistory] = useState<AutomationHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTemplate, setSearchTemplate] = useState('');
  const [searchRule, setSearchRule] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editTemplate, setEditTemplate] = useState<EmailTemplate | null>(null);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editRule, setEditRule] = useState<AutomationRule | null>(null);
  const [showHistoryDetail, setShowHistoryDetail] = useState<AutomationHistory | null>(null);
  const [feedback, setFeedback] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'template' | 'rule'; id: string; name: string } | null>(null);

  // Fetch data
  useEffect(() => {
    fetchTemplates();
    fetchRules();
    fetchHistory();
  }, []);

  async function fetchTemplates() {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/automation/templates', {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setTemplates(data.data || []);
      } else {
        setTemplates([]);
      }
    } catch (err) {
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }
  async function fetchRules() {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/automation/rules', {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setRules(data.data || []);
      } else {
        setRules([]);
      }
    } catch (err) {
      setRules([]);
    } finally {
      setLoading(false);
    }
  }
  async function fetchHistory() {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/automation/history', {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setHistory(data.data || []);
      } else {
        setHistory([]);
      }
    } catch (err) {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }

  // CRUD Template
  function openNewTemplate() {
    setEditTemplate(null);
    setShowTemplateModal(true);
  }
  function openEditTemplate(t: EmailTemplate) {
    setEditTemplate(t);
    setShowTemplateModal(true);
  }
  async function saveTemplate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFeedback('Salvando...');
    const method = editTemplate?.id ? 'PUT' : 'POST';
    const url = editTemplate?.id ? `/api/admin/automation/templates/${editTemplate.id}` : '/api/admin/automation/templates';
    const token = localStorage.getItem('adminToken');
    const res = await fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify(editTemplate),
    });
    if (res.ok) {
      setFeedback('Salvo com sucesso!');
      setShowTemplateModal(false);
      fetchTemplates();
    } else {
      setFeedback('Erro ao salvar');
    }
    setLoading(false);
  }
  function confirmDeleteTemplate(t: EmailTemplate) {
    setConfirmDelete({ type: 'template', id: t.id, name: t.name });
  }
  async function deleteTemplate() {
    if (!confirmDelete) return;
    setLoading(true);
    setFeedback('Excluindo...');
    const token = localStorage.getItem('adminToken');
    await fetch(`/api/admin/automation/templates/${confirmDelete.id}`, { 
      method: 'DELETE', 
      credentials: 'include',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setConfirmDelete(null);
    setShowTemplateModal(false);
    fetchTemplates();
    setLoading(false);
  }
  // CRUD Rule
  function openNewRule() {
    setEditRule(null);
    setShowRuleModal(true);
  }
  function openEditRule(r: AutomationRule) {
    setEditRule(r);
    setShowRuleModal(true);
  }
  async function saveRule(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFeedback('Salvando...');
    const method = editRule?.id ? 'PUT' : 'POST';
    const url = editRule?.id ? `/api/admin/automation/rules/${editRule.id}` : '/api/admin/automation/rules';
    const token = localStorage.getItem('adminToken');
    const res = await fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify(editRule),
    });
    if (res.ok) {
      setFeedback('Salvo com sucesso!');
      setShowRuleModal(false);
      fetchRules();
    } else {
      setFeedback('Erro ao salvar');
    }
    setLoading(false);
  }
  function confirmDeleteRule(r: AutomationRule) {
    setConfirmDelete({ type: 'rule', id: r.id, name: r.name });
  }
  async function deleteRule() {
    if (!confirmDelete) return;
    setLoading(true);
    setFeedback('Excluindo...');
    const token = localStorage.getItem('adminToken');
    await fetch(`/api/admin/automation/rules/${confirmDelete.id}`, { 
      method: 'DELETE', 
      credentials: 'include',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setConfirmDelete(null);
    setShowRuleModal(false);
    fetchRules();
    setLoading(false);
  }

  // Filtros e buscas
  const filteredTemplates = templates.filter(t => t.name.toLowerCase().includes(searchTemplate.toLowerCase()));
  const filteredRules = rules.filter(r =>
    r.name.toLowerCase().includes(searchRule.toLowerCase()) &&
    (!filterStatus || r.triggerStatus === filterStatus)
  );

  // Integração com outros módulos: acesso rápido para histórico do lead/regra
  function openHistoryForRule(ruleId: string) {
    setTab('history');
    setSearchRule(ruleId);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Automação de Funil</h1>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="templates">Templates de Email</TabsTrigger>
          <TabsTrigger value="rules">Regras de Automação</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Templates de Email</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input placeholder="Buscar template..." value={searchTemplate} onChange={e => setSearchTemplate(e.target.value)} />
                <Button onClick={openNewTemplate}>Novo Template</Button>
              </div>
              {loading && <Loader2 className="animate-spin" />}
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2">Nome</th>
                      <th className="p-2">Assunto</th>
                      <th className="p-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTemplates.map(t => (
                      <tr key={t.id} className="border-b">
                        <td className="p-2 font-semibold">{t.name}</td>
                        <td className="p-2">{t.subject}</td>
                        <td className="p-2 flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEditTemplate(t)}>Editar</Button>
                          <Button size="sm" variant="destructive" onClick={() => confirmDeleteTemplate(t)}><Trash2 className="w-4 h-4" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          {/* Modal Template */}
          <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editTemplate?.id ? 'Editar Template' : 'Novo Template'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={saveTemplate} className="space-y-4">
                <Input required placeholder="Nome" value={editTemplate?.name || ''} onChange={e => setEditTemplate(et => ({ ...et, name: e.target.value } as EmailTemplate))} />
                <Input required placeholder="Assunto" value={editTemplate?.subject || ''} onChange={e => setEditTemplate(et => ({ ...et, subject: e.target.value } as EmailTemplate))} />
                <Textarea required placeholder="Corpo do email (HTML permitido)" rows={6} value={editTemplate?.body || ''} onChange={e => setEditTemplate(et => ({ ...et, body: e.target.value } as EmailTemplate))} />
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowTemplateModal(false)}>Cancelar</Button>
                  <Button type="submit" disabled={loading}>{loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Salvar'}</Button>
                </div>
                {feedback && <div className="text-center text-sm mt-2">{feedback}</div>}
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>
        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle>Regras de Automação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input placeholder="Buscar regra..." value={searchRule} onChange={e => setSearchRule(e.target.value)} />
                <select className="border rounded px-2" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                  <option value="">Todos status</option>
                  <option value="novo">Novo</option>
                  <option value="contatado">Contatado</option>
                  <option value="convertido">Convertido</option>
                  <option value="perdido">Perdido</option>
                </select>
                <Button onClick={openNewRule}>Nova Regra</Button>
              </div>
              {loading && <Loader2 className="animate-spin" />}
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2">Nome</th>
                      <th className="p-2">Status Gatilho</th>
                      <th className="p-2">Delay (min)</th>
                      <th className="p-2">Template</th>
                      <th className="p-2">Ativa</th>
                      <th className="p-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRules.map(r => (
                      <tr key={r.id} className="border-b">
                        <td className="p-2 font-semibold">{r.name}</td>
                        <td className={`p-2`}>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[r.triggerStatus] || 'bg-gray-100 text-gray-800'}`}>{r.triggerStatus}</span>
                        </td>
                        <td className="p-2">{r.delayMinutes}</td>
                        <td className="p-2">{r.template?.name || '-'}</td>
                        <td className="p-2">{r.active ? <Badge>Sim</Badge> : <Badge variant="outline">Não</Badge>}</td>
                        <td className="p-2 flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEditRule(r)}>Editar</Button>
                          <Button size="sm" variant="destructive" onClick={() => confirmDeleteRule(r)}><Trash2 className="w-4 h-4" /></Button>
                          <Button size="sm" variant="secondary" onClick={() => openHistoryForRule(r.id)}><Eye className="w-4 h-4" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          {/* Modal Regra */}
          <Dialog open={showRuleModal} onOpenChange={setShowRuleModal}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editRule?.id ? 'Editar Regra' : 'Nova Regra'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={saveRule} className="space-y-4">
                <Input required placeholder="Nome" value={editRule?.name || ''} onChange={e => setEditRule(er => ({ ...er, name: e.target.value } as AutomationRule))} />
                <select required className="border rounded px-2 w-full" value={editRule?.triggerStatus || ''} onChange={e => setEditRule(er => ({ ...er, triggerStatus: e.target.value } as AutomationRule))}>
                  <option value="">Selecione o status gatilho</option>
                  <option value="novo">Novo</option>
                  <option value="contatado">Contatado</option>
                  <option value="convertido">Convertido</option>
                  <option value="perdido">Perdido</option>
                </select>
                <Input required type="number" min={0} placeholder="Delay em minutos" value={editRule?.delayMinutes || 0} onChange={e => setEditRule(er => ({ ...er, delayMinutes: Number(e.target.value) } as AutomationRule))} />
                <select required className="border rounded px-2 w-full" value={editRule?.templateId || ''} onChange={e => setEditRule(er => ({ ...er, templateId: e.target.value } as AutomationRule))}>
                  <option value="">Selecione o template</option>
                  {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={editRule?.active ?? true} onChange={e => setEditRule(er => ({ ...er, active: e.target.checked } as AutomationRule))} /> Ativa
                </label>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowRuleModal(false)}>Cancelar</Button>
                  <Button type="submit" disabled={loading}>{loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Salvar'}</Button>
                </div>
                {feedback && <div className="text-center text-sm mt-2">{feedback}</div>}
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Automação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input placeholder="Buscar leadId ou regra..." value={searchRule} onChange={e => setSearchRule(e.target.value)} />
              </div>
              {loading && <Loader2 className="animate-spin" />}
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2">Lead</th>
                      <th className="p-2">Regra</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Data</th>
                      <th className="p-2">Erro</th>
                      <th className="p-2">Detalhes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.filter(h =>
                      h.leadId.toLowerCase().includes(searchRule.toLowerCase()) ||
                      h.rule?.name?.toLowerCase().includes(searchRule.toLowerCase())
                    ).map(h => (
                      <tr key={h.id} className="border-b">
                        <td className="p-2">{h.leadId}</td>
                        <td className="p-2">{h.rule?.name || h.ruleId}</td>
                        <td className="p-2">
                          <Badge variant={h.status === 'success' ? 'default' : 'destructive'}>{h.status}</Badge>
                        </td>
                        <td className="p-2">{new Date(h.sentAt).toLocaleString('pt-BR')}</td>
                        <td className="p-2 text-red-600">{h.error || '-'}</td>
                        <td className="p-2">
                          <Button size="sm" variant="outline" onClick={() => setShowHistoryDetail(h)}><Eye className="w-4 h-4" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          {/* Modal Detalhe Histórico */}
          <Dialog open={!!showHistoryDetail} onOpenChange={() => setShowHistoryDetail(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Detalhes do Histórico</DialogTitle>
              </DialogHeader>
              {showHistoryDetail && (
                <div className="space-y-2">
                  <div><b>ID:</b> {showHistoryDetail.id}</div>
                  <div><b>Lead ID:</b> {showHistoryDetail.leadId}</div>
                  <div><b>Regra:</b> {showHistoryDetail.rule?.name || showHistoryDetail.ruleId}</div>
                  <div><b>Status:</b> {showHistoryDetail.status}</div>
                  <div><b>Data:</b> {new Date(showHistoryDetail.sentAt).toLocaleString('pt-BR')}</div>
                  <div><b>Erro:</b> {showHistoryDetail.error || '-'}</div>
                </div>
              )}
            </DialogContent>
          </Dialog>
          {/* Modal de confirmação de exclusão */}
          <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Confirmar Exclusão</DialogTitle>
              </DialogHeader>
              {confirmDelete && (
                <div className="space-y-4">
                  <div>Tem certeza que deseja excluir <b>{confirmDelete.name}</b>?</div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
                    <Button variant="destructive" onClick={confirmDelete.type === 'template' ? deleteTemplate : deleteRule}>Excluir</Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
} 