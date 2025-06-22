import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Star, TrendingUp, Flame, Trophy, Users, Share2, ArrowLeft, Info } from 'lucide-react';
import Header from '@/components/Header';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import Confetti from 'react-confetti';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface Gamification {
  level: number;
  points: number;
  badges: string[];
  streaks: Record<string, number>;
  achievements: string[];
  userId?: string;
}

const Rewards = () => {
  const { getGradientClass, theme } = useTheme();
  const navigate = useNavigate();
  const [gamification, setGamification] = useState<Gamification | null>(null);
  const [loading, setLoading] = useState(true);
  const [ranking, setRanking] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [lastBadges, setLastBadges] = useState<string[]>([]);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [achievementData, setAchievementData] = useState<{ type: 'badge' | 'achievement'; name: string } | null>(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [lastLevel, setLastLevel] = useState<number | null>(null);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      // Gamificação
      const res = await fetch('http://localhost:3000/api/user/gamification', {
        headers: { Authorization: `Bearer ${token}` },
      });
      let gamificationData = null;
      if (res.ok) {
        const data = await res.json();
        gamificationData = data.data;
        setGamification(gamificationData);
      }
      // Ranking
      const resRank = await fetch('http://localhost:3000/api/user/ranking', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resRank.ok) {
        const data = await resRank.json();
        setRanking(data.data.top || []);
      }
      // Desafios
      const resChallenges = await fetch('http://localhost:3000/api/user/challenges', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resChallenges.ok) {
        const data = await resChallenges.json();
        setChallenges(data.data || []);
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  // Confete ao ganhar nova medalha/conquista + modal animado
  useEffect(() => {
    if (!gamification) return;
    // Modal de medalha
    if (lastBadges.length === 0 && gamification.badges.length > 0) {
      setLastBadges(gamification.badges);
    } else if (gamification.badges.length > lastBadges.length) {
      setShowConfetti(true);
      setShowAchievementModal(true);
      setAchievementData({ type: 'badge', name: gamification.badges[gamification.badges.length - 1] });
      setTimeout(() => setShowConfetti(false), 4000);
      setTimeout(() => setShowAchievementModal(false), 3500);
      setLastBadges(gamification.badges);
    }
    // Modal de level up
    if (lastLevel !== null && gamification.level > lastLevel) {
      setShowConfetti(true);
      setShowLevelUpModal(true);
      setTimeout(() => setShowConfetti(false), 4000);
      setTimeout(() => setShowLevelUpModal(false), 3500);
    }
    setLastLevel(gamification.level);
  }, [gamification]);

  return (
    <TooltipProvider>
      <div className={`min-h-screen bg-gradient-to-br ${theme === 'blue' ? 'from-baby-blue via-baby-lavender to-baby-mint' : 'from-baby-pink via-baby-peach to-baby-lavender'}`}>
        <Header />
        <div className="container max-w-3xl mx-auto px-4 py-8 animate-fade-in">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Dashboard
          </Button>
          <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-yellow-500 to-pink-500 bg-clip-text text-transparent text-center">Recompensas & Gamificação</h1>
          <p className="text-center text-muted-foreground mb-8 text-lg">Acompanhe seu progresso, conquiste badges e desafie-se a cuidar cada vez melhor do seu bebê!</p>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            </div>
          ) : gamification && (
            <>
              <Card className="mb-8 shadow-xl border-0 bg-white/90 dark:bg-gray-900/90">
                <CardContent className="flex flex-col md:flex-row items-center gap-8 py-8">
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-5xl font-extrabold text-yellow-500 flex items-center gap-2 animate-bounce-gentle">
                      <Star className="w-10 h-10 text-yellow-400 mr-2" /> Nível {gamification.level}
                    </div>
                    <div className="text-lg text-muted-foreground mt-1">Seu progresso</div>
                    <div className="w-full bg-gray-200 rounded-full h-4 mt-4 mb-2">
                      <div className={`h-4 rounded-full ${getGradientClass()}`} style={{ width: `${Math.min((gamification.points % 1000) / 10, 100)}%`, transition: 'width 1s' }}></div>
                    </div>
                    <div className="text-md text-gray-700 mt-1">{gamification.points} pontos</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-lg font-bold flex items-center gap-2 mb-2">
                      <TrendingUp className="w-6 h-6 text-green-500" /> Pontuação
                    </div>
                    <div className="text-3xl font-extrabold text-green-600">{gamification.points}</div>
                    <div className="mt-4 text-center">
                      <div className="text-md font-semibold mb-2 flex items-center gap-1"><Award className="w-5 h-5 text-yellow-500" /> Medalhas</div>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {gamification.badges.length > 0 ? gamification.badges.map((badge, i) => (
                          <span key={i} className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 rounded px-2 py-1 text-xs font-semibold border border-yellow-300 animate-fade-in">
                            <Award className="w-3 h-3 text-yellow-500" /> {badge}
                          </span>
                        )) : <span className="text-muted-foreground">Nenhuma medalha ainda</span>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-600">
                      <Flame className="w-6 h-6" /> Streaks
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-muted-foreground cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent>Streaks são sequências de dias em que você realiza uma ação (ex: registrar atividade todo dia).</TooltipContent>
                      </Tooltip>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4">
                      {Object.entries(gamification.streaks).length > 0 ? Object.entries(gamification.streaks).map(([key, value]) => (
                        <div key={key} className="flex flex-col items-center">
                          <span className="text-2xl font-bold text-orange-500 animate-pulse">{value}</span>
                          <span className="text-xs text-muted-foreground">{key}</span>
                        </div>
                      )) : <span className="text-muted-foreground">Nenhum streak ainda</span>}
                    </div>
                  </CardContent>
                </Card>
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-600">
                      <Trophy className="w-6 h-6" /> Conquistas
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-muted-foreground cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent>Conquistas são marcos especiais desbloqueados ao atingir objetivos importantes.</TooltipContent>
                      </Tooltip>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {gamification.achievements.length > 0 ? gamification.achievements.map((ach, i) => (
                        <span key={i} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 rounded px-2 py-1 text-xs font-semibold border border-blue-300 animate-fade-in">
                          <Trophy className="w-3 h-3 text-blue-500" /> {ach}
                        </span>
                      )) : <span className="text-muted-foreground">Nenhuma conquista ainda</span>}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="mb-8 shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-600">
                    <Users className="w-6 h-6" /> Ranking semanal
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 text-muted-foreground cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent>O ranking mostra os usuários com mais pontos na semana. Faça atividades para subir!</TooltipContent>
                    </Tooltip>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    {ranking.length > 0 ? ranking.map((user, i) => {
                      const isCurrentUser = (gamification && gamification.userId && user.userId === gamification.userId) || (i === 0 && !gamification?.userId);
                      return (
                        <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${isCurrentUser ? 'bg-purple-100 font-bold' : 'bg-gray-50'}`}>
                          <span className="text-lg font-bold w-6 text-center">{i + 1}º</span>
                          <span className="flex-1">{isCurrentUser ? 'Você' : (user.name || 'Usuário')}</span>
                          <span className="text-md text-purple-700">{user.points} pts</span>
                        </div>
                      );
                    }) : <span className="text-muted-foreground">Nenhum ranking disponível</span>}
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-8 shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-emerald-600"><Trophy className="w-6 h-6" /> Desafios da Semana</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {challenges.length > 0 ? challenges.map((challenge, i) => (
                      <div key={i} className={`p-4 rounded-lg transition-all duration-500 ${challenge.status === 'completed' ? 'bg-green-100 scale-95' : 'bg-emerald-100 hover:scale-105'} flex flex-col items-center animate-fade-in`}>
                        <span className="text-2xl font-bold text-emerald-600 mb-2">{challenge.name}</span>
                        <span className="text-sm text-muted-foreground mb-2">{challenge.description}</span>
                        <span className="text-sm text-gray-700 mb-2">Progresso: {challenge.progress || 0}/{challenge.goal}</span>
                        <span className="text-sm text-emerald-700 mb-2">Recompensa: {challenge.points} pontos{challenge.badge ? ` + medalha: ${challenge.badge}` : ''}</span>
                        {challenge.status === 'completed' ? (
                          <Button disabled className="bg-green-500 text-white mt-2 animate-bounce">Completado!</Button>
                        ) : (
                          <Button className="bg-emerald-500 text-white mt-2" onClick={() => { setSelectedChallenge(challenge); setShowChallengeModal(true); }}>Participar</Button>
                        )}
                      </div>
                    )) : <span className="text-muted-foreground">Nenhum desafio disponível</span>}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center mt-8">
                <Button className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-yellow-500 text-white px-8 py-3 rounded-lg shadow-lg text-lg font-semibold hover:scale-105 transition-all duration-200">
                  <Share2 className="w-5 h-5" /> Compartilhar minhas conquistas
                </Button>
              </div>
            </>
          )}
        </div>
        {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} numberOfPieces={300} recycle={false} />}
        {/* Modais */}
        <Dialog open={showAchievementModal} onOpenChange={setShowAchievementModal}>
          <DialogContent className="flex flex-col items-center justify-center gap-4 animate-fade-in animate-bounce-gentle">
            <div className="text-6xl">
              {achievementData?.type === 'badge' ? <Award className="text-yellow-500 w-16 h-16 animate-bounce" /> : <Trophy className="text-blue-500 w-16 h-16 animate-bounce" />}
            </div>
            <DialogTitle className="text-2xl font-bold text-center">Parabéns!</DialogTitle>
            <DialogDescription className="text-lg text-center">
              Você conquistou {achievementData?.type === 'badge' ? 'uma nova medalha' : 'uma nova conquista'}:<br />
              <span className="font-extrabold text-yellow-600 text-xl">{achievementData?.name}</span>
            </DialogDescription>
          </DialogContent>
        </Dialog>
        <Dialog open={showLevelUpModal} onOpenChange={setShowLevelUpModal}>
          <DialogContent className="flex flex-col items-center justify-center gap-4 animate-fade-in animate-bounce-gentle">
            <div className="text-6xl">
              <Star className="text-yellow-500 w-16 h-16 animate-bounce" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center">Você subiu de nível!</DialogTitle>
            <DialogDescription className="text-lg text-center">
              Agora você está no <span className="font-extrabold text-yellow-600 text-xl">Nível {gamification?.level}</span>!<br />Continue participando para desbloquear mais conquistas.
            </DialogDescription>
          </DialogContent>
        </Dialog>
        <Dialog open={showChallengeModal} onOpenChange={setShowChallengeModal}>
          <DialogContent className="flex flex-col items-center gap-4 animate-fade-in">
            <DialogTitle className="text-xl font-bold text-center">{selectedChallenge?.name}</DialogTitle>
            <DialogDescription className="text-center mb-2">{selectedChallenge?.description}</DialogDescription>
            <div className="text-md text-gray-700">Progresso: <span className="font-bold">{selectedChallenge?.progress || 0}/{selectedChallenge?.goal}</span></div>
            <div className="text-md text-emerald-700">Recompensa: <span className="font-bold">{selectedChallenge?.points} pontos</span>{selectedChallenge?.badge ? ` + medalha: ${selectedChallenge.badge}` : ''}</div>
            {selectedChallenge?.status === 'completed' ? (
              <Button disabled className="bg-green-500 text-white mt-2 animate-bounce">Completado!</Button>
            ) : (
              <Button className="bg-emerald-500 text-white mt-2" onClick={() => setShowChallengeModal(false)}>Fechar</Button>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default Rewards; 