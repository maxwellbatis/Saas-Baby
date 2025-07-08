import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Users, 
  Baby, 
  Activity, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  BarChart3,
  Trophy
} from 'lucide-react';
import { adminDashboard } from '../../lib/adminApi.js';

interface DashboardStats {
  users: {
    total: number;
    newThisMonth: number;
  };
  plans: {
    total: number;
    activeSubscriptions: number;
  };
  revenue: {
    total: number;
    monthly: number;
  };
  growthData: Array<{
    name: string;
    users: number;
    plans: number;
  }>;
  activityByDay: Array<{
    name: string;
    activities: number;
  }>;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await adminDashboard.getStats();

      if (response.success) {
        setStats(response.data);
      } else {
        setError('Erro ao carregar estatísticas');
      }
    } catch (error: any) {
      console.error('Erro ao buscar estatísticas:', error);
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchDashboardStats}>Tentar novamente</Button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Visão geral do sistema Baby Diary
        </p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.users.newThisMonth} este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.plans.activeSubscriptions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              de {stats.plans.total} planos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {stats.revenue.monthly.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total: R$ {stats.revenue.total.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Planos</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.plans.total}
            </div>
            <p className="text-xs text-muted-foreground">
              Planos disponíveis para assinatura
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e mais estatísticas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crescimento mensal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Crescimento Mensal
            </CardTitle>
            <CardDescription>
              Novos usuários e planos nos últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.growthData.map((month, index) => (
                <div key={month.name} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{month.name}</span>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">
                      {month.users} usuários
                    </Badge>
                    <Badge variant="outline">
                      {month.plans} planos
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ações rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesse rapidamente as principais funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => navigate('/admin/users')}
              >
                <Users className="h-6 w-6 mb-2" />
                <span className="text-sm">Gerenciar Usuários</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => navigate('/admin/plans')}
              >
                <CreditCard className="h-6 w-6 mb-2" />
                <span className="text-sm">Gerenciar Planos</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => navigate('/admin/milestones')}
              >
                <Trophy className="h-6 w-6 mb-2" />
                <span className="text-sm">Gerenciar Marcos</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => navigate('/admin/gamification')}
              >
                <BarChart3 className="h-6 w-6 mb-2" />
                <span className="text-sm">Gamificação</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 