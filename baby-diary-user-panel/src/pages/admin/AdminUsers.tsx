import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../../components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../../components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../components/ui/alert-dialog';
import { 
  Users, 
  Search, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Shield, 
  ShieldOff,
  Key,
  Calendar,
  Mail,
  Phone,
  Baby,
  CreditCard,
  TrendingUp,
  Filter,
  Download
} from 'lucide-react';
import { adminUsers, adminPlans } from '../../lib/adminApi';
import { useToast } from '../../hooks/use-toast';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../../components/ui/select';
import adminApi from '../../lib/adminApi';
import { adminFamily } from '../../lib/adminApi';

interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  emailVerified: boolean;
  phoneNumber?: string;
  createdAt: string;
  lastLoginAt?: string;
  plan: {
    id: string;
    name: string;
    price: number;
    features: string[];
    familySharing: number;
  };
  subscription?: {
    id: string;
    status: string;
    currentPeriodEnd: string;
  };
  babies: Array<{
    id: string;
    name: string;
    gender: string;
    birthDate: string;
  }>;
  gamification?: {
    points: number;
    level: number;
    badges: string[];
  };
}

interface UserFilters {
  search: string;
  status: 'all' | 'active' | 'inactive';
  plan: 'all' | 'basic' | 'premium';
  verified: 'all' | 'verified' | 'unverified';
}

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    status: 'all',
    plan: 'all',
    verified: 'all'
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    verified: 0,
    unverified: 0,
    basic: 0,
    premium: 0
  });
  const { toast } = useToast();
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [savingPlan, setSavingPlan] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [savingUser, setSavingUser] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [loadingFamily, setLoadingFamily] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteData, setInviteData] = useState({ name: '', email: '', relationship: '' });
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, filters]);

  useEffect(() => {
    if (selectedUser) {
      setEditName(selectedUser.name);
      setEditEmail(selectedUser.email);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (selectedUser && selectedUser.plan && selectedUser.plan.familySharing > 0) {
      fetchFamilyMembers();
    } else {
      setFamilyMembers([]);
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminUsers.getAll();
      
      if (response.success) {
        setUsers(response.data.users);
        calculateStats(response.data.users);
      } else {
        setError('Erro ao carregar usuários');
      }
    } catch (error: any) {
      console.error('Erro ao buscar usuários:', error);
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (userList: User[]) => {
    const stats = {
      total: userList.length,
      active: userList.filter(u => u.isActive).length,
      inactive: userList.filter(u => !u.isActive).length,
      verified: userList.filter(u => u.emailVerified).length,
      unverified: userList.filter(u => !u.emailVerified).length,
      basic: userList.filter(u => u.plan.name.toLowerCase().includes('básico')).length,
      premium: userList.filter(u => u.plan.name.toLowerCase().includes('premium')).length
    };
    setStats(stats);
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Filtro de busca
    if (filters.search) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Filtro de status
    if (filters.status !== 'all') {
      filtered = filtered.filter(user => 
        filters.status === 'active' ? user.isActive : !user.isActive
      );
    }

    // Filtro de plano
    if (filters.plan !== 'all') {
      filtered = filtered.filter(user => {
        const planName = user.plan.name.toLowerCase();
        return filters.plan === 'basic' ? planName.includes('básico') : planName.includes('premium');
      });
    }

    // Filtro de verificação
    if (filters.verified !== 'all') {
      filtered = filtered.filter(user => 
        filters.verified === 'verified' ? user.emailVerified : !user.emailVerified
      );
    }

    setFilteredUsers(filtered);
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await adminUsers.updateStatus(userId, !currentStatus);
      
      if (response.success) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, isActive: !currentStatus } : user
        ));
        toast({
          title: "Status atualizado",
          description: `Usuário ${currentStatus ? 'desativado' : 'ativado'} com sucesso`,
        });
      } else {
        toast({
          title: "Erro",
          description: "Falha ao atualizar status do usuário",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Erro de conexão",
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      const response = await adminUsers.resetPassword(userId);
      
      if (response.success) {
        toast({
          title: "Senha resetada",
          description: "Email de redefinição enviado com sucesso",
        });
      } else {
        toast({
          title: "Erro",
          description: "Falha ao resetar senha",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      toast({
        title: "Erro",
        description: "Erro de conexão",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPlanBadgeVariant = (planName: string) => {
    return planName.toLowerCase().includes('premium') ? 'default' : 'secondary';
  };

  // Buscar planos ao abrir modal de detalhes
  useEffect(() => {
    if (selectedUser) {
      fetchPlans();
      setSelectedPlanId(selectedUser.plan.id);
    }
    // eslint-disable-next-line
  }, [selectedUser]);

  const fetchPlans = async () => {
    try {
      const response = await adminPlans.getAll();
      setPlans(response.data || response.plans || []);
    } catch (err) {
      toast({ title: 'Erro ao buscar planos', variant: 'destructive' });
    }
  };

  // Salvar alteração de plano
  const handleChangePlan = async () => {
    if (!selectedUser || !selectedPlanId) return;
    setSavingPlan(true);
    try {
      const response = await adminApi.put(`/admin/users/${selectedUser.id}/plan`, { planId: selectedPlanId });
      if (response.data?.success) {
        toast({ title: 'Plano atualizado com sucesso!' });
        // Atualizar usuário na lista
        setUsers(users.map(u => u.id === selectedUser.id ? { ...u, plan: response.data.data.plan } : u));
        setSelectedUser({ ...selectedUser, plan: response.data.data.plan });
      } else {
        throw new Error(response.data?.error || 'Erro ao atualizar plano');
      }
    } catch (err: any) {
      toast({ title: 'Erro ao atualizar plano', description: err.message, variant: 'destructive' });
    } finally {
      setSavingPlan(false);
    }
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    setSavingUser(true);
    try {
      const response = await adminUsers.update(selectedUser.id, { name: editName, email: editEmail });
      if (response.success) {
        toast({ title: 'Usuário atualizado com sucesso!' });
        setUsers(users.map(u => u.id === selectedUser.id ? { ...u, name: editName, email: editEmail } : u));
        setSelectedUser({ ...selectedUser, name: editName, email: editEmail });
      } else {
        throw new Error(response.error || 'Erro ao atualizar usuário');
      }
    } catch (err: any) {
      toast({ title: 'Erro ao atualizar usuário', description: err.message, variant: 'destructive' });
    } finally {
      setSavingUser(false);
    }
  };

  const fetchFamilyMembers = async () => {
    if (!selectedUser) return;
    setLoadingFamily(true);
    try {
      const response = await adminFamily.getMembers(selectedUser.id);
      if (response.success) {
        setFamilyMembers(response.data);
      } else {
        setFamilyMembers([]);
      }
    } catch (err) {
      setFamilyMembers([]);
    } finally {
      setLoadingFamily(false);
    }
  };

  const handleInviteFamily = async () => {
    if (!selectedUser) return;
    setInviting(true);
    try {
      const response = await adminFamily.inviteMember(selectedUser.id, inviteData);
      if (response.success) {
        toast({ title: 'Convite enviado com sucesso!' });
        setShowInviteModal(false);
        setInviteData({ name: '', email: '', relationship: '' });
        fetchFamilyMembers();
      } else {
        throw new Error(response.error || 'Erro ao convidar membro');
      }
    } catch (err: any) {
      toast({ title: 'Erro ao convidar membro', description: err.message, variant: 'destructive' });
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveFamily = async (memberId: string) => {
    if (!selectedUser) return;
    try {
      const response = await adminFamily.removeMember(selectedUser.id, memberId);
      if (response.success) {
        toast({ title: 'Membro removido com sucesso!' });
        fetchFamilyMembers();
      } else {
        throw new Error(response.error || 'Erro ao remover membro');
      }
    } catch (err: any) {
      toast({ title: 'Erro ao remover membro', description: err.message, variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchUsers}>Tentar novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
          <p className="text-gray-600 mt-2">
            Gerencie todos os usuários da plataforma
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Exportar
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              {stats.inactive} inativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Verificado</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.verified}</div>
            <p className="text-xs text-muted-foreground">
              {stats.unverified} não verificados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plano Premium</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.premium}</div>
            <p className="text-xs text-muted-foreground">
              {stats.basic} básico
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">Todos os status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>

            <select
              value={filters.plan}
              onChange={(e) => setFilters({ ...filters, plan: e.target.value as any })}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">Todos os planos</option>
              <option value="basic">Básico</option>
              <option value="premium">Premium</option>
            </select>

            <select
              value={filters.verified}
              onChange={(e) => setFilters({ ...filters, verified: e.target.value as any })}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">Todos</option>
              <option value="verified">Verificados</option>
              <option value="unverified">Não verificados</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Lista de todos os usuários registrados na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bebês</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead>Último Login</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                          {user.emailVerified && (
                            <Badge variant="outline" className="text-xs">✓</Badge>
                          )}
                        </div>
                        {user.phoneNumber && (
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {user.phoneNumber}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPlanBadgeVariant(user.plan.name)}>
                      {user.plan.name}
                    </Badge>
                    <div className="text-sm text-gray-500">
                      R$ {user.plan.price.toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Baby className="w-4 h-4 text-gray-500" />
                      <span>{user.babies?.length || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{formatDate(user.createdAt)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.lastLoginAt ? (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{formatDate(user.lastLoginAt)}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Nunca</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleStatusToggle(user.id, user.isActive)}
                        >
                          {user.isActive ? (
                            <>
                              <ShieldOff className="mr-2 h-4 w-4" />
                              Desativar
                            </>
                          ) : (
                            <>
                              <Shield className="mr-2 h-4 w-4" />
                              Ativar
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleResetPassword(user.id)}>
                          <Key className="mr-2 h-4 w-4" />
                          Resetar senha
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de detalhes do usuário */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Usuário</DialogTitle>
            <DialogDescription>
              Informações completas sobre o usuário selecionado
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* Informações básicas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nome</label>
                  <Input value={editName} onChange={e => setEditName(e.target.value)} className="text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <Input value={editEmail} onChange={e => setEditEmail(e.target.value)} className="text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Telefone</label>
                  <p className="text-sm">{selectedUser.phoneNumber || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <Badge variant={selectedUser.isActive ? "default" : "secondary"}>
                    {selectedUser.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveUser} disabled={savingUser || (!editName || !editEmail || (editName === selectedUser.name && editEmail === selectedUser.email))}>
                  {savingUser ? 'Salvando...' : 'Salvar Dados'}
                </Button>
              </div>

              {/* Plano e assinatura */}
              <div>
                <h3 className="font-medium mb-2">Plano Atual</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{selectedUser.plan.name}</p>
                      <p className="text-sm text-gray-500">R$ {selectedUser.plan.price.toFixed(2)}/mês</p>
                    </div>
                    {selectedUser.subscription && (
                      <div className="text-right">
                        <Badge variant={selectedUser.subscription.status === 'active' ? 'default' : 'secondary'}>
                          {selectedUser.subscription.status}
                        </Badge>
                        <p className="text-sm text-gray-500">
                          Expira em {formatDate(selectedUser.subscription.currentPeriodEnd)}
                        </p>
                      </div>
                    )}
                  </div>
                  {/* Seletor de plano */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Alterar Plano</label>
                    <Select value={selectedPlanId || ''} onValueChange={setSelectedPlanId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o plano" />
                      </SelectTrigger>
                      <SelectContent>
                        {plans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.name} - R$ {plan.price?.toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleChangePlan} className="mt-2" disabled={savingPlan || !selectedPlanId || selectedPlanId === selectedUser.plan.id}>
                      {savingPlan ? 'Salvando...' : 'Salvar Plano'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Bebês */}
              <div>
                <h3 className="font-medium mb-2">Bebês ({selectedUser.babies?.length || 0})</h3>
                <div className="space-y-2">
                  {selectedUser.babies?.map((baby) => (
                    <div key={baby.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Baby className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">{baby.name}</p>
                        <p className="text-sm text-gray-500">
                          {baby.gender === 'male' ? 'Menino' : 'Menina'} • 
                          Nascido em {formatDate(baby.birthDate)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Família */}
              {selectedUser.plan && selectedUser.plan.familySharing > 0 && (
                <div>
                  <h3 className="font-medium mb-2 flex items-center justify-between">
                    Membros da Família
                    <Button size="sm" onClick={() => setShowInviteModal(true)} disabled={familyMembers.length >= selectedUser.plan.familySharing}>
                      Convidar Membro
                    </Button>
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Limite do plano: {familyMembers.length} / {selectedUser.plan.familySharing}
                  </p>
                  {loadingFamily ? (
                    <p className="text-gray-400">Carregando membros...</p>
                  ) : familyMembers.length === 0 ? (
                    <p className="text-gray-400">Nenhum membro cadastrado.</p>
                  ) : (
                    <div className="space-y-2">
                      {familyMembers.map((member: any) => (
                        <div key={member.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{member.name} <span className="text-xs text-gray-500">({member.relationship})</span></p>
                            <p className="text-sm text-gray-500">{member.email || 'Sem e-mail'} • {member.acceptedAt ? 'Aceito' : 'Pendente'}</p>
                          </div>
                          <Button size="sm" variant="destructive" onClick={() => handleRemoveFamily(member.id)}>
                            Remover
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Modal de convite */}
              {showInviteModal && (
                <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Convidar Membro da Família</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input placeholder="Nome" value={inviteData.name} onChange={e => setInviteData({ ...inviteData, name: e.target.value })} />
                      <Input placeholder="E-mail (opcional)" value={inviteData.email} onChange={e => setInviteData({ ...inviteData, email: e.target.value })} />
                      <Input placeholder="Relação (ex: mãe, pai, avó)" value={inviteData.relationship} onChange={e => setInviteData({ ...inviteData, relationship: e.target.value })} />
                      <div className="flex justify-end">
                        <Button onClick={handleInviteFamily} disabled={inviting || !inviteData.name || !inviteData.relationship || familyMembers.length >= selectedUser.plan.familySharing}>
                          {inviting ? 'Enviando...' : 'Enviar Convite'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {/* Gamificação */}
              {selectedUser.gamification && (
                <div>
                  <h3 className="font-medium mb-2">Gamificação</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{selectedUser.gamification.points}</p>
                      <p className="text-sm text-gray-500">Pontos</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{selectedUser.gamification.level}</p>
                      <p className="text-sm text-gray-500">Nível</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{selectedUser.gamification.badges.length}</p>
                      <p className="text-sm text-gray-500">Badges</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Datas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Data de Cadastro</label>
                  <p className="text-sm">{formatDate(selectedUser.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Último Login</label>
                  <p className="text-sm">
                    {selectedUser.lastLoginAt ? formatDate(selectedUser.lastLoginAt) : 'Nunca'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}; 