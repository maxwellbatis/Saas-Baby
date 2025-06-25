import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
import ActivityModal from "@/components/ActivityModal";
import { Baby, MoreHorizontal, Edit, Eye, Trash2, PlusCircle, Activity as ActivityIcon, Clock, Utensils, Bath, Puzzle, Pill, Moon, Sparkles } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useGamification } from "@/contexts/AuthContext";
import SleepAnalysisModal from '@/components/SleepAnalysisModal';
import SuggestedActivitiesModal from '@/components/SuggestedActivitiesModal';
import { API_CONFIG } from '../config/api';
import { AchievementNotification } from '@/components/AchievementNotification';

interface Activity {
  id: string;
  type: 'sleep' | 'feeding' | 'play' | 'bath' | 'diaper' | 'medicine' | 'general';
  title: string;
  description: string;
  date: string;
  duration: number; // in minutes
  notes?: string;
}

const Activities = () => {
  const navigate = useNavigate();
  const { theme, getBgClass, getGradientClass } = useTheme();
  const { toast } = useToast();
  const { babies, isLoading: isAuthLoading, refetch } = useAuth();
  const { fetchGamificationData, gamification } = useGamification();
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedActivity, setSelectedActivity] = useState<Activity | undefined>();
  const [sleepModalOpen, setSleepModalOpen] = useState(false);
  const [suggestedModalOpen, setSuggestedModalOpen] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);
  const [achievementData, setAchievementData] = useState(null);
  const prevLevelRef = useRef<number | null>(null);
  const prevBadgesRef = useRef<string[]>([]);

  const baby = babies?.[0];

  const fetchActivities = async () => {
    if (!baby) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_CONFIG.BASE_URL}/user/babies/${baby.id}/activities`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Erro ao buscar atividades");
      const data = await response.json();
      setActivities(data.data.activities || []);
    } catch (error) {
      toast({
        title: "Erro ao buscar atividades",
        description: "Não foi possível carregar as atividades do bebê.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    fetchActivities();
    refetch();
    fetchGamificationData();
  };

  useEffect(() => {
    if (baby) {
      fetchActivities();
    } else if (!isAuthLoading) {
      setIsLoading(false);
    }
  }, [baby, isAuthLoading]);
  
  const handleDeleteActivity = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_CONFIG.BASE_URL}/user/activities/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Erro ao deletar atividade");
      
      toast({
        title: "Atividade deletada",
        description: "A atividade foi removida com sucesso",
      });
      
      await fetchActivities();
    } catch (error) {
      toast({
        title: "Erro ao deletar atividade",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const openModal = (mode: 'create' | 'edit' | 'view', activity?: Activity) => {
    setModalMode(mode);
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };
  
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
  
  // Detecta novos badges ou level up após atualização da gamificação
  useEffect(() => {
    if (!gamification) return;
    
    // Detecta level up
    if (
      prevLevelRef.current !== null &&
      gamification.level > prevLevelRef.current
    ) {
      setAchievementData({
        id: `level-${gamification.level}`,
        title: `Nível ${gamification.level}`,
        description: `Parabéns! Você subiu para o nível ${gamification.level}!`,
        icon: 'level-up',
        points: 0,
        type: 'level',
      });
      setShowAchievement(true);
    }
    
    // Detecta novos badges
    if (
      prevBadgesRef.current.length > 0 &&
      gamification.badges.length > prevBadgesRef.current.length
    ) {
      const newBadge = gamification.badges.find(
        (b) => !prevBadgesRef.current.includes(b)
      );
      if (newBadge) {
        setAchievementData({
          id: `badge-${newBadge}`,
          title: `Novo Badge: ${newBadge}`,
          description: 'Você conquistou um novo badge!',
          icon: 'first-memory',
          points: 0,
          type: 'badge',
        });
        setShowAchievement(true);
      }
    }
    
    prevLevelRef.current = gamification.level;
    prevBadgesRef.current = gamification.badges;
  }, [gamification]);

  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!baby) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${getBgClass()}`}>
        <Header />
        <div className="container max-w-4xl mx-auto px-4 py-8 text-center flex flex-col items-center justify-center min-h-[60vh]">
          <Baby className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Nenhum bebê encontrado</h2>
          <p className="text-muted-foreground mb-4">
            Você precisa adicionar um bebê para registrar atividades.
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => window.history.back()} className="mb-2">Voltar</Button>
            <Button onClick={() => navigate('/settings')} variant="outline">Adicionar bebê</Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen bg-gradient-to-br ${getBgClass()}`}>
      {/* Notificação de conquista */}
      <AchievementNotification
        achievement={achievementData}
        isVisible={showAchievement}
        onClose={() => setShowAchievement(false)}
      />
      <Header />
      <div className="w-full max-w-full px-2 sm:px-4 py-4 mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 mb-8">
          <div className="flex items-center gap-2 sm:gap-4">
            <BackButton to="/dashboard" />
            <div>
              <h1 className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${theme === 'blue' ? 'from-blue-600 to-cyan-600' : 'from-pink-600 to-rose-600'} bg-clip-text text-transparent`}>
                Atividades de {baby.name}
              </h1>
              <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
                Registre a rotina diária e acompanhe os hábitos
              </p>
            </div>
            <Button
              onClick={() => setSleepModalOpen(true)}
              className="ml-0 sm:ml-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg flex items-center gap-2 px-3 py-2 text-sm sm:px-6 sm:py-2 sm:text-base"
            >
              <Moon className="w-4 h-4" /> Análise do Sono
            </Button>
            <Button
              onClick={() => setSuggestedModalOpen(true)}
              className="bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg flex items-center gap-2 px-3 py-2 text-sm sm:px-6 sm:py-2 sm:text-base"
            >
              <Sparkles className="w-4 h-4" /> Sugestões
            </Button>
            <Button
              onClick={() => openModal('create')}
              className={`${getGradientClass()} text-white border-0 shadow-lg flex items-center gap-2 px-3 py-2 text-sm sm:px-6 sm:py-2 sm:text-base ml-2`}
            >
              <PlusCircle className="w-4 h-4 mr-2" /> Nova Atividade
            </Button>
          </div>
        </div>

        {/* Activities List */}
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <Card 
              key={activity.id}
              className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 grid grid-cols-4 items-center gap-4">
                  <div>
                    <p className="font-semibold text-gray-800">{activity.title}</p>
                    <Badge variant="secondary" className="mt-1">{getActivityName(activity.type)}</Badge>
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {activity.description}
                  </div>
                  <div className="text-muted-foreground text-sm text-center">
                    {new Date(activity.date).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-muted-foreground text-sm font-medium text-center">
                    {formatDuration(activity.duration)}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openModal('view', activity)}>
                      <Eye className="w-4 h-4 mr-2" />
                      Ver
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openModal('edit', activity)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Deletar
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover atividade</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover a atividade "{activity.title}"? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteActivity(activity.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {activities.length === 0 && !isLoading && (
          <div className="text-center py-12 animate-fade-in">
            <div className={`w-24 h-24 mx-auto mb-6 ${getGradientClass()} rounded-full flex items-center justify-center`}>
              <ActivityIcon className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Nenhuma atividade registrada ainda
            </h3>
            <p className="text-muted-foreground mb-6">
              Acompanhe a rotina do seu bebê registrando as atividades do dia a dia
            </p>
            <Button 
              onClick={() => openModal('create')}
              className={`${getGradientClass()} text-white border-0 hover:shadow-lg transition-all duration-300`}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Registrar primeira atividade
            </Button>
          </div>
        )}
      </div>

      <ActivityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        activity={selectedActivity}
        mode={modalMode}
        babyId={baby?.id}
      />
      <SleepAnalysisModal open={sleepModalOpen} onClose={() => setSleepModalOpen(false)} />
      <SuggestedActivitiesModal open={suggestedModalOpen} onClose={() => setSuggestedModalOpen(false)} />
    </div>
  );
};

export default Activities;
