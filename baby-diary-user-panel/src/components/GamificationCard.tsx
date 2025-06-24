import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Target, Zap, Heart, Calendar, Camera, BookOpen, Sparkles, Gift, Crown, Baby, Coffee, Flower, Rainbow, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GamificationData {
  points: number;
  level: number;
  badges: string[];
  streak: number;
  nextLevelPoints: number;
  currentLevelPoints: number;
  dailyGoal: number;
  dailyProgress: number;
  weeklyChallenges: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    progress: number;
    target: number;
    reward: string;
    isCompleted: boolean;
  }>;
  recentAchievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    earnedAt: string;
    reward: string;
  }>;
  aiRewards: Array<{
    id: string;
    title: string;
    description: string;
    type: 'tip' | 'activity' | 'milestone' | 'encouragement';
    isUnlocked: boolean;
  }>;
}

interface GamificationCardProps {
  data: GamificationData;
}

const badgeIcons: Record<string, React.ReactNode> = {
  'first-memory': <Camera className="w-4 h-4" />,
  'week-streak': <Calendar className="w-4 h-4" />,
  'milestone-master': <Target className="w-4 h-4" />,
  'super-mom': <Heart className="w-4 h-4" />,
  'memory-keeper': <BookOpen className="w-4 h-4" />,
  'activity-champion': <Zap className="w-4 h-4" />,
  'consistency-queen': <Crown className="w-4 h-4" />,
  'baby-whisperer': <Baby className="w-4 h-4" />,
  'self-care-warrior': <Coffee className="w-4 h-4" />,
  'growth-observer': <Flower className="w-4 h-4" />,
};

const badgeNames: Record<string, string> = {
  'first-memory': 'Primeira Memória',
  'week-streak': 'Semana Consistente',
  'milestone-master': 'Mestre dos Marcos',
  'super-mom': 'Super Mamãe',
  'memory-keeper': 'Guardiã das Memórias',
  'activity-champion': 'Campeã das Atividades',
  'consistency-queen': 'Rainha da Consistência',
  'baby-whisperer': 'Sussurradora de Bebês',
  'self-care-warrior': 'Guerreira do Autocuidado',
  'growth-observer': 'Observadora do Crescimento',
};

export const GamificationCard: React.FC<GamificationCardProps> = ({
  data
}) => {
  const navigate = useNavigate();
  
  if (!data) {
    return (
      <Card>
        <CardContent>
          <p className="text-center text-gray-500">Carregando gamificação...</p>
        </CardContent>
      </Card>
    );
  }

  // Checagem defensiva para arrays
  const badges = data.badges || [];
  const weeklyChallenges = data.weeklyChallenges || [];
  const aiRewards = data.aiRewards || [];
  const recentAchievements = data.recentAchievements || [];
  const streak = typeof data.streak === 'number' ? data.streak : 0;
  const points = typeof data.points === 'number' ? data.points : 0;
  const level = typeof data.level === 'number' ? data.level : 1;
  const nextLevelPoints = typeof data.nextLevelPoints === 'number' ? data.nextLevelPoints : 0;
  const currentLevelPoints = typeof data.currentLevelPoints === 'number' ? data.currentLevelPoints : 0;
  const dailyGoal = typeof data.dailyGoal === 'number' ? data.dailyGoal : 1;
  const dailyProgress = typeof data.dailyProgress === 'number' ? data.dailyProgress : 0;

  const progressToNextLevel = ((points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints || 1)) * 100;
  const dailyProgressPercent = (dailyProgress / (dailyGoal || 1)) * 100;

  const getLevelTitle = (level: number) => {
    if (level <= 3) return "Mamãe Iniciante";
    if (level <= 6) return "Mamãe Experiente";
    if (level <= 9) return "Mamãe Especialista";
    return "Mamãe Mestre";
  };

  const completedChallenges = weeklyChallenges.filter(c => c.isCompleted).length;
  const totalChallenges = weeklyChallenges.length;
  const unlockedAIRewards = aiRewards.filter(r => r.isUnlocked).length;

  return (
    <Card className="bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 border-pink-200 hover:shadow-xl transition-all duration-300 cursor-pointer" onClick={() => navigate('/rewards')}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-purple-800">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Recompensas & Gamificação
          </div>
          <ArrowRight className="w-4 h-4 text-purple-600" />
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Resumo do Nível */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-purple-600">{getLevelTitle(level)}</p>
            <p className="text-2xl font-bold text-purple-700">Nível {level}</p>
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {level}
          </div>
        </div>

        {/* Progresso do Nível */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-purple-600">Progresso</span>
            <span className="text-purple-700 font-medium">{progressToNextLevel.toFixed(1)}%</span>
          </div>
          <Progress value={progressToNextLevel} className="h-2 bg-purple-100" />
          <p className="text-xs text-purple-600">{points} pontos • Próximo: {nextLevelPoints - points} pts</p>
        </div>

        {/* Streak Diário */}
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg border border-yellow-200">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-yellow-800">{streak} dias seguidos</p>
            <p className="text-sm text-yellow-700">Mantendo a consistência! 🌟</p>
          </div>
        </div>

        {/* Resumo de Conquistas */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-2 bg-white rounded-lg border border-purple-200">
            <p className="text-lg font-bold text-purple-700">{badges.length}</p>
            <p className="text-xs text-purple-600">Badges</p>
          </div>
          <div className="p-2 bg-white rounded-lg border border-green-200">
            <p className="text-lg font-bold text-green-700">{completedChallenges}/{totalChallenges}</p>
            <p className="text-xs text-green-600">Desafios</p>
          </div>
          <div className="p-2 bg-white rounded-lg border border-blue-200">
            <p className="text-lg font-bold text-blue-700">{unlockedAIRewards}</p>
            <p className="text-xs text-blue-600">Recompensas IA</p>
          </div>
        </div>

        {/* Badges Recentes */}
        {badges.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Badges Recentes</p>
            <div className="flex flex-wrap gap-2">
              {badges.slice(0, 3).map((badge) => (
                <Badge key={badge} variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200">
                  {badgeIcons[badge] || <Star className="w-3 h-3" />}
                  <span className="ml-1">{badgeNames[badge] || badge}</span>
                </Badge>
              ))}
              {badges.length > 3 && (
                <Badge variant="outline" className="text-gray-500">
                  +{badges.length - 3} mais
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <Button 
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
        >
          <Trophy className="w-4 h-4 mr-2" />
          Ver Recompensas Completas
        </Button>
      </CardContent>
    </Card>
  );
}; 