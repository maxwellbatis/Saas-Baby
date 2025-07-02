import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Separator } from '../../components/ui/separator';
import { 
  Bell, 
  Mail, 
  Send, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  FileText,
  Clock
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { adminNotifications, adminApi } from '../../lib/adminApi';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { apiFetch } from '../../config/api';

interface NotificationStats {
  totalNotifications: number;
  sentNotifications: number;
  failedNotifications: number;
  successRate: number;
  activeTokens: number;
  templatesCount: number;
}

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'push' | 'sms';
  subject: string;
  body: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  status: string;
  sentAt?: string;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  plan?: {
    id: string;
    name: string;
  };
}

interface SendForm {
  targetType: 'user' | 'plan' | 'all' | 'email';
  userId: string;
  planId: string;
  email: string;
  title: string;
  body: string;
  type: 'push' | 'email';
  scheduledAt: string;
}

export const AdminNotifications: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [sendForm, setSendForm] = useState<SendForm>({
    targetType: 'user',
    userId: '',
    planId: '',
    email: '',
    title: '',
    body: '',
    type: 'push',
    scheduledAt: ''
  });
  const [templateForm, setTemplateForm] = useState({
    name: '',
    type: 'email' as 'email' | 'push' | 'sms',
    subject: '',
    body: '',
    variables: [] as string[],
    isActive: true
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar estatísticas de notificações
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ['adminNotificationStats'],
    queryFn: async () => {
      const res = await adminApi.get('/admin/notifications/stats');
      return res.data.data;
    },
    staleTime: 1000 * 60 * 10,
  });

  // Buscar templates de notificação
  const {
    data: templates = [],
    isLoading: templatesLoading,
    error: templatesError,
  } = useQuery({
    queryKey: ['adminNotificationTemplates'],
    queryFn: async () => {
      const res = await adminApi.get('/admin/notifications/templates');
      return res.data.data;
    },
    staleTime: 1000 * 60 * 10,
  });

  // Buscar histórico de notificações
  const {
    data: notifications = [],
    isLoading: notificationsLoading,
    error: notificationsError,
  } = useQuery({
    queryKey: ['adminNotificationHistory'],
    queryFn: async () => {
      const res = await adminApi.get('/admin/notifications/history');
      return res.data.data;
    },
    staleTime: 1000 * 60 * 10,
  });

  // Buscar usuários
  const {
    data: users = [],
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const res = await adminApi.get('/admin/users?limit=1000');
      return res.data?.data?.users || res.data?.data || [];
    },
    staleTime: 1000 * 60 * 10,
  });

  // Buscar planos
  const {
    data: plans = [],
    isLoading: plansLoading,
    error: plansError,
  } = useQuery({
    queryKey: ['adminPlans'],
    queryFn: async () => {
      const res = await adminApi.get('/admin/plans');
      return res.data?.data || [];
    },
    staleTime: 1000 * 60 * 10,
  });

  // Debug: Log dos estados quando mudam
  useEffect(() => {
    console.log('Estado atual dos usuários:', users);
    console.log('Estado atual dos planos:', plans);
    console.log('Número de usuários:', users?.length);
    console.log('Número de planos:', plans?.length);
  }, [users, plans]);

  // Gerenciamento de Templates
  const createTemplateMutation = useMutation({
    mutationFn: async (data) => adminNotifications.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNotificationTemplates'] });
      toast({ title: 'Template criado com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao criar template', description: error.message, variant: 'destructive' });
    },
  });

  const editTemplateMutation = useMutation({
    mutationFn: async ({ id, data }) => adminNotifications.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNotificationTemplates'] });
      toast({ title: 'Template atualizado com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar template', description: error.message, variant: 'destructive' });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id) => adminNotifications.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNotificationTemplates'] });
      toast({ title: 'Template deletado com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao deletar template', description: error.message, variant: 'destructive' });
    },
  });

  const handleToggleTemplateStatus = async (templateId: string, isActive: boolean) => {
    try {
      const response = await adminApi.put(`/admin/notifications/templates/${templateId}/status`, { isActive });
      queryClient.invalidateQueries({ queryKey: ['adminNotificationTemplates'] });
      toast({
        title: 'Sucesso',
        description: 'Status do template atualizado',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status do template',
        variant: 'destructive',
      });
    }
  };

  // Envio de Notificações
  const sendNotificationMutation = useMutation({
    mutationFn: async (data) => adminNotifications.send(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNotificationHistory'] });
      toast({ title: 'Notificação enviada com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao enviar notificação', description: error.message, variant: 'destructive' });
    },
  });

  const handleSendNotification = async () => {
    try {
      let payload = {
        title: sendForm.title,
        body: sendForm.body,
        type: sendForm.type,
        targetType: sendForm.targetType,
        targetValue: ''
      };

      switch (sendForm.targetType) {
        case 'user':
          payload.targetValue = sendForm.userId;
          break;
        case 'plan':
          payload.targetValue = sendForm.planId;
          break;
        case 'email':
          payload.targetValue = sendForm.email;
          break;
        case 'all':
          payload.targetValue = 'all';
          break;
        default:
          toast({ title: 'Erro', description: 'Tipo de alvo inválido', variant: 'destructive' });
          return;
      }
      
      if (!payload.targetValue) {
        toast({ title: 'Erro', description: 'Por favor, selecione um alvo para a notificação', variant: 'destructive' });
        return;
      }

      if (payload && typeof payload.title === 'string' && payload.title && typeof payload.body === 'string' && payload.body) {
        await sendNotificationMutation.mutateAsync(payload);
      }

      setIsSendModalOpen(false);
      resetSendForm();
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a notificação',
        variant: 'destructive'
      });
    }
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      type: 'email',
      subject: '',
      body: '',
      variables: [],
      isActive: true
    });
  };

  const resetSendForm = () => {
    setSendForm({
      targetType: 'user',
      userId: '',
      planId: '',
      email: '',
      title: '',
      body: '',
      type: 'push',
      scheduledAt: ''
    });
  };

  const openTemplateModal = (template?: NotificationTemplate) => {
    if (template) {
      setSelectedTemplate(template);
      setTemplateForm({
        name: template.name,
        type: template.type,
        subject: template.subject,
        body: template.body,
        variables: template.variables,
        isActive: template.isActive
      });
    } else {
      setSelectedTemplate(null);
      resetTemplateForm();
    }
    setIsTemplateModalOpen(true);
  };

  // Nova seção: Analytics e Disparo Manual de Email de Upgrade
  const UpgradeEmailAnalytics: React.FC = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({ status: '', reason: '', email: '', page: 1, limit: 50 });
    const [showSendModal, setShowSendModal] = useState(false);
    const [sendEmails, setSendEmails] = useState('');
    const [sendResult, setSendResult] = useState<any[]>([]);

    const fetchLogs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, String(v)); });
        const res = await apiFetch(`/admin/upgrade-email-logs?${params.toString()}`);
        setLogs(res.data || []);
      } catch (err) {
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => { fetchLogs(); }, [filters]);

    const handleSend = async () => {
      setLoading(true);
      try {
        const emails = sendEmails.split(',').map(e => e.trim()).filter(Boolean);
        const res = await apiFetch('/admin/upgrade-email/send', {
          method: 'POST',
          body: JSON.stringify({ emails }),
        });
        setSendResult(res.results || []);
        setShowSendModal(false);
        fetchLogs();
      } catch (err) {
        setSendResult([{ error: 'Erro ao enviar' }]);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Email de Upgrade - Analytics & Disparo Manual</h2>
        <div className="mb-4 flex gap-2">
          <input placeholder="Filtrar por email" value={filters.email} onChange={e => setFilters(f => ({ ...f, email: e.target.value }))} className="border rounded px-2 py-1" />
          <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} className="border rounded px-2 py-1">
            <option value="">Status</option>
            <option value="success">Enviado</option>
            <option value="failed">Falha</option>
          </select>
          <select value={filters.reason} onChange={e => setFilters(f => ({ ...f, reason: e.target.value }))} className="border rounded px-2 py-1">
            <option value="">Motivo</option>
            <option value="7_days">7 dias</option>
            <option value="14_days">14 dias</option>
            <option value="30_days">30 dias</option>
            <option value="manual">Manual</option>
          </select>
          <button onClick={() => setShowSendModal(true)} className="bg-blue-600 text-white px-4 py-1 rounded">Disparar Email Manual</button>
        </div>
        {loading ? <div>Carregando...</div> : (
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th>Email</th><th>Nome</th><th>Status</th><th>Motivo</th><th>Data</th><th>Erro</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log: any) => (
                <tr key={log.id} className={log.status === 'failed' ? 'bg-red-50' : ''}>
                  <td>{log.email}</td>
                  <td>{log.user?.name}</td>
                  <td>{log.status}</td>
                  <td>{log.reason}</td>
                  <td>{new Date(log.sentAt).toLocaleString('pt-BR')}</td>
                  <td>{log.error}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {/* Modal de disparo manual */}
        {showSendModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
              <h3 className="font-bold mb-2">Disparar Email de Upgrade Manual</h3>
              <input type="text" className="border w-full mb-2 p-2" placeholder="Emails separados por vírgula" value={sendEmails} onChange={e => setSendEmails(e.target.value)} />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowSendModal(false)} className="px-4 py-1 border rounded">Cancelar</button>
                <button onClick={handleSend} className="px-4 py-1 bg-blue-600 text-white rounded">Enviar</button>
              </div>
              {sendResult.length > 0 && (
                <div className="mt-2">
                  <strong>Resultado:</strong>
                  <ul>
                    {sendResult.map((r, i) => <li key={i}>{r.email}: {r.status} {r.error && `- ${r.error}`}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (statsLoading || templatesLoading || notificationsLoading || usersLoading || plansLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notificações</h1>
          <p className="text-muted-foreground">
            Gerencie templates e envie notificações para os usuários
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => openTemplateModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Template
          </Button>
          <Button onClick={() => setIsSendModalOpen(true)}>
            <Send className="w-4 h-4 mr-2" />
            Enviar Notificação
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Notificações</p>
                  <p className="text-2xl font-bold">{stats.totalNotifications.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Enviadas</p>
                  <p className="text-2xl font-bold text-green-600">{stats.sentNotifications.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Falharam</p>
                  <p className="text-2xl font-bold text-red-600">{stats.failedNotifications.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Taxa de Sucesso</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.successRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Templates de Notificação</CardTitle>
              <CardDescription>
                Gerencie os templates para notificações automáticas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{template.name}</h3>
                        <Badge variant={template.type === 'email' ? 'default' : 'secondary'}>
                          {template.type.toUpperCase()}
                        </Badge>
                        <Badge variant={template.isActive ? 'default' : 'secondary'}>
                          {template.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        <strong>Assunto:</strong> {template.subject}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Corpo:</strong> {template.body.substring(0, 100)}...
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={template.isActive}
                        onCheckedChange={(checked) => handleToggleTemplateStatus(template.id, checked)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openTemplateModal(template)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { if (typeof template?.id === 'string' && template.id) deleteTemplateMutation.mutate(template.id); }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {templates.length === 0 && (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum template encontrado</p>
                    <Button onClick={() => openTemplateModal()} className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeiro Template
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Notificações</CardTitle>
              <CardDescription>
                Visualize o histórico de notificações enviadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{notification.title}</h3>
                        <Badge variant={notification.status === 'sent' ? 'default' : 'destructive'}>
                          {notification.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.body}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Enviado em: {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {notifications.length === 0 && (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma notificação encontrada</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Template */}
      <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? 'Editar Template' : 'Novo Template'}
            </DialogTitle>
            <DialogDescription>
              Configure o template de notificação
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="template-name">Nome</Label>
                <Input
                  id="template-name"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                  placeholder="Nome do template"
                />
              </div>
              <div>
                <Label htmlFor="template-type">Tipo</Label>
                <Select
                  value={templateForm.type}
                  onValueChange={(value: 'email' | 'push' | 'sms') => 
                    setTemplateForm({...templateForm, type: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="push">Push</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="template-subject">Assunto</Label>
              <Input
                id="template-subject"
                value={templateForm.subject}
                onChange={(e) => setTemplateForm({...templateForm, subject: e.target.value})}
                placeholder="Assunto da notificação"
              />
            </div>
            
            <div>
              <Label htmlFor="template-body">Corpo</Label>
              <Textarea
                id="template-body"
                value={templateForm.body}
                onChange={(e) => setTemplateForm({...templateForm, body: e.target.value})}
                placeholder="Corpo da notificação (use {{variavel}} para variáveis)"
                rows={6}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="template-active"
                checked={templateForm.isActive}
                onCheckedChange={(checked) => setTemplateForm({...templateForm, isActive: checked})}
              />
              <Label htmlFor="template-active">Template ativo</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTemplateModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              if (selectedTemplate && typeof selectedTemplate.id === 'string' && selectedTemplate.id) {
                editTemplateMutation.mutate({ id: selectedTemplate.id, data: templateForm });
              } else if (templateForm && typeof templateForm.name === 'string' && templateForm.name) {
                createTemplateMutation.mutate(templateForm);
              }
            }}>
              {selectedTemplate ? 'Atualizar' : 'Criar'} Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Envio */}
      <Dialog open={isSendModalOpen} onOpenChange={setIsSendModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enviar Notificação</DialogTitle>
            <DialogDescription>
              Envie uma notificação para usuários específicos
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="send-target-type">Tipo de Destino</Label>
              <Select
                value={sendForm.targetType}
                onValueChange={(value: 'user' | 'plan' | 'all' | 'email') => 
                  setSendForm({...sendForm, targetType: value})
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário Específico</SelectItem>
                  <SelectItem value="plan">Por Plano</SelectItem>
                  <SelectItem value="email">Por Email</SelectItem>
                  <SelectItem value="all">Todos os Usuários</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Campo condicional baseado no tipo de destino */}
            {sendForm.targetType === 'user' && (
              <div>
                <Label htmlFor="send-user-id">Selecionar Usuário</Label>
                <Select
                  value={sendForm.userId}
                  onValueChange={(value) => setSendForm({...sendForm, userId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    {users && users.length > 0 ? (
                      users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name || 'Sem nome'} ({user.email})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-users" disabled>
                        Nenhum usuário encontrado
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {sendForm.targetType === 'plan' && (
              <div>
                <Label htmlFor="send-plan-id">Selecionar Plano</Label>
                <Select
                  value={sendForm.planId}
                  onValueChange={(value) => setSendForm({...sendForm, planId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um plano" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans && plans.length > 0 ? (
                      plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} - {plan.price === 0 ? 'Gratuito' : `R$ ${plan.price}`}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-plans" disabled>
                        Nenhum plano encontrado
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {sendForm.targetType === 'email' && (
              <div>
                <Label htmlFor="send-email">Email do Usuário</Label>
                <Input
                  id="send-email"
                  type="email"
                  value={sendForm.email}
                  onChange={(e) => setSendForm({...sendForm, email: e.target.value})}
                  placeholder="Digite o email do usuário"
                />
              </div>
            )}

            {sendForm.targetType === 'all' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  A notificação será enviada para todos os {users.length} usuários ativos.
                </p>
              </div>
            )}
            
            <div>
              <Label htmlFor="send-title">Título</Label>
              <Input
                id="send-title"
                value={sendForm.title}
                onChange={(e) => setSendForm({...sendForm, title: e.target.value})}
                placeholder="Título da notificação"
              />
            </div>
            
            <div>
              <Label htmlFor="send-body">Mensagem</Label>
              <Textarea
                id="send-body"
                value={sendForm.body}
                onChange={(e) => setSendForm({...sendForm, body: e.target.value})}
                placeholder="Mensagem da notificação"
                rows={4}
              />
            </div>
            
            <div>
              <Label htmlFor="send-scheduled">Agendar (opcional)</Label>
              <Input
                id="send-scheduled"
                type="datetime-local"
                value={sendForm.scheduledAt}
                onChange={(e) => setSendForm({...sendForm, scheduledAt: e.target.value})}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Deixe vazio para enviar imediatamente
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSendModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSendNotification}>
              <Send className="w-4 h-4 mr-2" />
              {sendForm.scheduledAt ? 'Agendar' : 'Enviar'} Notificação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UpgradeEmailAnalytics />
    </div>
  );
}; 