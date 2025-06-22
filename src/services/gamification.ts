import { GamificationRule, Gamification } from '@/types';

export interface GamificationResult {
  points: number;
  level: number;
  badges: string[];
  newBadges: string[];
}

export class GamificationService {
  /**
   * Calcula o nível baseado nos pontos
   */
  static calculateLevel(points: number): number {
    // Fórmula: nível = floor(pontos / 100) + 1
    return Math.floor(points / 100) + 1;
  }

  /**
   * Verifica se o usuário conquistou um novo badge
   */
  static checkBadgeEligibility(
    currentBadges: string[],
    points: number,
    level: number,
    streakDays: number = 0
  ): string[] {
    const newBadges: string[] = [];
    const allBadges = [
      { id: 'first_login', condition: () => true },
      { id: 'level_5', condition: () => level >= 5 },
      { id: 'level_10', condition: () => level >= 10 },
      { id: 'points_500', condition: () => points >= 500 },
      { id: 'points_1000', condition: () => points >= 1000 },
      { id: 'streak_7', condition: () => streakDays >= 7 },
      { id: 'streak_30', condition: () => streakDays >= 30 },
    ];

    for (const badge of allBadges) {
      if (!currentBadges.includes(badge.id) && badge.condition()) {
        newBadges.push(badge.id);
      }
    }

    return newBadges;
  }

  /**
   * Aplica uma regra de gamificação
   */
  static applyRule(
    currentGamification: Gamification,
    rule: GamificationRule
  ): GamificationResult {
    const newPoints = currentGamification.points + rule.points;
    const newLevel = this.calculateLevel(newPoints);
    
    // Converter badges para array de strings (IDs)
    const currentBadges = Array.isArray(currentGamification.badges) 
      ? currentGamification.badges.map((badge: any) => typeof badge === 'string' ? badge : badge.id)
      : [];
      
    const newBadges = this.checkBadgeEligibility(
      currentBadges,
      newPoints,
      newLevel
    );

    const allBadges = [...currentBadges, ...newBadges];

    return {
      points: newPoints,
      level: newLevel,
      badges: allBadges,
      newBadges,
    };
  }

  /**
   * Calcula pontos por atividade
   */
  static calculateActivityPoints(activityType: string): number {
    const pointsMap: Record<string, number> = {
      login: 5,
      register: 50,
      baby_added: 25,
      memory_created: 10,
      milestone_achieved: 30,
      photo_uploaded: 15,
      streak_day: 2,
    };

    return pointsMap[activityType] || 0;
  }

  /**
   * Verifica se o usuário tem streak ativo
   */
  static checkStreak(lastLoginDate: Date, currentDate: Date = new Date()): number {
    const diffTime = currentDate.getTime() - lastLoginDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Se passou mais de 1 dia, quebra o streak
    if (diffDays > 1) {
      return 0;
    }
    
    // Se é o mesmo dia, mantém o streak atual
    if (diffDays === 0) {
      return 1; // Streak mínimo
    }
    
    // Se é o dia seguinte, incrementa o streak
    return 1;
  }
} 