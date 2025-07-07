import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Select } from '../../components/ui/select';
import { getApiUrl } from '@/config/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface LeadSaas {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

const statusOptions = [
  { value: 'novo', label: 'Novo' },
  { value: 'contatado', label: 'Contatado' },
  { value: 'convertido', label: 'Convertido' },
  { value: 'perdido', label: 'Perdido' },
];

export default function AdminLeadsSaas() {
  const [leads, setLeads] = useState<LeadSaas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [showCampaign, setShowCampaign] = useState(false);
  const [campaignSubject, setCampaignSubject] = useState('');
  const [campaignMessage, setCampaignMessage] = useState('');
  const [campaignLeads, setCampaignLeads] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [search, setSearch] = useState('');
  const [showManualEmail, setShowManualEmail] = useState(false);
  const [manualEmailLeads, setManualEmailLeads] = useState<string[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [sendingManual, setSendingManual] = useState(false);
  const [manualResult, setManualResult] = useState('');
  const [useCustomMessage, setUseCustomMessage] = useState(false);
  const [customSubject, setCustomSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${getApiUrl()}/admin/leads-saas`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      const data = await res.json();
      if (data.success) {
        setLeads(data.data || []);
      } else {
        setError(data.error || 'Erro ao buscar leads.');
      }
    } catch (err) {
      setError('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (lead: LeadSaas) => {
    setEditing(lead.id);
    setEditStatus(lead.status);
    setEditNotes(lead.notes || '');
  };

  const saveEdit = async (lead: LeadSaas) => {
    try {
      const res = await fetch(`${getApiUrl()}/admin/leads-saas/${lead.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: editStatus, notes: editNotes })
      });
      const data = await res.json();
      if (data.success) {
        setLeads(leads.map(l => l.id === lead.id ? { ...l, status: editStatus, notes: editNotes } : l));
        setEditing(null);
      } else {
        alert(data.error || 'Erro ao salvar.');
      }
    } catch {
      alert('Erro de conexão.');
    }
  };

  const exportLeads = () => {
    const csv = [
      ['Nome', 'Email', 'WhatsApp', 'Status', 'Observações', 'Data'].join(';'),
      ...leads.map(l => [l.name, l.email, l.whatsapp, l.status, l.notes || '', new Date(l.createdAt).toLocaleString('pt-BR')].join(';'))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads-saas.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const openCampaign = () => {
    setShowCampaign(true);
    setCampaignSubject('');
    setCampaignMessage('');
    setCampaignLeads(leads.map(l => l.id)); // padrão: todos
    setSendResult('');
  };

  const sendCampaign = async () => {
    setSending(true);
    setSendResult('');
    try {
      const res = await fetch(`${getApiUrl()}/admin/leads-saas/campaign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          leadIds: campaignLeads,
          subject: campaignSubject,
          message: campaignMessage
        })
      });
      const data = await res.json();
      if (data.success) {
        setSendResult(`Campanha enviada para ${data.sent} leads!`);
      } else {
        setSendResult(data.error || 'Erro ao enviar campanha.');
      }
    } catch {
      setSendResult('Erro de conexão.');
    } finally {
      setSending(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${getApiUrl()}/admin/automation/templates`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) setTemplates(data.data || []);
      else setTemplates([]);
    } catch {
      setTemplates([]);
    }
  };

  const openManualEmail = (leadIds: string[]) => {
    setManualEmailLeads(leadIds);
    setShowManualEmail(true);
    setSelectedTemplate('');
    setManualResult('');
    fetchTemplates();
  };

  const sendManualEmail = async () => {
    setSendingManual(true);
    setManualResult('');
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${getApiUrl()}/admin/automation/send-manual`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ leadIds: manualEmailLeads, templateId: selectedTemplate })
      });
      const data = await res.json();
      if (data.success) {
        setManualResult(`Email enviado para ${data.results.filter((r: any) => r.success).length} lead(s)!`);
      } else {
        setManualResult(data.error || 'Erro ao enviar email.');
      }
    } catch {
      setManualResult('Erro de conexão.');
    } finally {
      setSendingManual(false);
    }
  };

  // Contadores por status
  const statusCounts = leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Dados para gráfico de funil (barras)
  const funnelLabels = ['Novo', 'Contatado', 'Convertido', 'Perdido'];
  const funnelData = [
    statusCounts['novo'] || 0,
    statusCounts['contatado'] || 0,
    statusCounts['convertido'] || 0,
    statusCounts['perdido'] || 0,
  ];

  // Leads filtrados
  const filteredLeads = leads.filter(lead => {
    const matchStatus = !filterStatus || lead.status === filterStatus;
    const matchSearch = !search || [lead.name, lead.email, lead.whatsapp].some(f => f.toLowerCase().includes(search.toLowerCase()));
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Leads SaaS White-Label</h1>
      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-4 items-center">
        <div className="flex gap-2">
          <Button variant={filterStatus === '' ? 'default' : 'outline'} onClick={() => setFilterStatus('')}>Todos</Button>
          <Button variant={filterStatus === 'novo' ? 'default' : 'outline'} onClick={() => setFilterStatus('novo')}>Novos</Button>
          <Button variant={filterStatus === 'contatado' ? 'default' : 'outline'} onClick={() => setFilterStatus('contatado')}>Contatados</Button>
          <Button variant={filterStatus === 'convertido' ? 'default' : 'outline'} onClick={() => setFilterStatus('convertido')}>Convertidos</Button>
          <Button variant={filterStatus === 'perdido' ? 'default' : 'outline'} onClick={() => setFilterStatus('perdido')}>Perdidos</Button>
        </div>
        <Input
          type="text"
          placeholder="Buscar por nome, email ou WhatsApp"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full md:w-72"
        />
      </div>
      {/* Contadores de status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-700">{statusCounts['novo'] || 0}</div>
          <div className="text-sm text-blue-700 font-semibold">Novos</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-700">{statusCounts['contatado'] || 0}</div>
          <div className="text-sm text-yellow-700 font-semibold">Contatados</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-700">{statusCounts['convertido'] || 0}</div>
          <div className="text-sm text-green-700 font-semibold">Convertidos</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-700">{statusCounts['perdido'] || 0}</div>
          <div className="text-sm text-red-700 font-semibold">Perdidos</div>
        </div>
      </div>
      {/* Gráfico de funil (barras) */}
      <div className="max-w-xl mx-auto mb-6">
        <Bar
          data={{
            labels: funnelLabels,
            datasets: [
              {
                label: 'Leads por etapa',
                data: funnelData,
                backgroundColor: [
                  '#3b82f6', // azul
                  '#f59e42', // amarelo
                  '#22c55e', // verde
                  '#ef4444', // vermelho
                ],
              },
            ],
          }}
          options={{
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
            responsive: true,
            maintainAspectRatio: false,
          }}
          height={200}
        />
      </div>
      <div className="flex gap-4 mb-4">
        <Button onClick={exportLeads}>Exportar CSV</Button>
        <Button onClick={openCampaign} variant="outline">Nova Campanha</Button>
        <Button onClick={() => openManualEmail(filteredLeads.map(l => l.id))} variant="secondary">Enviar Email Manual (em lote)</Button>
      </div>
      {/* Modal de campanha */}
      <Dialog open={showCampaign} onOpenChange={setShowCampaign}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Criar Campanha de Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Assunto</Label>
              <Input value={campaignSubject} onChange={e => setCampaignSubject(e.target.value)} placeholder="Assunto do email" />
            </div>
            <div>
              <Label>Mensagem</Label>
              <Textarea value={campaignMessage} onChange={e => setCampaignMessage(e.target.value)} rows={6} placeholder="Mensagem do email (HTML permitido)" />
            </div>
            <div>
              <Label>Leads Destinatários</Label>
              <div className="max-h-32 overflow-y-auto border rounded p-2 bg-gray-50">
                {leads.map(lead => (
                  <label key={lead.id} className="flex items-center gap-2 mb-1">
                    <input type="checkbox" checked={campaignLeads.includes(lead.id)} onChange={e => {
                      setCampaignLeads(l => e.target.checked ? [...l, lead.id] : l.filter(id => id !== lead.id));
                    }} />
                    <span>{lead.name} ({lead.email})</span>
                  </label>
                ))}
              </div>
            </div>
            <Button onClick={sendCampaign} disabled={sending || !campaignSubject || !campaignMessage || campaignLeads.length === 0} className="w-full">{sending ? 'Enviando...' : 'Enviar Campanha'}</Button>
            {sendResult && <div className="text-center text-sm mt-2">{sendResult}</div>}
          </div>
        </DialogContent>
      </Dialog>
      {/* Modal de envio manual */}
      <Dialog open={showManualEmail} onOpenChange={setShowManualEmail}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Enviar Email Manualmente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 mb-2">
                <input type="checkbox" checked={useCustomMessage} onChange={e => setUseCustomMessage(e.target.checked)} />
                Mensagem personalizada (sem template)
              </label>
            </div>
            {!useCustomMessage ? (
              <div>
                <Label>Template de Email</Label>
                <select className="border rounded px-2 w-full" value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)}>
                  <option value="">Selecione o template</option>
                  {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            ) : (
              <>
                <div>
                  <Label>Assunto</Label>
                  <Input value={customSubject} onChange={e => setCustomSubject(e.target.value)} placeholder="Assunto do email" />
                </div>
                <div>
                  <Label>Mensagem</Label>
                  <Textarea value={customMessage} onChange={e => setCustomMessage(e.target.value)} rows={6} placeholder="Mensagem do email (HTML permitido)" />
                </div>
              </>
            )}
            <div>
              <Label>Leads Destinatários</Label>
              <div className="max-h-32 overflow-y-auto border rounded p-2 bg-gray-50">
                {leads.filter(l => manualEmailLeads.includes(l.id)).map(lead => (
                  <div key={lead.id}>{lead.name} ({lead.email})</div>
                ))}
              </div>
            </div>
            <Button
              onClick={async () => {
                setSendingManual(true);
                setManualResult('');
                try {
                  const token = localStorage.getItem('adminToken');
                  let res, data;
                  if (useCustomMessage) {
                    res = await fetch(`${getApiUrl()}/admin/leads-saas/campaign`, {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        leadIds: manualEmailLeads,
                        subject: customSubject,
                        message: customMessage
                      })
                    });
                    data = await res.json();
                    if (data.success) {
                      setManualResult(`Email enviado para ${data.sent || manualEmailLeads.length} lead(s)!`);
                    } else {
                      setManualResult(data.error || 'Erro ao enviar email.');
                    }
                  } else {
                    res = await fetch(`${getApiUrl()}/admin/automation/send-manual`, {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ leadIds: manualEmailLeads, templateId: selectedTemplate })
                    });
                    data = await res.json();
                    if (data.success) {
                      setManualResult(`Email enviado para ${data.results.filter((r: any) => r.success).length} lead(s)!`);
                    } else {
                      setManualResult(data.error || 'Erro ao enviar email.');
                    }
                  }
                } catch {
                  setManualResult('Erro de conexão.');
                } finally {
                  setSendingManual(false);
                }
              }}
              disabled={sendingManual || (!useCustomMessage && (!selectedTemplate || manualEmailLeads.length === 0)) || (useCustomMessage && (!customSubject || !customMessage || manualEmailLeads.length === 0))}
              className="w-full"
            >
              {sendingManual ? 'Enviando...' : 'Enviar Email'}
            </Button>
            {manualResult && <div className="text-center text-sm mt-2">{manualResult}</div>}
          </div>
        </DialogContent>
      </Dialog>
      {loading ? (
        <div>Carregando...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Total de Leads: {leads.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2">Nome</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">WhatsApp</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Observações</th>
                    <th className="p-2">Data</th>
                    <th className="p-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map(lead => (
                    <tr key={lead.id} className="border-b">
                      <td className="p-2 font-semibold">{lead.name}</td>
                      <td className="p-2">{lead.email}</td>
                      <td className="p-2">{lead.whatsapp}</td>
                      <td className="p-2">
                        {editing === lead.id ? (
                          <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className="border rounded px-2 py-1">
                            {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                        ) : (
                          <Badge>{statusOptions.find(opt => opt.value === lead.status)?.label || lead.status}</Badge>
                        )}
                      </td>
                      <td className="p-2">
                        {editing === lead.id ? (
                          <Textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} className="w-40" rows={2} />
                        ) : (
                          <span>{lead.notes}</span>
                        )}
                      </td>
                      <td className="p-2">{new Date(lead.createdAt).toLocaleString('pt-BR')}</td>
                      <td className="p-2">
                        {editing === lead.id ? (
                          <>
                            <Button size="sm" onClick={() => saveEdit(lead)} className="mr-2">Salvar</Button>
                            <Button size="sm" variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" variant="outline" onClick={() => startEdit(lead)}>Editar</Button>
                            <Button size="sm" variant="secondary" className="ml-2" onClick={() => openManualEmail([lead.id])}>Enviar Email</Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 