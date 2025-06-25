import { useAuth, useGamification } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import Header from '@/components/Header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartContainer } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { useEffect, useState, useRef } from 'react';
import GrowthMeasurements from '@/components/GrowthMeasurements';
import { useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../config/api';
import { AchievementNotification } from '@/components/AchievementNotification';

const chartConfig = {
  peso: {
    label: 'Peso (kg)',
    color: '#ec4899',
  },
  altura: {
    label: 'Altura (cm)',
    color: '#3b82f6',
  },
};

const Growth = () => {
  const { babies, isLoading } = useAuth();
  const { getBgClass } = useTheme();
  const baby = babies?.[0];
  const [growthData, setGrowthData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { fetchGamificationData, gamification } = useGamification();
  
  // Estados para notificação de conquista
  const [showAchievement, setShowAchievement] = useState(false);
  const [achievementData, setAchievementData] = useState(null);
  const prevLevelRef = useRef<number | null>(null);
  const prevBadgesRef = useRef<string[]>([]);

  useEffect(() => {
    const fetchGrowth = async () => {
      if (!baby) return;
      setLoading(true);
      const token = localStorage.getItem('token');
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
      setLoading(false);
    };
    fetchGrowth();
  }, [baby]);

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
          icon: 'growth-tracker',
          points: 0,
          type: 'badge',
        });
        setShowAchievement(true);
      }
    }
    
    prevLevelRef.current = gamification.level;
    prevBadgesRef.current = gamification.badges;
  }, [gamification]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!baby) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${getBgClass()}`}>
        <Header />
        <div className="w-full max-w-full px-2 sm:px-4 py-4 mx-auto text-center flex flex-col items-center justify-center min-h-[60vh]">
          <h2 className="text-2xl font-bold mb-2">Nenhum bebê encontrado</h2>
          <p className="text-muted-foreground mb-4">
            Você precisa adicionar um bebê para registrar medidas de crescimento.
          </p>
          <Button onClick={() => navigate('/settings')} variant="outline">Adicionar bebê</Button>
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
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>Voltar ao Dashboard</Button>
          <h1 className="text-3xl font-bold">Histórico de Crescimento</h1>
        </div>
        <Card className="mb-10 shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">Gráfico de Crescimento</CardTitle>
            <CardDescription>Evolução do peso e altura do bebê</CardDescription>
          </CardHeader>
          <CardContent className="pb-10 pt-2 px-6">
            <div className="h-96 w-full max-w-full">
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthData.length > 0 ? growthData : undefined}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Line type="monotone" dataKey="peso" stroke="var(--color-peso)" strokeWidth={2} />
                    <Line type="monotone" dataKey="altura" stroke="var(--color-altura)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
        <GrowthMeasurements babyId={baby.id} canEdit={true} />
      </div>
    </div>
  );
};

export default Growth; 