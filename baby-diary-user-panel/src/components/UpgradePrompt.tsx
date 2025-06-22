import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Sparkles, 
  Star, 
  Heart, 
  Baby, 
  Zap, 
  Shield, 
  ArrowRight,
  Crown,
  Gift
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { createCheckoutSession } from '@/lib/api';

interface UpgradePromptProps {
  title: string;
  description: string;
  feature?: string;
  limit?: string;
  className?: string;
  variant?: 'default' | 'premium' | 'family';
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  title,
  description,
  feature,
  limit,
  className = '',
  variant = 'default'
}) => {
  const { getGradientClass } = useTheme();
  const { userPlan } = useAuth();
  const { toast } = useToast();

  const handleUpgrade = async () => {
    try {
      // Determinar qual plano sugerir baseado no contexto
      let suggestedPlanId = '';
      
      if (variant === 'family') {
        suggestedPlanId = 'cmc6qyty600023zsvw8v5fpmg'; // Família
      } else {
        suggestedPlanId = 'cmc6qyty900033zsv7oawnmzm'; // Premium
      }

      const successUrl = `${window.location.origin}/dashboard?subscription=success`;
      const cancelUrl = window.location.href;

      const response = await createCheckoutSession({ 
        planId: suggestedPlanId, 
        successUrl, 
        cancelUrl 
      });

      if (response.success && response.data.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error(response.error || 'Não foi possível iniciar o checkout.');
      }
    } catch (error: any) {
      toast({
        title: "Erro ao iniciar upgrade",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const getVariantConfig = () => {
    switch (variant) {
      case 'premium':
        return {
          icon: <Crown className="w-6 h-6 text-yellow-500" />,
          gradient: 'from-yellow-400 to-orange-500',
          badge: 'Premium 👑',
          features: [
            'Memórias ilimitadas',
            'Marcos ilimitados',
            'Atividades ilimitadas',
            'IA ilimitada',
            'Suporte prioritário'
          ]
        };
      case 'family':
        return {
          icon: <Heart className="w-6 h-6 text-pink-500" />,
          gradient: 'from-pink-400 to-rose-500',
          badge: 'Família 👨‍👩‍👧‍👦',
          features: [
            'Até 10 bebês',
            'Compartilhamento familiar',
            'Todas as features Premium',
            'Controle parental',
            'Backup automático'
          ]
        };
      default:
        return {
          icon: <Star className="w-6 h-6 text-blue-500" />,
          gradient: 'from-blue-400 to-cyan-500',
          badge: 'Premium 👑',
          features: [
            'Memórias ilimitadas',
            'Marcos ilimitados',
            'Atividades ilimitadas',
            'IA ilimitada',
            'Suporte prioritário'
          ]
        };
    }
  };

  const config = getVariantConfig();

  return (
    <Card className={`glass-card border-0 shadow-xl overflow-hidden ${className}`}>
      <div className={`bg-gradient-to-r ${config.gradient} p-1`}>
        <CardContent className="bg-white rounded-lg p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              {config.icon}
            </div>
            <Badge className={`mb-2 bg-gradient-to-r ${config.gradient} text-white border-0`}>
              {config.badge}
            </Badge>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {title}
            </h3>
            <p className="text-gray-600 text-sm">
              {description}
            </p>
          </div>

          {/* Limite atual */}
          {limit && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Limite atual: <strong>{limit}</strong>
                </span>
                <Zap className="w-4 h-4 text-yellow-500" />
              </div>
            </div>
          )}

          {/* Features do upgrade */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              O que você ganha:
            </h4>
            <ul className="space-y-2">
              {config.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <Button 
              onClick={handleUpgrade}
              className={`w-full font-bold bg-gradient-to-r ${config.gradient} text-white border-0 hover:opacity-90 transition-all duration-200`}
            >
              <Gift className="w-4 h-4 mr-2" />
              Fazer Upgrade Agora
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <p className="text-xs text-center text-gray-500">
              ✨ Cancele quando quiser, sem burocracia
            </p>
          </div>

          {/* Dica motivacional */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <Baby className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700">
                <strong>Dica:</strong> Cada momento com seu bebê é único! 
                Não perca nenhuma memória especial por causa de limites.
              </p>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default UpgradePrompt; 