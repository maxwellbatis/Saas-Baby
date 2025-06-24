import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Heart, Target, Zap, Baby, Coffee, Flower, Crown, Star } from 'lucide-react';

export interface AIReward {
  id: string;
  title: string;
  description: string;
  type: 'tip' | 'activity' | 'milestone' | 'encouragement';
  content: string;
  tips?: string[];
  activities?: string[];
  isUnlocked: boolean;
  unlockedAt?: string;
}

interface AIRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  reward: AIReward | null;
}

const rewardIcons: Record<string, React.ReactNode> = {
  tip: <Sparkles className="w-6 h-6" />,
  activity: <Zap className="w-6 h-6" />,
  milestone: <Target className="w-6 h-6" />,
  encouragement: <Heart className="w-6 h-6" />,
};

const rewardColors: Record<string, string> = {
  tip: 'bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-200 text-blue-800',
  activity: 'bg-gradient-to-br from-green-100 to-emerald-100 border-green-200 text-green-800',
  milestone: 'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-200 text-purple-800',
  encouragement: 'bg-gradient-to-br from-pink-100 to-rose-100 border-pink-200 text-pink-800',
};

const rewardTypeNames: Record<string, string> = {
  tip: 'Dica Especial',
  activity: 'Atividade Personalizada',
  milestone: 'Previsão de Marcos',
  encouragement: 'Mensagem de Apoio',
};

export const AIRewardModal: React.FC<AIRewardModalProps> = ({
  isOpen,
  onClose,
  reward
}) => {
  if (!reward) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${rewardColors[reward.type]}`}>
              {rewardIcons[reward.type]}
            </div>
            <div>
              <p className="text-lg font-bold">{reward.title}</p>
              <p className="text-sm text-muted-foreground">{rewardTypeNames[reward.type]}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Descrição */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700">{reward.description}</p>
          </div>

          {/* Conteúdo Principal */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800">✨ Sua Recompensa Especial</h4>
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
              <p className="text-gray-800 leading-relaxed">{reward.content}</p>
            </div>
          </div>

          {/* Dicas Adicionais */}
          {reward.tips && reward.tips.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Dicas Extras
              </h4>
              <div className="space-y-2">
                {reward.tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                    <Star className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Atividades Sugeridas */}
          {reward.activities && reward.activities.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Atividades Sugeridas
              </h4>
              <div className="space-y-2">
                {reward.activities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                    <Target className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-green-800">{activity}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Badge de Conquista */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 text-center">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mb-3">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <p className="font-semibold text-purple-800">Recompensa Desbloqueada!</p>
            <p className="text-sm text-purple-600 mt-1">
              {reward.unlockedAt 
                ? `Desbloqueada em ${new Date(reward.unlockedAt).toLocaleDateString('pt-BR')}`
                : 'Parabéns por conquistar esta recompensa!'
              }
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-2">
            <Button 
              onClick={onClose}
              className="flex-1"
            >
              Entendi!
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                // Implementar compartilhamento da recompensa
                console.log('Compartilhar recompensa:', reward.id);
              }}
            >
              <Heart className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 