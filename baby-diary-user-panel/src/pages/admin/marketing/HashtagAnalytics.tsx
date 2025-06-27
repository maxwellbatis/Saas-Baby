import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Copy,
  CheckCircle,
  AlertCircle,
  Hash,
  Users,
  Instagram,
  Facebook,
  Loader2,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { useToast } from '../../../hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';

interface HashtagData {
  hashtag: string;
  reach: number;
  impressions: number;
  engagement: number;
  engagementRate: number;
  posts: number;
  trending: 'up' | 'down' | 'stable';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  suggested: boolean;
  lastUsed?: string;
  performance: 'high' | 'medium' | 'low';
}

interface TrendingHashtag {
  hashtag: string;
  growth: string;
  reach: number;
  category: string;
  trending: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  platform: 'instagram' | 'facebook';
}

interface HashtagAnalyticsData {
  metrics: {
    totalHashtags: number;
    totalReach: number;
    avgGrowth: number;
    trendingCount: number;
  };
  trendingHashtags: TrendingHashtag[];
  categoryAnalysis: Record<string, any>;
  difficultyAnalysis: Record<string, any>;
  platformAnalysis: Record<string, any>;
  apiStatus: {
    instagram: boolean;
    facebook: boolean;
  };
  filters: {
    platform: string;
    category: string;
    period: string;
    search: string;
  };
}

interface HashtagCategory {
  name: string;
  hashtags: HashtagData[];
  totalReach: number;
  avgEngagement: number;
}

interface HashtagSuggestion {
  hashtag: string;
  reason: string;
  expectedReach: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  trending: boolean;
}

export const HashtagAnalytics: React.FC = () => {
  const { toast } = useToast();
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState('30d');
  const [viewMode, setViewMode] = useState<'performance' | 'trending' | 'suggestions'>('performance');
  const [data, setData] = useState<HashtagAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    platform: 'all',
    category: 'all',
    period: '7d',
    search: ''
  });

  // Dados simulados de hashtags
  const [hashtagData, setHashtagData] = useState<HashtagData[]>([
    {
      hashtag: '#maternidade',
      reach: 1250000,
      impressions: 2100000,
      engagement: 45000,
      engagementRate: 3.6,
      posts: 12500,
      trending: 'up',
      category: 'maternidade',
      difficulty: 'medium',
      suggested: true,
      lastUsed: '2024-01-15',
      performance: 'high'
    },
    {
      hashtag: '#bebe',
      reach: 890000,
      impressions: 1500000,
      engagement: 32000,
      engagementRate: 3.6,
      posts: 8900,
      trending: 'up',
      category: 'bebe',
      difficulty: 'easy',
      suggested: true,
      lastUsed: '2024-01-14',
      performance: 'high'
    },
    {
      hashtag: '#desenvolvimentoinfantil',
      reach: 450000,
      impressions: 780000,
      engagement: 18000,
      engagementRate: 4.0,
      posts: 3200,
      trending: 'up',
      category: 'desenvolvimento',
      difficulty: 'medium',
      suggested: false,
      lastUsed: '2024-01-10',
      performance: 'medium'
    },
    {
      hashtag: '#gestante',
      reach: 320000,
      impressions: 520000,
      engagement: 12000,
      engagementRate: 3.8,
      posts: 2100,
      trending: 'stable',
      category: 'gestacao',
      difficulty: 'easy',
      suggested: true,
      lastUsed: '2024-01-12',
      performance: 'medium'
    },
    {
      hashtag: '#amamentacao',
      reach: 280000,
      impressions: 450000,
      engagement: 11000,
      engagementRate: 3.9,
      posts: 1800,
      trending: 'down',
      category: 'amamentacao',
      difficulty: 'hard',
      suggested: false,
      lastUsed: '2024-01-08',
      performance: 'low'
    },
    {
      hashtag: '#babydiary',
      reach: 150000,
      impressions: 250000,
      engagement: 8000,
      engagementRate: 5.3,
      posts: 850,
      trending: 'up',
      category: 'marca',
      difficulty: 'easy',
      suggested: true,
      lastUsed: '2024-01-15',
      performance: 'high'
    }
  ]);

  const [suggestions, setSuggestions] = useState<HashtagSuggestion[]>([
    {
      hashtag: '#primeiravez',
      reason: 'Alta relevância para mães de primeira viagem',
      expectedReach: 180000,
      difficulty: 'easy',
      category: 'maternidade',
      trending: true
    },
    {
      hashtag: '#crescimentobebe',
      reason: 'Complementa hashtags de desenvolvimento',
      expectedReach: 120000,
      difficulty: 'medium',
      category: 'desenvolvimento',
      trending: false
    },
    {
      hashtag: '#dicasmae',
      reason: 'Hashtag educacional com boa performance',
      expectedReach: 95000,
      difficulty: 'easy',
      category: 'dicas',
      trending: true
    }
  ]);

  // Filtrar hashtags baseado nos filtros
  const filteredHashtags = hashtagData.filter(hashtag => {
    const matchesSearch = hashtag.hashtag.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || hashtag.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calcular métricas gerais
  const totalReach = hashtagData.reduce((sum, h) => sum + h.reach, 0);
  const totalEngagement = hashtagData.reduce((sum, h) => sum + h.engagement, 0);
  const avgEngagementRate = hashtagData.reduce((sum, h) => sum + h.engagementRate, 0) / hashtagData.length;
  const trendingUp = hashtagData.filter(h => h.trending === 'up').length;

  // Agrupar por categoria
  const categories = hashtagData.reduce((acc, hashtag) => {
    if (!acc[hashtag.category]) {
      acc[hashtag.category] = {
        name: hashtag.category,
        hashtags: [],
        totalReach: 0,
        avgEngagement: 0
      };
    }
    acc[hashtag.category].hashtags.push(hashtag);
    acc[hashtag.category].totalReach += hashtag.reach;
    acc[hashtag.category].avgEngagement += hashtag.engagement;
    return acc;
  }, {} as Record<string, HashtagCategory>);

  // Converter para array
  const categoryData = Object.values(categories).map(cat => ({
    ...cat,
    avgEngagement: cat.avgEngagement / cat.hashtags.length
  }));

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Hashtag copiada!",
      description: `${text} foi copiado para a área de transferência.`,
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getTrendingIcon = (trending: string) => {
    switch (trending) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com Status das APIs */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hashtag Analytics</h2>
          <p className="text-gray-600">Análise de performance e tendências de hashtags</p>
        </div>
        
        {/* Status das APIs */}
        {data?.apiStatus && (
          <div className="flex gap-2">
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
              data.apiStatus.instagram 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                data.apiStatus.instagram ? 'bg-green-500' : 'bg-red-500'
              }`} />
              Instagram {data.apiStatus.instagram ? 'Conectado' : 'Desconectado'}
            </div>
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
              data.apiStatus.facebook 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                data.apiStatus.facebook ? 'bg-green-500' : 'bg-red-500'
              }`} />
              Facebook {data.apiStatus.facebook ? 'Conectado' : 'Desconectado'}
            </div>
          </div>
        )}
      </div>

      {/* Aviso sobre dados simulados */}
      {data?.apiStatus && (!data.apiStatus.instagram || !data.apiStatus.facebook) && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Atenção</AlertTitle>
          <AlertDescription>
            Algumas APIs não estão configuradas. Os dados mostrados são simulados para demonstração. 
            Configure as variáveis de ambiente para acessar dados reais do Instagram e Facebook.
          </AlertDescription>
        </Alert>
      )}

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Select
          value={filters.platform}
          onValueChange={(value) => setFilters(prev => ({ ...prev, platform: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Plataforma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Plataformas</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.category}
          onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Categorias</SelectItem>
            <SelectItem value="maternidade">Maternidade</SelectItem>
            <SelectItem value="bebe">Bebê</SelectItem>
            <SelectItem value="gestacao">Gestação</SelectItem>
            <SelectItem value="amamentacao">Amamentação</SelectItem>
            <SelectItem value="desenvolvimento">Desenvolvimento</SelectItem>
            <SelectItem value="marca">Marca</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.period}
          onValueChange={(value) => setFilters(prev => ({ ...prev, period: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="90d">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Buscar hashtags..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
        />
      </div>

      {/* Métricas Gerais */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Hashtags</CardTitle>
              <Hash className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.metrics.totalHashtags}</div>
              <p className="text-xs text-muted-foreground">
                Analisadas nas plataformas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alcance Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(data.metrics.totalReach)}
              </div>
              <p className="text-xs text-muted-foreground">
                Pessoas alcançadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Crescimento Médio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                +{data.metrics.avgGrowth}%
              </div>
              <p className="text-xs text-muted-foreground">
                Crescimento médio
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Tendência</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {data.metrics.trendingCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Hashtags trending
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Análise por Categoria */}
      {data?.categoryAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>Análise por Categoria</CardTitle>
            <CardDescription>
              Performance das hashtags por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(data.categoryAnalysis).map(([category, analysis]) => (
                <div key={category} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold capitalize">{category}</h4>
                    <Badge variant="secondary">{analysis.count}</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Alcance:</span>
                      <span className="font-medium">{formatNumber(analysis.totalReach)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Crescimento:</span>
                      <span className="font-medium text-green-600">
                        +{analysis.avgGrowth.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Análise por Dificuldade */}
      {data?.difficultyAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>Análise por Dificuldade</CardTitle>
            <CardDescription>
              Distribuição das hashtags por nível de dificuldade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(data.difficultyAnalysis).map(([difficulty, analysis]) => (
                <div key={difficulty} className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold mb-2">{analysis.count}</div>
                  <div className="text-sm text-muted-foreground capitalize mb-2">
                    {difficulty}
                  </div>
                  <Badge 
                    variant={
                      difficulty === 'easy' ? 'default' : 
                      difficulty === 'medium' ? 'secondary' : 'destructive'
                    }
                  >
                    {difficulty === 'easy' ? 'Fácil' : 
                     difficulty === 'medium' ? 'Médio' : 'Difícil'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Análise por Plataforma */}
      {data?.platformAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>Análise por Plataforma</CardTitle>
            <CardDescription>
              Performance das hashtags por plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(data.platformAnalysis).map(([platform, analysis]) => (
                <div key={platform} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    {platform === 'instagram' ? (
                      <Instagram className="h-5 w-5 text-pink-600" />
                    ) : (
                      <Facebook className="h-5 w-5 text-blue-600" />
                    )}
                    <h4 className="font-semibold capitalize">{platform}</h4>
                    <Badge variant="outline">{analysis.count}</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Alcance Total:</span>
                      <span className="font-medium">{formatNumber(analysis.totalReach)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Crescimento Médio:</span>
                      <span className="font-medium text-green-600">
                        +{analysis.avgGrowth.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hashtags em Tendência */}
      {data?.trendingHashtags && (
        <Card>
          <CardHeader>
            <CardTitle>Hashtags em Tendência</CardTitle>
            <CardDescription>
              Top hashtags com melhor performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.trendingHashtags.map((hashtag, index) => (
                <div key={hashtag.hashtag} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                    <div>
                      <div className="font-semibold">{hashtag.hashtag}</div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {hashtag.category} • {hashtag.platform}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">{hashtag.growth}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatNumber(hashtag.reach)} alcance
                    </div>
                  </div>
                  <Badge 
                    variant={
                      hashtag.difficulty === 'easy' ? 'default' : 
                      hashtag.difficulty === 'medium' ? 'secondary' : 'destructive'
                    }
                  >
                    {hashtag.difficulty === 'easy' ? 'Fácil' : 
                     hashtag.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading e Error States */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Carregando dados de hashtags...</p>
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}; 