import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { Baby, Image, User, Calendar, Trophy, TrendingUp, Clock, Heart, Utensils, Bath, Puzzle, Pill, Activity as ActivityIcon, Bot, CheckCircle } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import Confetti from "react-confetti";
import MilestoneModal from '@/components/MilestoneModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ImageUpload from '@/components/ImageUpload';
import HealthAlertsCard from '@/components/HealthAlertsCard';
import AIChatModal from '@/components/AIChatModal';
import AddBabyModal from '@/components/AddBabyModal';
import { API_CONFIG } from '../config/api';

const chartConfig = {
  peso: {
    label: "Peso (kg)",
    color: "#ec4899",
  },
  altura: {
    label: "Altura (cm)",
    color: "#3b82f6",
  },
};

interface SuggestedMilestone {
  id: string;
  title: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
  icon?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getBgClass, getGradientClass } = useTheme();
  const { user, babies, isLoading, isAuthenticated, hasBaby, isPregnancyMode, refetch } = useAuth();
  const { toast } = useToast();

  const baby = babies?.[0];

  // Novos estados para os totais reais
  const [totalMemories, setTotalMemories] = useState(0);
  const [totalMilestones, setTotalMilestones] = useState(0);
  const [totalActivities, setTotalActivities] = useState(0);
  const [thisWeekActivities, setThisWeekActivities] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [upcomingMilestones, setUpcomingMilestones] = useState<any[]>([]);
  const { currentBaby, isLoading: isAuthLoading } = useAuth();
  const [suggestedMilestones, setSuggestedMilestones] = useState<SuggestedMilestone[]>([]);
  const [selectedSuggested, setSelectedSuggested] = useState<SuggestedMilestone | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [suggestedImageFile, setSuggestedImageFile] = useState<File | null>(null);
  const [suggestedPhotoUrl, setSuggestedPhotoUrl] = useState<string | undefined>();
  const [isLoadingSuggested, setIsLoadingSuggested] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [growthData, setGrowthData] = useState<any[]>([]);
  const [showAddBabyModal, setShowAddBabyModal] = useState(false);
  const [refreshGrowth, setRefreshGrowth] = useState(false);
  const [showSuccessConfetti, setShowSuccessConfetti] = useState(false);

  const handleBabyAdded = async () => {
    await refetch();
    setShowAddBabyModal(false);
  };

  useEffect(() => {
    const fetchStats = async () => {
      if (!baby) return;
      setLoadingStats(true);
      const token = localStorage.getItem("token");
      try {
        // Buscar memórias
        const memoriesRes = await fetch(`${API_CONFIG.BASE_URL}/user/memories?babyId=${baby.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const memoriesData = await memoriesRes.json();
        setTotalMemories(Array.isArray(memoriesData.data) ? memoriesData.data.length : 0);

        // Buscar marcos
        const milestonesRes = await fetch(`${API_CONFIG.BASE_URL}/user/milestones?babyId=${baby.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const milestonesData = await milestonesRes.json();
        const milestonesArr = Array.isArray(milestonesData.data) ? milestonesData.data : [];
        setTotalMilestones(milestonesArr.length);

        // Próximos marcos (data futura)
        const now = new Date();
        const upcoming = milestonesArr
          .filter((m: any) => new Date(m.date) > now)
          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 3);
        setUpcomingMilestones(upcoming);

        // Buscar atividades
        const activitiesRes = await fetch(`${API_CONFIG.BASE_URL}/user/babies/${baby.id}/activities`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const activitiesData = await activitiesRes.json();
        const activitiesArr = activitiesData.data?.activities || [];
        setTotalActivities(Array.isArray(activitiesArr) ? activitiesArr.length : 0);

        // Atividades da semana
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        const weekCount = activitiesArr.filter((a: any) => {
          const d = new Date(a.date);
          return d >= weekAgo && d <= now;
        }).length;
        setThisWeekActivities(weekCount);

        // Atividades recentes (3 mais recentes)
        const recent = activitiesArr
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 3);
        setRecentActivities(recent);

      } catch (err) {
        setTotalMemories(0);
        setTotalMilestones(0);
        setTotalActivities(0);
        setThisWeekActivities(0);
        setRecentActivities([]);
        setUpcomingMilestones([]);
      } finally {
        setLoadingStats(false);
      }
    };
    if (baby) fetchStats();
  }, [baby]);

  const fetchSuggestedMilestones = useCallback(async () => {
    if (!currentBaby) {
      setSuggestedMilestones([]);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_CONFIG.BASE_URL}/user/milestones/suggested?babyId=${currentBaby.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Falha ao buscar marcos sugeridos');
      const data = await response.json();
      setSuggestedMilestones(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      setSuggestedMilestones([]);
    }
  }, [currentBaby]);

  useEffect(() => {
    if (!isAuthLoading) {
      fetchSuggestedMilestones();
    }
  }, [fetchSuggestedMilestones, isAuthLoading]);

  const handleAddSuggestedMilestone = (sug: SuggestedMilestone) => {
    setSelectedSuggested(sug);
    setIsModalOpen(true);
  };

  const handleSubmitSuggestedMilestone = async (fields: { date: string; description: string; }) => {
    if (!selectedSuggested || !currentBaby) return;
    setIsLoadingSuggested(true);
    try {
      const token = localStorage.getItem('token');
      let finalPhotoUrl = suggestedPhotoUrl;
      if (suggestedImageFile) {
        const formData = new FormData();
        formData.append('image', suggestedImageFile);
        formData.append('folder', 'milestones');
        const uploadRes = await fetch(`${API_CONFIG.BASE_URL}/upload/image`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          throw new Error(errorData.error || 'Erro ao fazer upload da foto');
        }
        const uploadData = await uploadRes.json();
        finalPhotoUrl = uploadData.data?.url;
      }
      const res = await fetch(`${API_CONFIG.BASE_URL}/user/milestones/from-suggested`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          suggestedMilestoneId: selectedSuggested.id,
          babyId: currentBaby.id,
          date: new Date(fields.date).toISOString(),
          photoUrl: finalPhotoUrl,
          description: fields.description,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erro ao criar marco sugerido');
      }
      setIsModalOpen(false);
      setSelectedSuggested(null);
      setSuggestedImageFile(null);
      setSuggestedPhotoUrl(undefined);
      await fetchSuggestedMilestones();
    } catch (err) {
      // erro
    } finally {
      setIsLoadingSuggested(false);
    }
  };

  // Corrige loading infinito quando não há bebê
  useEffect(() => {
    if (!babies || babies.length === 0) {
      setLoadingStats(false);
    }
  }, [babies]);

  // Buscar dados reais de crescimento
  const fetchGrowth = useCallback(async () => {
    if (!baby) {
      setGrowthData([]);
      return;
    }
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_CONFIG.BASE_URL}/user/babies/${baby.id}/growth`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (Array.isArray(data.data)) {
      setGrowthData(
        data.data.map((rec: any) => ({
          date: new Date(rec.date).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
          peso: rec.weight,
          altura: rec.height,
        }))
      );
    }
  }, [baby]);

  useEffect(() => {
    fetchGrowth();
  }, [fetchGrowth]);

  // Recarrega os dados quando o usuário volta para a aba/janela
  useEffect(() => {
    window.addEventListener('focus', fetchGrowth);
    return () => {
      window.removeEventListener('focus', fetchGrowth);
    };
  }, [fetchGrowth]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('subscription') === 'success') {
      // Exibe o confete
      setShowSuccessConfetti(true);
      setTimeout(() => setShowSuccessConfetti(false), 6000); // Confete por 6 segundos

      // Exibe a notificação
      toast({
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="font-bold">Assinatura realizada com sucesso!</span>
          </div>
        ),
        description: "Seu plano foi atualizado. Bem-vindo(a) e aproveite todos os recursos premium!",
      });

      // Força a atualização dos dados do usuário para buscar o novo plano
      refetch();
      
      // Limpa a URL para não exibir a notificação novamente
      navigate('/dashboard', { replace: true });
    }
  }, [location, navigate, toast, refetch]);

  // Mostra loading enquanto carrega os dados
  if (isLoadingSuggested || loadingStats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      title: "Memórias",
      description: "Capture momentos especiais",
      gradient: "from-pink-500 to-rose-500",
      route: "/memories",
      icon: Image
    },
    {
      title: "Marcos",
      description: "Acompanhe o desenvolvimento",
      gradient: "from-blue-500 to-cyan-500", 
      route: "/milestones",
      icon: Baby
    },
    {
      title: "Atividades",
      description: "Registre rotina diária",
      gradient: "from-emerald-500 to-teal-500",
      route: "/activities",
      icon: User
    },
    {
      title: "Configurações",
      description: "Gerencie sua conta",
      gradient: "from-purple-500 to-indigo-500",
      route: "/settings",
      icon: User
    }
  ];

  // Funções mock para estatísticas (ajuste para buscar da API real se necessário)
  const stats = {
    totalMemories,
    totalMilestones,
    totalActivities,
    thisWeekActivities
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate.split('T')[0].replace(/-/g, '/')); // Use / for local time
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    birth.setHours(0, 0, 0, 0);

    // Se a data for no futuro (modo gestante com previsão)
    if (birth > today) {
      const diffTime = birth.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return "A previsão de parto é hoje!";
      
      const weeks = Math.floor(diffDays / 7);
      const days = diffDays % 7;
      
      let result = `Faltam ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
      if (days > 0) {
        result += ` e ${days} ${days === 1 ? 'dia' : 'dias'}`;
      }
      result += " para o parto";
      return result;
    }

    // Lógica existente para bebês já nascidos
    const diffTime = today.getTime() - birth.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) {
      return `Recém-nascido`;
    }
    if (diffDays < 30) {
      return `${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30.44);
      return `${months} ${months === 1 ? 'mês' : 'meses'}`;
    } else {
      const years = Math.floor(diffDays / 365.25);
      const months = Math.floor((diffDays % 365.25) / 30.44);
      return `${years} ${years === 1 ? 'ano' : 'anos'}${months > 0 ? ` e ${months} ${months === 1 ? 'mês' : 'meses'}` : ''}`;
    }
  };

  // Funções utilitárias para atividades
  const getActivityIcon = (type: string) => {
    const icons = {
      sleep: <Clock className="w-5 h-5" />,
      feeding: <Utensils className="w-5 h-5" />,
      play: <Puzzle className="w-5 h-5" />,
      bath: <Bath className="w-5 h-5" />,
      diaper: <Baby className="w-5 h-5" />,
      medicine: <Pill className="w-5 h-5" />,
      general: <ActivityIcon className="w-5 h-5" />
    };
    return icons[type as keyof typeof icons] || <ActivityIcon className="w-5 h-5" />;
  };
  const getActivityColor = (type: string) => {
    const colors = {
      sleep: "text-blue-500 bg-blue-100",
      feeding: "text-green-500 bg-green-100",
      play: "text-yellow-500 bg-yellow-100",
      bath: "text-cyan-500 bg-cyan-100",
      diaper: "text-orange-500 bg-orange-100",
      medicine: "text-red-500 bg-red-100",
      general: "text-gray-500 bg-gray-100"
    };
    return colors[type as keyof typeof colors] || "text-gray-500 bg-gray-100";
  };
  const getActivityName = (type: string) => {
    const names = {
      sleep: 'Sono',
      feeding: 'Alimentação',
      play: 'Brincadeira',
      bath: 'Banho',
      diaper: 'Fralda',
      medicine: 'Remédio',
      general: 'Geral'
    };
    return names[type as keyof typeof names] || 'Atividade';
  };
  const formatDuration = (minutes: number) => {
    if (!minutes) return "-";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}min` : ''}`.trim();
  };

  // Função utilitária para cor da categoria do marco
  const getMilestoneCategoryColor = (category: string) => {
    const colors = {
      motor: 'bg-blue-100 text-blue-600',
      cognitive: 'bg-green-100 text-green-600',
      social: 'bg-pink-100 text-pink-600',
      language: 'bg-purple-100 text-purple-600',
      general: 'bg-gray-100 text-gray-600',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };
  const getMilestoneCategoryName = (category: string) => {
    const names = {
      motor: 'Motor',
      cognitive: 'Cognitivo',
      social: 'Social',
      language: 'Linguagem',
      general: 'Outro',
    };
    return names[category as keyof typeof names] || 'Outro';
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getBgClass()}`}>
      {showSuccessConfetti && <Confetti recycle={false} width={window.innerWidth} height={window.innerHeight} />}
      <Header />
      
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="w-full max-w-full px-2 sm:px-4 py-4 mx-auto">
          {/* Baby Profile Card */}
          <div className="mb-8 animate-fade-in">
            <Card className="glass-card border-0 shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-6 text-white text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white/30 shadow-lg">
                  <img 
                    src={baby?.photoUrl || "/placeholder.svg"} 
                    alt={baby?.name || (isPregnancyMode ? "Gestante" : "Bebê")}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h1 className="text-3xl font-bold mb-2">
                  {baby?.name || (isPregnancyMode ? "Bem-vinda, futura mamãe!" : "Seu bebê aparecerá aqui")}
                </h1>
                <p className="text-white/90 text-lg">
                  {baby ? calculateAge(baby.birthDate) : isPregnancyMode ? "Acompanhe sua gestação, registre sintomas, consultas e memórias desse momento especial!" : "Cadastre um bebê para acompanhar o crescimento"}
                </p>
                {baby && (
                  <div className="flex justify-center items-center gap-4 mt-4 text-sm">
                    <span className="bg-white/20 px-3 py-1 rounded-full">
                      {baby.gender === 'male' ? 'Menino' : baby.gender === 'female' ? 'Menina' : 'Outro'}
                    </span>
                    <span className="bg-white/20 px-3 py-1 rounded-full">
                      Nasceu em {new Date(baby.birthDate).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}
                {!baby && (
                  <div className="flex flex-col items-center gap-2 mt-4">
                    <Button className="w-full max-w-xs" onClick={() => setShowAddBabyModal(true)}>
                      {isPregnancyMode ? "Cadastrar previsão de parto" : "Adicionar bebê"}
                    </Button>
                    {isPregnancyMode && (
                      <Button variant="outline" className="w-full max-w-xs bg-white/10 hover:bg-white/20 text-white border-white/50" onClick={() => setShowAddBabyModal(true)}>
                        Nasceu antes do previsto? Adicionar bebê agora
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>
            <AddBabyModal isOpen={showAddBabyModal} onClose={() => setShowAddBabyModal(false)} onAdd={handleBabyAdded} />
          </div>
          {/* Health Alerts Card */}
          <div className="mb-8 animate-fade-in">
            {isPregnancyMode ? (
              <Card className="glass-card border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <h2 className="text-xl font-bold mb-2">Dicas para Gestantes</h2>
                  <p className="text-muted-foreground mb-2">Acompanhe consultas, exames e registre sintomas do pré-natal. Lembre-se de cuidar de você e do seu bebê!</p>
                  <Button variant="outline" onClick={() => navigate('/health')}>Acessar Diário da Gestação</Button>
                </CardContent>
              </Card>
            ) : (
              <HealthAlertsCard babyId={baby?.id || ''} limit={3} />
            )}
          </div>
          {/* Card de Gamificação/Rewards */}
          <div className="mb-8 animate-fade-in">
            <Card className="glass-card border-0 shadow-lg bg-gradient-to-r from-yellow-200 to-pink-200 dark:from-yellow-900 dark:to-pink-900 cursor-pointer hover:scale-105 transition-all duration-300" onClick={() => navigate('/rewards')}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-pink-400 shadow-lg">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-xl font-bold text-yellow-800 dark:text-yellow-200 mb-1">Recompensas & Gamificação</div>
                  <div className="text-sm text-muted-foreground">
                    {isPregnancyMode ? "Desafios e conquistas para gestantes: registre consultas, sintomas e memórias da gravidez!" : "Veja seu nível, conquistas e badges. Participe de desafios e suba no ranking!"}
                  </div>
                </div>
                <Button className="bg-gradient-to-r from-yellow-500 to-pink-500 text-white font-semibold px-6 py-2 rounded-lg shadow-md ml-4">Ver Recompensas</Button>
              </CardContent>
            </Card>
          </div>
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in">
            <Card className="glass-card border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-800">{stats.totalMemories}</div>
                <div className="text-sm text-muted-foreground">{isPregnancyMode ? "Memórias da gestação" : "Memórias"}</div>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-800">{stats.totalMilestones}</div>
                <div className="text-sm text-muted-foreground">{isPregnancyMode ? "Marcos da gravidez" : "Marcos"}</div>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-800">{stats.totalActivities}</div>
                <div className="text-sm text-muted-foreground">{isPregnancyMode ? "Consultas/Exames" : "Atividades"}</div>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-800">{stats.thisWeekActivities}</div>
                <div className="text-sm text-muted-foreground">{isPregnancyMode ? "Esta Semana (gestação)" : "Esta Semana"}</div>
              </CardContent>
            </Card>
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
            {menuItems.map((item, index) => (
              <Card 
                key={item.title}
                className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(item.route)}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 bg-gradient-to-r ${item.gradient} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {isPregnancyMode && item.title === "Memórias" ? "Registre fotos, ultrassons e sentimentos da gestação" :
                     isPregnancyMode && item.title === "Marcos" ? "Acompanhe marcos importantes da gravidez" :
                     isPregnancyMode && item.title === "Atividades" ? "Registre consultas, exames e sintomas do pré-natal" :
                     item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Growth Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 animate-fade-in">
            <Card className="glass-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800">{isPregnancyMode ? "Evolução da Gestação" : "Crescimento"}</CardTitle>
                <CardDescription>{isPregnancyMode ? "Acompanhe sua saúde, sintomas e consultas do pré-natal" : "Evolução do peso e altura"}</CardDescription>
              </CardHeader>
              <CardContent className="h-80 pt-6">
                {(!baby || new Date(baby.birthDate.split('T')[0].replace(/-/g, '/')) > new Date()) ? (
                  <div className="h-full flex items-center justify-center">
                    <span className="text-muted-foreground text-center">O gráfico de crescimento ficará disponível após o nascimento do bebê. Por enquanto, registre consultas, sintomas e memórias da gestação!</span>
                  </div>
                ) : (
                  <>
                    {growthData.length > 0 ? (
                      <ChartContainer config={chartConfig} className="w-full h-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={growthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <XAxis dataKey="date" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line type="monotone" dataKey="peso" stroke="var(--color-peso)" strokeWidth={2} dot={true} />
                            <Line type="monotone" dataKey="altura" stroke="var(--color-altura)" strokeWidth={2} dot={true} />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <span className="text-muted-foreground text-center">Nenhum dado de crescimento registrado ainda. Adicione o primeiro registro para ver o gráfico.</span>
                      </div>
                    )}
                  </>
                )}
                {baby && new Date(baby.birthDate.split('T')[0].replace(/-/g, '/')) <= new Date() && (
                  <div className="flex justify-center mt-4">
                    <Button variant="outline" onClick={() => navigate('/growth')} className="px-6 py-2 text-base font-semibold">
                      Ver histórico completo de crescimento
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card className="glass-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800">{isPregnancyMode ? "Consultas e Sintomas Recentes" : "Atividades Recentes"}</CardTitle>
                <CardDescription>{isPregnancyMode ? "Acompanhe o que está acontecendo na sua gestação" : "Últimas atividades registradas"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isPregnancyMode ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Registre suas consultas, exames e sintomas do pré-natal!</p>
                      <Button 
                        variant="outline" 
                        className="mt-2"
                        onClick={() => navigate('/health')}
                      >
                        Registrar Consulta/Sintoma
                      </Button>
                    </div>
                  ) : recentActivities.length > 0 ? (
                    recentActivities.map((activity: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{activity.title}</p>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            <span>{getActivityName(activity.type)}</span>
                            <span>•</span>
                            <span>{new Date(activity.date).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                            <span>•</span>
                            <span>{formatDuration(activity.duration)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhuma atividade registrada ainda</p>
                      <Button 
                        variant="outline" 
                        className="mt-2"
                        onClick={() => navigate('/activities')}
                      >
                        Registrar Atividade
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12">
            {suggestedMilestones.length > 0 && (
              <>
                <h3 className="text-xl font-semibold text-gray-800 tracking-tight mb-4">Próximos Marcos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card key={suggestedMilestones[0].id} className="shadow-xl border-0 bg-gradient-to-br from-white via-white/80 to-baby-lavender dark:from-gray-900 dark:via-gray-800 dark:to-baby-lavender p-1 rounded-2xl overflow-hidden">
                    <div className="p-6 flex flex-col items-center text-center relative">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-lg bg-gradient-to-br from-yellow-200 to-yellow-400">
                        <Trophy className="w-8 h-8 text-yellow-600" />
                      </div>
                      <CardTitle className="text-2xl font-bold mb-1 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-pink-600 dark:to-rose-600 bg-clip-text text-transparent">
                        {suggestedMilestones[0].title}
                      </CardTitle>
                      <div className="text-sm text-muted-foreground mb-4">Categoria: <b>{suggestedMilestones[0].category}</b></div>
                      <Button
                        onClick={() => handleAddSuggestedMilestone(suggestedMilestones[0])}
                        className={`${getGradientClass()} text-white px-8 py-2 rounded-lg shadow-lg font-semibold text-base transition-all duration-200 hover:scale-105 hover:shadow-xl`}
                      >
                        Registrar agora
                      </Button>
                    </div>
                  </Card>
                </div>
              </>
            )}
            {/* Modal para registrar marco sugerido */}
            {selectedSuggested && (
              <Dialog open={isModalOpen} onOpenChange={() => setIsModalOpen(false)}>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">Registrar marco sugerido</DialogTitle>
                    <DialogDescription>Preencha os dados do marco sugerido abaixo.</DialogDescription>
                  </DialogHeader>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const date = (form.elements.namedItem('date') as HTMLInputElement).value;
                      const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;
                      await handleSubmitSuggestedMilestone({ date, description });
                    }}
                    className="space-y-4 pt-4"
                  >
                    <div className="flex justify-center">
                      <ImageUpload
                        currentImage={suggestedPhotoUrl}
                        onImageSelect={(file) => {
                          setSuggestedImageFile(file);
                          if (file) setSuggestedPhotoUrl(URL.createObjectURL(file));
                          else setSuggestedPhotoUrl(undefined);
                        }}
                        onImageRemove={() => {
                          setSuggestedImageFile(null);
                          setSuggestedPhotoUrl(undefined);
                        }}
                        size="lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Título</Label>
                      <Input value={selectedSuggested?.title || ''} readOnly />
                    </div>
                    <div className="space-y-1">
                      <Label>Categoria</Label>
                      <Input value={selectedSuggested?.category || ''} readOnly />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="date">Data</Label>
                      <Input id="date" name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea id="description" name="description" rows={4} required placeholder="Descreva este marco..." />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" className="bg-blue-600 text-white">
                        Salvar Marco
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            <Card className="hover:shadow-lg transition cursor-pointer" onClick={() => navigate('/health')}>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="bg-pink-100 p-3 rounded-full">
                  <Heart className="w-6 h-6 text-pink-500" />
                </div>
                <div>
                  <CardTitle>Diário de Saúde</CardTitle>
                  <CardDescription>Registre sintomas, medicamentos, consultas e pré-natal do bebê.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={e => { e.stopPropagation(); navigate('/health'); }}>Acessar Saúde</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {/* Botão flutuante do chat assistente virtual */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full shadow-lg p-4 hover:scale-105 transition-all flex items-center gap-2"
        title="Abrir Assistente Virtual"
      >
        <Bot className="w-6 h-6" />
        <span className="hidden md:inline font-semibold">Assistente</span>
      </button>
      <AIChatModal open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
};

export default Dashboard;
