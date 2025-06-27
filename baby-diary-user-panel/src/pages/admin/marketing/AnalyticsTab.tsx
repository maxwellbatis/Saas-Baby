import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  MousePointer, 
  Share2, 
  Heart, 
  MessageSquare,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target,
  DollarSign,
  Download,
  Filter
} from 'lucide-react';
import { adminMarketing } from '../../../lib/adminApi';
import { useQuery } from '@tanstack/react-query';

interface AnalyticsData {
  overview: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalPosts: number;
    totalAds: number;
    totalEngagement: number;
    totalReach: number;
  };
  performance: {
    campaigns: Array<{
      id: string;
      name: string;
      type: string;
      status: string;
      sentAt?: string;
      openRate: number;
      clickRate: number;
      conversionRate: number;
      reach: number;
      engagement: number;
    }>;
    posts: Array<{
      id: string;
      title: string;
      platform: string;
      publishedAt: string;
      reach: number;
      likes: number;
      shares: number;
      comments: number;
      engagement: number;
    }>;
    ads: Array<{
      id: string;
      title: string;
      platform: string;
      status: string;
      impressions: number;
      clicks: number;
      ctr: number;
      spend: number;
      conversions: number;
      cpa: number;
    }>;
  };
  trends: {
    daily: Array<{
      date: string;
      reach: number;
      engagement: number;
      conversions: number;
    }>;
    weekly: Array<{
      week: string;
      reach: number;
      engagement: number;
      conversions: number;
    }>;
    monthly: Array<{
      month: string;
      reach: number;
      engagement: number;
      conversions: number;
    }>;
  };
  segmentation: {
    byPlatform: Array<{
      platform: string;
      reach: number;
      engagement: number;
      conversions: number;
    }>;
    byAudience: Array<{
      audience: string;
      reach: number;
      engagement: number;
      conversions: number;
    }>;
    byContentType: Array<{
      type: string;
      reach: number;
      engagement: number;
      conversions: number;
    }>;
  };
}

interface AnalyticsTabProps {
  timeRange?: '7d' | '30d' | '90d' | '1y';
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ timeRange = '30d' }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [selectedMetric, setSelectedMetric] = useState('reach');

  // Buscar dados de analytics
  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ['marketingAnalytics', selectedTimeRange],
    queryFn: async () => {
      const response = await adminMarketing.getAnalytics(selectedTimeRange);
      return response.data as AnalyticsData;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPercentage = (num: number) => {
    return `${(num * 100).toFixed(1)}%`;
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(num);
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'reach': return <Eye className="w-4 h-4" />;
      case 'engagement': return <Heart className="w-4 h-4" />;
      case 'conversions': return <Target className="w-4 h-4" />;
      case 'clicks': return <MousePointer className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'reach': return 'text-blue-600';
      case 'engagement': return 'text-green-600';
      case 'conversions': return 'text-purple-600';
      case 'clicks': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Erro ao carregar dados de analytics</p>
        <Button onClick={() => window.location.reload()} className="mt-2">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Nenhum dado de analytics disponível</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com filtros */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics de Marketing</h2>
          <p className="text-gray-600">Métricas e performance das campanhas</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="1y">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campanhas Ativas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              de {analyticsData.overview.totalCampaigns} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alcance Total</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analyticsData.overview.totalReach)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engajamento</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analyticsData.overview.totalEngagement)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">-2%</span> vs período anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance por Plataforma */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Performance por Plataforma
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.segmentation.byPlatform.map((platform) => (
                <div key={platform.platform} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="font-medium">{platform.platform}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatNumber(platform.reach)}</div>
                    <div className="text-sm text-gray-500">
                      {formatPercentage(platform.engagement)} engajamento
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Performance por Público
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.segmentation.byAudience.map((audience) => (
                <div key={audience.audience} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="font-medium">{audience.audience}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatNumber(audience.reach)}</div>
                    <div className="text-sm text-gray-500">
                      {formatPercentage(audience.engagement)} engajamento
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campanhas Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Campanhas Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Campanha</th>
                  <th className="text-left py-2">Tipo</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-right py-2">Alcance</th>
                  <th className="text-right py-2">Taxa de Abertura</th>
                  <th className="text-right py-2">Taxa de Clique</th>
                  <th className="text-right py-2">Conversões</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.performance.campaigns.slice(0, 5).map((campaign) => (
                  <tr key={campaign.id} className="border-b">
                    <td className="py-2 font-medium">{campaign.name}</td>
                    <td className="py-2">
                      <Badge variant="outline">{campaign.type}</Badge>
                    </td>
                    <td className="py-2">
                      <Badge 
                        variant={campaign.status === 'active' ? 'default' : 'secondary'}
                      >
                        {campaign.status}
                      </Badge>
                    </td>
                    <td className="py-2 text-right">{formatNumber(campaign.reach)}</td>
                    <td className="py-2 text-right">{formatPercentage(campaign.openRate)}</td>
                    <td className="py-2 text-right">{formatPercentage(campaign.clickRate)}</td>
                    <td className="py-2 text-right">{formatNumber(campaign.conversionRate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Posts Mais Engajados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Posts Mais Engajados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.performance.posts.slice(0, 5).map((post) => (
              <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{post.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <span>{post.platform}</span>
                    <span>{new Date(post.publishedAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <div className="font-semibold">{formatNumber(post.reach)}</div>
                    <div className="text-sm text-gray-500">alcance</div>
                  </div>
                  <div>
                    <div className="font-semibold">{formatNumber(post.engagement)}</div>
                    <div className="text-sm text-gray-500">engajamento</div>
                  </div>
                  <div>
                    <div className="font-semibold">{formatNumber(post.likes)}</div>
                    <div className="text-sm text-gray-500">likes</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Anúncios Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Performance de Anúncios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Anúncio</th>
                  <th className="text-left py-2">Plataforma</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-right py-2">Impressões</th>
                  <th className="text-right py-2">Cliques</th>
                  <th className="text-right py-2">CTR</th>
                  <th className="text-right py-2">Gasto</th>
                  <th className="text-right py-2">CPA</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.performance.ads.slice(0, 5).map((ad) => (
                  <tr key={ad.id} className="border-b">
                    <td className="py-2 font-medium">{ad.title}</td>
                    <td className="py-2">
                      <Badge variant="outline">{ad.platform}</Badge>
                    </td>
                    <td className="py-2">
                      <Badge 
                        variant={ad.status === 'active' ? 'default' : 'secondary'}
                      >
                        {ad.status}
                      </Badge>
                    </td>
                    <td className="py-2 text-right">{formatNumber(ad.impressions)}</td>
                    <td className="py-2 text-right">{formatNumber(ad.clicks)}</td>
                    <td className="py-2 text-right">{formatPercentage(ad.ctr)}</td>
                    <td className="py-2 text-right">{formatCurrency(ad.spend)}</td>
                    <td className="py-2 text-right">{formatCurrency(ad.cpa)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 