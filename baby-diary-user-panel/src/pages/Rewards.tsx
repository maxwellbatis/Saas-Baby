import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Award, Star, TrendingUp, Flame, Trophy, Users, Share2, ArrowLeft, Info, Lock, Sparkles, Heart, Target, Zap, Baby, Coffee, Flower, Crown, Gift, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import Confetti from 'react-confetti';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from '@/components/ui/dialog';
import { BadgeCollection } from '@/components/BadgeCollection';
import { getGamificationData, updateDailyProgress, claimChallengeReward, unlockAIReward, getWeeklyRanking } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { RewardsTabs } from "@/components/RewardsTabs";
import { AIRewardModal, type AIReward } from '@/components/AIRewardModal';

interface Gamification {
  level: number;
  points: number;
  badges: string[];
  streaks: Record<string, number>;
  achievements: string[];
  userId?: string;
  nextLevelPoints: number;
  currentLevelPoints: number;
  dailyGoal: number;
  dailyProgress: number;
  totalActivities: number;
  totalMemories: number;
  totalMilestones: number;
  progressToNextLevel: number;
}

interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: {
    progress: number;
    goal: number;
    isCompleted: boolean;
    reward: string;
  };
  category: string;
  points: number;
}

interface RankingUser {
  id: string;
  name: string;
  email: string;
}

interface RankingEntry {
  id: string;
  userId: string;
  user: RankingUser;
  week: number;
  year: number;
  points: number;
  rank?: number;
}

const Rewards = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [gamification, setGamification] = useState<Gamification | null>(null);
  const [weeklyChallenges, setWeeklyChallenges] = useState<WeeklyChallenge[]>([]);
  const [aiRewards, setAiRewards] = useState<AIReward[]>([]);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [showAIRewardModal, setShowAIRewardModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<WeeklyChallenge | null>(null);
  const [selectedAIReward, setSelectedAIReward] = useState<AIReward | null>(null);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [levelUp, setLevelUp] = useState(false);

  useEffect(() => {
    fetchGamificationData();
  }, []);

  const fetchGamificationData = async () => {
    try {
      setLoading(true);
      const data = await getGamificationData();
      
      setGamification(data.gamification);
      setWeeklyChallenges(data.weeklyChallenges);
      setAiRewards(data.aiRewards);
      setRanking(data.ranking);
      setNewBadges(data.newBadges || []);
      setLevelUp(data.levelUp || false);

      // Mostrar confetti se subiu de nível
      if (data.levelUp) {
        setShowConfetti(true);
        setShowLevelModal(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }

      // Mostrar confetti se conquistou novos badges
      if (data.newBadges && data.newBadges.length > 0) {
        setShowConfetti(true);
        setShowBadgeModal(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    } catch (error) {
      console.error('Erro ao buscar dados de gamificação:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = async (challengeId: string) => {
    try {
      const result = await claimChallengeReward(challengeId);
      
      // Atualizar dados locais
      setGamification(result.gamification);
      
      // Mostrar confetti
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      
      // Recarregar dados
      fetchGamificationData();
    } catch (error) {
      console.error('Erro ao reivindicar recompensa:', error);
    }
  };

  const handleViewAIReward = (reward: AIReward) => {
    setSelectedAIReward(reward);
    setShowAIRewardModal(true);
  };

  const handleUnlockAIReward = async (rewardId: string) => {
    try {
      const result = await unlockAIReward(rewardId);
      
      // Mostrar confetti
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      
      // Recarregar dados
      await fetchGamificationData();
      
      // Buscar a recompensa desbloqueada e abrir o modal
      const unlockedReward = aiRewards.find(reward => reward.id === rewardId);
      if (unlockedReward) {
        setSelectedAIReward(unlockedReward);
        setShowAIRewardModal(true);
      }
    } catch (error) {
      console.error('Erro ao desbloquear recompensa:', error);
    }
  };

  const handleShareAchievement = (type: string, name: string) => {
    const text = `🎉 Acabei de conquistar ${name} no Baby Diary! ${type === 'level' ? 'Subi para o nível ' + gamification?.level : 'Ganhei um novo badge!'} 👶✨`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Conquista no Baby Diary',
        text,
        url: window.location.href,
      });
    } else {
      // Fallback para copiar para clipboard
      navigator.clipboard.writeText(text);
      alert('Texto copiado para a área de transferência!');
    }
  };

  const getLevelTitle = (level: number) => {
    const titles = {
      1: 'Mamãe Iniciante',
      2: 'Mamãe Aprendiz',
      3: 'Mamãe Dedicada',
      4: 'Mamãe Experiente',
      5: 'Mamãe Guerreira',
      6: 'Mamãe Sábia',
      7: 'Mamãe Inspiradora',
      8: 'Mamãe Extraordinária',
      9: 'Mamãe Lendária',
      10: 'Mamãe Mestre',
    };
    return titles[level as keyof typeof titles] || `Mamãe Nível ${level}`;
  };

  const getLevelMessage = (level: number) => {
    const messages = {
      1: 'Começando sua jornada de amor e descobertas!',
      2: 'Cada dia é uma nova aventura com seu bebê!',
      3: 'Você está se tornando uma especialista!',
      4: 'Sua dedicação é inspiradora!',
      5: 'Uma verdadeira guerreira do amor!',
      6: 'Sua sabedoria cresce a cada dia!',
      7: 'Inspirando outras mamães!',
      8: 'Você é extraordinária!',
      9: 'Uma lenda entre as mamães!',
      10: 'A mestra suprema do amor materno!',
    };
    return messages[level as keyof typeof messages] || 'Continue sua jornada incrível!';
  };

  const getStreakMessage = (streakType: string, days: number) => {
    const messages = {
      login: {
        1: 'Primeiro dia de consistência!',
        3: '3 dias seguidos! Você está no caminho certo!',
        7: 'Uma semana inteira! Você é incrível!',
        30: 'Um mês de dedicação! Você é uma inspiração!',
      },
      activities: {
        1: 'Primeira atividade registrada!',
        5: '5 atividades! Mantendo o ritmo!',
        10: '10 atividades! Você é uma super mamãe!',
      },
      memories: {
        1: 'Primeira memória criada!',
        5: '5 memórias preciosas!',
        10: '10 memórias! Cada uma mais especial!',
      },
    };
    
    const typeMessages = messages[streakType as keyof typeof messages] || {};
    return typeMessages[days as keyof typeof typeMessages] || `Incrível! ${days} dias de ${streakType}!`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-baby-pink via-baby-blue to-baby-lavender">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white">Carregando sua jornada de gamificação...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!gamification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-baby-pink via-baby-blue to-baby-lavender">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-white">Erro ao carregar dados de gamificação</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-baby-pink via-baby-blue to-baby-lavender">
      <Header />
      <div className="container mx-auto px-3 sm:px-4 pt-4 flex items-center">
        <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Voltar para o painel
        </Button>
      </div>
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* PAINEL DE GAMIFICAÇÃO */}
        <div className="mb-10">
          {/* Nível e barra de progresso */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 baby-gradient-pink rounded-full flex items-center justify-center">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">Nível {gamification.level}</div>
                <div className="text-sm text-muted-foreground">{getLevelTitle(gamification.level)}</div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="font-semibold text-pink-600 text-lg">{gamification.points} pontos</div>
              <div className="text-xs text-muted-foreground">Próximo nível: {gamification.nextLevelPoints - gamification.points} pts</div>
            </div>
          </div>
          <Progress value={gamification.progressToNextLevel} className="h-3 mb-4" />
          <div className="text-xs text-muted-foreground mb-4">Progresso para o próximo nível: {gamification.currentLevelPoints} / {gamification.nextLevelPoints}</div>

          {/* Badges conquistados */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold">Badges conquistados</span>
              <Button size="sm" variant="outline" onClick={() => setShowBadgeModal(true)}>Ver todos</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {gamification.badges && gamification.badges.length > 0 ? (
                gamification.badges.slice(0, 5).map((badge) => (
                  <Badge key={badge} className="bg-yellow-100 text-yellow-700 border-yellow-300">{badge}</Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">Nenhum badge ainda</span>
              )}
            </div>
          </div>

          {/* Streaks */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="font-semibold">Streaks</span>
            </div>
            <div className="flex flex-wrap gap-4">
              {gamification.streaks && Object.keys(gamification.streaks).length > 0 ? (
                Object.entries(gamification.streaks).map(([type, days]) => (
                  <div key={type} className="flex flex-col items-center">
                    <span className="font-bold text-orange-600 text-lg">{days}d</span>
                    <span className="text-xs text-muted-foreground capitalize">{type}</span>
                    <span className="text-[10px] text-gray-400">{getStreakMessage(type, days as number)}</span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">Nenhum streak ainda</span>
              )}
            </div>
          </div>

          {/* Desafios semanais */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-blue-500" />
              <span className="font-semibold">Desafios Semanais</span>
            </div>
            <div className="flex flex-wrap gap-4">
              {weeklyChallenges && weeklyChallenges.length > 0 ? (
                weeklyChallenges.map((challenge) => (
                  <Card key={challenge.id} className="min-w-[220px]">
                    <CardHeader className="pb-2 flex flex-row items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <CardTitle className="text-base font-semibold">{challenge.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs text-muted-foreground mb-2">{challenge.description}</div>
                      <Progress value={Math.min(100, (challenge.progress.progress / challenge.progress.goal) * 100)} className="h-2 mb-2" />
                      <div className="flex items-center gap-2 text-xs">
                        <span>{challenge.progress.progress} / {challenge.progress.goal}</span>
                        {challenge.progress.isCompleted ? (
                          <Badge className="bg-green-100 text-green-700 border-green-300">Concluído</Badge>
                        ) : null}
                      </div>
                      <Button
                        size="sm"
                        className="mt-2 w-full"
                        disabled={challenge.progress.isCompleted}
                        onClick={() => handleClaimReward(challenge.id)}
                      >
                        {challenge.progress.isCompleted ? <CheckCircle className="w-4 h-4 mr-2" /> : <Gift className="w-4 h-4 mr-2" />}
                        {challenge.progress.isCompleted ? "Recompensa Recebida" : `Resgatar +${challenge.points} pts`}
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">Nenhum desafio disponível</span>
              )}
            </div>
          </div>

          {/* Recompensas IA */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <span className="font-semibold">Recompensas IA</span>
            </div>
            <div className="flex flex-wrap gap-4">
              {aiRewards && aiRewards.length > 0 ? (
                aiRewards.map((reward) => (
                  <Card key={reward.id} className="min-w-[180px]">
                    <CardHeader className="pb-2 flex flex-row items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-400" />
                      <CardTitle className="text-base font-semibold">{reward.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs text-muted-foreground mb-2">{reward.description}</div>
                      <Button
                        size="sm"
                        className="mt-2 w-full"
                        disabled={reward.isUnlocked || gamification.points < 200}
                        onClick={() => reward.isUnlocked ? handleViewAIReward(reward) : handleUnlockAIReward(reward.id)}
                      >
                        {reward.isUnlocked ? <CheckCircle className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                        {reward.isUnlocked ? "Desbloqueado" : gamification.points < 200 ? "Pontos insuficientes" : "Desbloquear por 200 pontos"}
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">Nenhuma recompensa IA disponível</span>
              )}
            </div>
          </div>

          {/* Ranking semanal */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-purple-500" />
              <span className="font-semibold">Ranking Semanal</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[400px] w-full text-xs">
                <thead>
                  <tr className="bg-purple-50">
                    <th className="py-2 px-2 text-left">#</th>
                    <th className="py-2 px-2 text-left">Usuário</th>
                    <th className="py-2 px-2 text-left">Pontos</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking && ranking.length > 0 ? (
                    ranking.map((entry, idx) => (
                      <tr key={entry.id} className={idx === 0 ? "bg-yellow-50" : ""}>
                        <td className="py-2 px-2 font-bold">{entry.rank || idx + 1}</td>
                        <td className="py-2 px-2">{entry.user?.name || entry.user?.email || "Usuário"}</td>
                        <td className="py-2 px-2">{entry.points}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={3} className="text-center text-muted-foreground py-2">Sem ranking ainda</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* TABS DE RECOMPENSAS */}
        <RewardsTabs userPoints={gamification.points} />
      </div>

      {/* Modais */}
      <Dialog open={showBadgeModal} onOpenChange={setShowBadgeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              Novos Badges Conquistados!
            </DialogTitle>
            <DialogDescription>
              Parabéns! Você conquistou novos badges na sua jornada!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {newBadges.map((badge) => (
              <div key={badge} className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Award className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{badge}</div>
                  <div className="text-sm text-gray-600">Badge desbloqueado!</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button 
              className="flex-1"
              onClick={() => setShowBadgeModal(false)}
            >
              Continuar
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleShareAchievement('badge', newBadges.join(', '))}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showLevelModal} onOpenChange={setShowLevelModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Subiu de Nível!
            </DialogTitle>
            <DialogDescription>
              Parabéns! Você alcançou um novo nível na sua jornada!
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto mb-4 baby-gradient-pink rounded-full flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {getLevelTitle(gamification.level)}
            </h3>
            <p className="text-gray-600">
              {getLevelMessage(gamification.level)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              className="flex-1"
              onClick={() => setShowLevelModal(false)}
            >
              Continuar
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleShareAchievement('level', getLevelTitle(gamification.level))}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Recompensa IA usando o componente completo */}
      <AIRewardModal
        isOpen={showAIRewardModal}
        onClose={() => setShowAIRewardModal(false)}
        reward={selectedAIReward}
      />
    </div>
  );
};

export default Rewards; 