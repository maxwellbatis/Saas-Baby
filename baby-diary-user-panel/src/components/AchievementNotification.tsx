import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Target, Zap, Heart, Camera, BookOpen, Crown, Sparkles } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  type: 'badge' | 'level' | 'streak' | 'challenge' | 'ai_reward';
}

interface AchievementNotificationProps {
  achievement: Achievement | null;
  isVisible: boolean;
  onClose: () => void;
}

const achievementIcons: Record<string, React.ReactNode> = {
  'first-memory': <Camera className="w-6 h-6" />,
  'week-streak': <Star className="w-6 h-6" />,
  'milestone-master': <Target className="w-6 h-6" />,
  'super-mom': <Heart className="w-6 h-6" />,
  'memory-keeper': <BookOpen className="w-6 h-6" />,
  'activity-champion': <Zap className="w-6 h-6" />,
  'consistency-queen': <Crown className="w-6 h-6" />,
  'baby-whisperer': <Heart className="w-6 h-6" />,
  'self-care-warrior': <Heart className="w-6 h-6" />,
  'growth-observer': <Target className="w-6 h-6" />,
  'level-up': <Trophy className="w-6 h-6" />,
  'streak-milestone': <Star className="w-6 h-6" />,
  'challenge-complete': <Target className="w-6 h-6" />,
  'ai-reward': <Sparkles className="w-6 h-6" />,
};

const achievementColors: Record<string, string> = {
  badge: 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-300',
  level: 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-300',
  streak: 'bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-300',
  challenge: 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-300',
  ai_reward: 'bg-gradient-to-r from-pink-100 to-rose-100 border-pink-300',
};

const achievementMessages: Record<string, string> = {
  badge: '🎉 Nova Conquista!',
  level: '🌟 Subiu de Nível!',
  streak: '🔥 Streak Incrível!',
  challenge: '✅ Desafio Completo!',
  ai_reward: '✨ Recompensa da IA!',
};

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  isVisible,
  onClose
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isVisible && achievement) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, achievement, onClose]);

  if (!isVisible || !achievement) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 animate-bounce">🎉</div>
          <div className="absolute top-2 right-1/4 animate-bounce" style={{ animationDelay: '0.2s' }}>✨</div>
          <div className="absolute bottom-0 left-1/2 animate-bounce" style={{ animationDelay: '0.4s' }}>🌟</div>
          <div className="absolute bottom-2 right-0 animate-bounce" style={{ animationDelay: '0.6s' }}>💖</div>
          <div className="absolute top-1/2 left-0 animate-bounce" style={{ animationDelay: '0.8s' }}>🎊</div>
        </div>
      )}

      <Card className={`${achievementColors[achievement.type]} border-2 shadow-xl max-w-sm`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
              {achievementIcons[achievement.icon] || <Trophy className="w-6 h-6" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="bg-yellow-200 text-yellow-800 border-yellow-300 text-xs">
                  {achievementMessages[achievement.type]}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  +{achievement.points} pts
                </Badge>
              </div>
              
              <h4 className="font-bold text-gray-800 text-sm mb-1">
                {achievement.title}
              </h4>
              
              <p className="text-gray-600 text-xs leading-relaxed">
                {achievement.description}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Bar Animation */}
          <div className="mt-3 bg-white/50 rounded-full h-1 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full rounded-full animate-progress" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// CSS animations (add to your global CSS)
const styles = `
  @keyframes slide-in-right {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes progress {
    from {
      width: 0%;
    }
    to {
      width: 100%;
    }
  }

  .animate-slide-in-right {
    animation: slide-in-right 0.5s ease-out;
  }

  .animate-progress {
    animation: progress 5s linear;
  }
`;

// Add styles to document head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
} 