import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { 
  Award, 
  Lock, 
  Baby, 
  Heart, 
  Star, 
  Trophy, 
  Flame, 
  Target, 
  Users, 
  Camera, 
  Calendar, 
  BookOpen,
  Share2,
  Info
} from 'lucide-react';

interface BadgeCollectionProps {
  unlockedBadges: string[];
  onBadgeClick?: (badgeId: string) => void;
}

interface BadgeInfo {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirements: string;
  color: string;
  bgColor: string;
}

const allBadges: BadgeInfo[] = [
  {
    id: 'first-memory',
    name: 'Primeira Memória',
    description: 'Registrou sua primeira memória especial',
    icon: Camera,
    category: 'Memórias',
    rarity: 'common',
    requirements: 'Registrar 1 memória',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    id: 'memory-master',
    name: 'Mestre das Memórias',
    description: 'Registrou 50 memórias preciosas',
    icon: Camera,
    category: 'Memórias',
    rarity: 'rare',
    requirements: 'Registrar 50 memórias',
    color: 'text-blue-700',
    bgColor: 'bg-blue-200'
  },
  {
    id: 'week-streak',
    name: 'Semana Consistente',
    description: 'Usou o app por 7 dias seguidos',
    icon: Calendar,
    category: 'Consistência',
    rarity: 'common',
    requirements: '7 dias de uso consecutivo',
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  {
    id: 'month-streak',
    name: 'Mês Dedicado',
    description: 'Usou o app por 30 dias seguidos',
    icon: Calendar,
    category: 'Consistência',
    rarity: 'rare',
    requirements: '30 dias de uso consecutivo',
    color: 'text-green-700',
    bgColor: 'bg-green-200'
  },
  {
    id: 'milestone-master',
    name: 'Mestre dos Marcos',
    description: 'Registrou 10 marcos do desenvolvimento',
    icon: Target,
    category: 'Marcos',
    rarity: 'rare',
    requirements: 'Registrar 10 marcos',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  {
    id: 'milestone-legend',
    name: 'Lenda dos Marcos',
    description: 'Registrou 25 marcos do desenvolvimento',
    icon: Target,
    category: 'Marcos',
    rarity: 'epic',
    requirements: 'Registrar 25 marcos',
    color: 'text-purple-700',
    bgColor: 'bg-purple-200'
  },
  {
    id: 'consistency-queen',
    name: 'Rainha da Consistência',
    description: 'Manteve consistência por 3 meses',
    icon: Trophy,
    category: 'Consistência',
    rarity: 'epic',
    requirements: '3 meses de uso consistente',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100'
  },
  {
    id: 'baby-whisperer',
    name: 'Sussurradora de Bebês',
    description: 'Registrou atividades por 100 dias',
    icon: Baby,
    category: 'Atividades',
    rarity: 'epic',
    requirements: '100 dias de atividades',
    color: 'text-pink-600',
    bgColor: 'bg-pink-100'
  },
  {
    id: 'heart-warrior',
    name: 'Guerreira do Coração',
    description: 'Completou todos os desafios de uma semana',
    icon: Heart,
    category: 'Desafios',
    rarity: 'legendary',
    requirements: 'Completar todos os desafios semanais',
    color: 'text-red-600',
    bgColor: 'bg-red-100'
  },
  {
    id: 'star-collector',
    name: 'Colecionadora de Estrelas',
    description: 'Conquistou 20 badges diferentes',
    icon: Star,
    category: 'Conquistas',
    rarity: 'legendary',
    requirements: '20 badges únicos',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100'
  }
];

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'border-gray-300 text-gray-600';
    case 'rare': return 'border-blue-300 text-blue-600';
    case 'epic': return 'border-purple-300 text-purple-600';
    case 'legendary': return 'border-yellow-300 text-yellow-600';
    default: return 'border-gray-300 text-gray-600';
  }
};

const getRarityLabel = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'Comum';
    case 'rare': return 'Raro';
    case 'epic': return 'Épico';
    case 'legendary': return 'Lendário';
    default: return 'Comum';
  }
};

export const BadgeCollection: React.FC<BadgeCollectionProps> = ({ 
  unlockedBadges, 
  onBadgeClick 
}) => {
  const [selectedBadge, setSelectedBadge] = useState<BadgeInfo | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleBadgeClick = (badge: BadgeInfo) => {
    setSelectedBadge(badge);
    setShowModal(true);
    onBadgeClick?.(badge.id);
  };

  const handleShareBadge = (badge: BadgeInfo) => {
    const message = `Acabei de conquistar o badge "${badge.name}" no Baby Diary! 🏆👶 #BabyDiary #Conquista`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Conquista no Baby Diary',
        text: message,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(message);
      // Você pode adicionar um toast aqui se quiser
    }
  };

  const categories = ['Todos', 'Memórias', 'Consistência', 'Marcos', 'Atividades', 'Desafios', 'Conquistas'];
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const filteredBadges = selectedCategory === 'Todos' 
    ? allBadges 
    : allBadges.filter(badge => badge.category === selectedCategory);

  return (
    <TooltipProvider>
      <Card className="shadow-lg border-0 bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-indigo-600 text-lg sm:text-xl">
            <Award className="w-5 h-5 sm:w-6 sm:h-6" /> Coleção de Badges
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent>Colecione badges completando objetivos e desafios!</TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {/* Filtros de Categoria - Mobile Otimizado */}
          <div className="mb-4 sm:mb-6">
            <div className="text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-3">Filtrar por categoria:</div>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={`text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 h-auto ${
                    selectedCategory === category 
                      ? 'bg-indigo-500 text-white' 
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Grid de Badges - Mobile Otimizado */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
            {filteredBadges.map((badge) => {
              const isUnlocked = unlockedBadges.includes(badge.id);
              const Icon = badge.icon;
              
              return (
                <Tooltip key={badge.id}>
                  <TooltipTrigger asChild>
                    <div
                      className={`relative p-2 sm:p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                        isUnlocked 
                          ? 'bg-white border-2 border-indigo-300 hover:shadow-lg hover:scale-105' 
                          : 'bg-gray-100 border-2 border-gray-300 opacity-60'
                      }`}
                      onClick={() => handleBadgeClick(badge)}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-1 sm:mb-2 ${
                          isUnlocked ? badge.bgColor : 'bg-gray-300'
                        }`}>
                          {isUnlocked ? (
                            <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${badge.color}`} />
                          ) : (
                            <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                          )}
                        </div>
                        
                        <h4 className={`font-bold text-xs sm:text-sm mb-1 ${
                          isUnlocked ? 'text-gray-800' : 'text-gray-500'
                        }`}>
                          {badge.name}
                        </h4>
                        
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getRarityColor(badge.rarity)}`}
                        >
                          {getRarityLabel(badge.rarity)}
                        </Badge>
                        
                        {!isUnlocked && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <div className="text-center">
                      <p className="font-semibold text-sm">{badge.name}</p>
                      <p className="text-xs text-gray-600 mt-1">{badge.description}</p>
                      {!isUnlocked && (
                        <p className="text-xs text-orange-600 mt-1">
                          Requer: {badge.requirements}
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          {/* Estatísticas - Mobile Otimizado */}
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-white rounded-lg border border-indigo-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
              <div className="text-center sm:text-left">
                <p className="text-sm sm:text-base font-semibold text-gray-800">
                  Progresso da Coleção
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  {unlockedBadges.length} de {allBadges.length} badges conquistados
                </p>
              </div>
              <div className="w-full sm:w-32 bg-gray-200 rounded-full h-2 sm:h-3">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 sm:h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(unlockedBadges.length / allBadges.length) * 100}%` }}
                />
              </div>
              <div className="text-center sm:text-right">
                <p className="text-lg sm:text-xl font-bold text-indigo-600">
                  {Math.round((unlockedBadges.length / allBadges.length) * 100)}%
                </p>
                <p className="text-xs text-gray-600">Completo</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalhes do Badge - Mobile Otimizado */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto mx-4">
          {selectedBadge && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
                    unlockedBadges.includes(selectedBadge.id) ? selectedBadge.bgColor : 'bg-gray-300'
                  }`}>
                    {unlockedBadges.includes(selectedBadge.id) ? (
                      <selectedBadge.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${selectedBadge.color}`} />
                    ) : (
                      <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-base sm:text-lg font-bold">{selectedBadge.name}</p>
                    <Badge variant="outline" className={`text-xs ${getRarityColor(selectedBadge.rarity)}`}>
                      {getRarityLabel(selectedBadge.rarity)}
                    </Badge>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-3 sm:space-y-4">
                <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 text-sm sm:text-base">{selectedBadge.description}</p>
                </div>

                <div className="p-3 sm:p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">📋 Categoria</h4>
                  <p className="text-gray-700 text-sm sm:text-base">{selectedBadge.category}</p>
                </div>

                {unlockedBadges.includes(selectedBadge.id) ? (
                  <div className="p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                      <Award className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <p className="font-semibold text-green-800 text-sm sm:text-base">Badge Conquistado!</p>
                    <p className="text-xs sm:text-sm text-green-600 mt-1">
                      Parabéns por esta conquista incrível!
                    </p>
                  </div>
                ) : (
                  <div className="p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                    <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">🎯 Como Conquistar</h4>
                    <p className="text-gray-700 text-sm sm:text-base">{selectedBadge.requirements}</p>
                    <p className="text-xs sm:text-sm text-orange-600 mt-2">
                      Continue usando o app para desbloquear este badge!
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    onClick={() => setShowModal(false)} 
                    className="flex-1"
                  >
                    Fechar
                  </Button>
                  {unlockedBadges.includes(selectedBadge.id) && (
                    <Button 
                      variant="outline"
                      onClick={() => handleShareBadge(selectedBadge)}
                      className="flex-1 sm:flex-none"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Compartilhar
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}; 