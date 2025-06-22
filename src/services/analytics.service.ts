import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AnalyticsService {
  
  // Analytics de Usuário
  async getUserAnalytics(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          babies: true,
          activities: true,
          memories: true,
          milestones: true,
          gamification: true,
          subscription: {
            include: { plan: true }
          }
        }
      });

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Calcular métricas básicas
      const totalBabies = user.babies.length;
      const totalActivities = user.activities.length;
      const totalMemories = user.memories.length;
      const totalMilestones = user.milestones.length;
      const points = user.gamification?.points || 0;
      const level = user.gamification?.level || 1;

      // Calcular atividade recente (últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentActivities = user.activities.filter(
        activity => activity.createdAt >= thirtyDaysAgo
      ).length;

      const recentMemories = user.memories.filter(
        memory => memory.createdAt >= thirtyDaysAgo
      ).length;

      // Calcular frequência de uso
      const loginStreak = this.calculateLoginStreak(user.lastLoginAt);
      const activityStreak = this.calculateActivityStreak(user.activities);

      // Calcular score de retenção
      const retentionScore = this.calculateRetentionScore(
        recentActivities,
        recentMemories,
        loginStreak,
        activityStreak
      );

      // Calcular risco de churn
      const churnRisk = this.calculateChurnRisk(
        user.lastLoginAt,
        recentActivities,
        user.subscription?.status
      );

      // Atualizar analytics do usuário
      await prisma.userAnalytics.upsert({
        where: { userId },
        update: {
          loginCount: (user.lastLoginAt ? 1 : 0),
          lastLoginAt: user.lastLoginAt,
          sessionDuration: 0, // Seria calculado com tracking de sessão
          featuresUsed: this.getFeaturesUsed(user),
          retentionScore,
          churnRisk,
          updatedAt: new Date()
        },
        create: {
          userId,
          loginCount: (user.lastLoginAt ? 1 : 0),
          lastLoginAt: user.lastLoginAt,
          sessionDuration: 0,
          featuresUsed: this.getFeaturesUsed(user),
          retentionScore,
          churnRisk
        }
      });

      return {
        overview: {
          totalBabies,
          totalActivities,
          totalMemories,
          totalMilestones,
          points,
          level
        },
        recentActivity: {
          activitiesLast30Days: recentActivities,
          memoriesLast30Days: recentMemories,
          loginStreak,
          activityStreak
        },
        engagement: {
          retentionScore: Math.round(retentionScore * 100) / 100,
          churnRisk: Math.round(churnRisk * 100) / 100,
          engagementLevel: this.getEngagementLevel(retentionScore)
        },
        subscription: {
          plan: user.subscription?.plan.name || 'Gratuito',
          status: user.subscription?.status || 'none',
          nextBilling: user.subscription?.currentPeriodEnd
        }
      };
    } catch (error) {
      console.error('Erro ao calcular analytics do usuário:', error);
      throw new Error('Não foi possível calcular analytics');
    }
  }

  // Analytics do Sistema (para admins)
  async getSystemAnalytics(startDate?: Date, endDate?: Date) {
    try {
      const start = startDate || new Date();
      start.setDate(start.getDate() - 30);
      const end = endDate || new Date();

      // Métricas de usuários
      const totalUsers = await prisma.user.count();
      const newUsers = await prisma.user.count({
        where: {
          createdAt: { gte: start, lte: end }
        }
      });

      const activeUsers = await prisma.user.count({
        where: {
          lastLoginAt: { gte: start, lte: end }
        }
      });

      // Métricas de assinaturas
      const totalSubscriptions = await prisma.subscription.count({
        where: { status: 'active' }
      });

      const newSubscriptions = await prisma.subscription.count({
        where: {
          status: 'active',
          createdAt: { gte: start, lte: end }
        }
      });

      const canceledSubscriptions = await prisma.subscription.count({
        where: {
          status: 'canceled',
          updatedAt: { gte: start, lte: end }
        }
      });

      // Métricas de conteúdo
      const totalActivities = await prisma.activity.count({
        where: {
          createdAt: { gte: start, lte: end }
        }
      });

      const totalMemories = await prisma.memory.count({
        where: {
          createdAt: { gte: start, lte: end }
        }
      });

      const totalMilestones = await prisma.milestone.count({
        where: {
          createdAt: { gte: start, lte: end }
        }
      });

      // Calcular receita (estimativa baseada em planos)
      const revenue = await this.calculateRevenue(start, end);

      // Calcular métricas de retenção
      const retentionRate = await this.calculateSystemRetentionRate(start, end);

      // Salvar métricas do sistema
      await this.saveSystemMetrics({
        date: new Date(),
        metrics: {
          totalUsers,
          newUsers,
          activeUsers,
          totalSubscriptions,
          newSubscriptions,
          canceledSubscriptions,
          totalActivities,
          totalMemories,
          totalMilestones,
          revenue,
          retentionRate
        }
      });

      return {
        users: {
          total: totalUsers,
          new: newUsers,
          active: activeUsers,
          retentionRate: Math.round(retentionRate * 100) / 100
        },
        subscriptions: {
          total: totalSubscriptions,
          new: newSubscriptions,
          canceled: canceledSubscriptions,
          churnRate: totalSubscriptions > 0 ? 
            Math.round((canceledSubscriptions / totalSubscriptions) * 100) / 100 : 0
        },
        content: {
          activities: totalActivities,
          memories: totalMemories,
          milestones: totalMilestones
        },
        revenue: {
          total: revenue,
          period: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
        }
      };
    } catch (error) {
      console.error('Erro ao calcular analytics do sistema:', error);
      throw new Error('Não foi possível calcular analytics do sistema');
    }
  }

  // Analytics de Gamificação
  async getGamificationAnalytics() {
    try {
      const gamificationData = await prisma.gamification.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      const totalUsers = gamificationData.length;
      const averagePoints = gamificationData.reduce((sum, g) => sum + g.points, 0) / totalUsers;
      const averageLevel = gamificationData.reduce((sum, g) => sum + g.level, 0) / totalUsers;

      // Top usuários
      const topUsers = gamificationData
        .sort((a, b) => b.points - a.points)
        .slice(0, 10)
        .map(g => ({
          name: g.user.name || 'Usuário',
          points: g.points,
          level: g.level
        }));

      // Distribuição de níveis
      const levelDistribution = this.calculateLevelDistribution(gamificationData);

      // Badges mais comuns
      const badgeStats = this.calculateBadgeStats(gamificationData);

      return {
        overview: {
          totalUsers,
          averagePoints: Math.round(averagePoints),
          averageLevel: Math.round(averageLevel)
        },
        topUsers,
        levelDistribution,
        badgeStats
      };
    } catch (error) {
      console.error('Erro ao calcular analytics de gamificação:', error);
      throw new Error('Não foi possível calcular analytics de gamificação');
    }
  }

  // Analytics de IA
  async getAIAnalytics() {
    try {
      const aiInteractions = await prisma.aIInteraction.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      const totalInteractions = aiInteractions.length;
      const totalTokens = aiInteractions.reduce((sum, i) => sum + (i.tokensUsed || 0), 0);
      const averageTokens = totalInteractions > 0 ? totalTokens / totalInteractions : 0;

      // Uso por tipo
      const usageByType = aiInteractions.reduce((acc, interaction) => {
        acc[interaction.type] = (acc[interaction.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Usuários mais ativos com IA
      const userUsage = aiInteractions.reduce((acc, interaction) => {
        acc[interaction.userId] = (acc[interaction.userId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topAIUsers = Object.entries(userUsage)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([userId, count]) => {
          const user = aiInteractions.find(i => i.userId === userId)?.user;
          return {
            name: user?.name || 'Usuário',
            interactions: count
          };
        });

      return {
        overview: {
          totalInteractions,
          totalTokens,
          averageTokens: Math.round(averageTokens)
        },
        usageByType,
        topUsers: topAIUsers
      };
    } catch (error) {
      console.error('Erro ao calcular analytics de IA:', error);
      throw new Error('Não foi possível calcular analytics de IA');
    }
  }

  // Métodos auxiliares
  private calculateLoginStreak(lastLoginAt: Date | null): number {
    if (!lastLoginAt) return 0;
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastLoginAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 1 ? 1 : 0; // Simplificado - seria mais complexo com tracking real
  }

  private calculateActivityStreak(activities: any[]): number {
    if (activities.length === 0) return 0;

    const sortedActivities = activities
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    let streak = 0;
    const now = new Date();
    
    for (let i = 0; i < sortedActivities.length; i++) {
      const activityDate = new Date(sortedActivities[i].createdAt);
      const diffDays = Math.ceil((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  private calculateRetentionScore(
    recentActivities: number,
    recentMemories: number,
    loginStreak: number,
    activityStreak: number
  ): number {
    const activityScore = Math.min(recentActivities / 10, 1) * 0.3;
    const memoryScore = Math.min(recentMemories / 5, 1) * 0.2;
    const loginScore = Math.min(loginStreak / 7, 1) * 0.3;
    const streakScore = Math.min(activityStreak / 7, 1) * 0.2;

    return activityScore + memoryScore + loginScore + streakScore;
  }

  private calculateChurnRisk(
    lastLoginAt: Date | null,
    recentActivities: number,
    subscriptionStatus?: string
  ): number {
    let risk = 0;

    // Risco baseado no último login
    if (!lastLoginAt) {
      risk += 0.5;
    } else {
      const daysSinceLogin = Math.ceil((new Date().getTime() - lastLoginAt.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceLogin > 30) risk += 0.4;
      else if (daysSinceLogin > 7) risk += 0.2;
    }

    // Risco baseado na atividade recente
    if (recentActivities === 0) risk += 0.3;
    else if (recentActivities < 3) risk += 0.1;

    // Risco baseado no status da assinatura
    if (subscriptionStatus === 'past_due') risk += 0.2;
    else if (subscriptionStatus === 'canceled') risk += 0.5;

    return Math.min(risk, 1);
  }

  private getEngagementLevel(retentionScore: number): string {
    if (retentionScore >= 0.8) return 'Alto';
    if (retentionScore >= 0.5) return 'Médio';
    return 'Baixo';
  }

  private getFeaturesUsed(user: any): string[] {
    const features = [];
    
    if (user.babies.length > 0) features.push('babies');
    if (user.activities.length > 0) features.push('activities');
    if (user.memories.length > 0) features.push('memories');
    if (user.milestones.length > 0) features.push('milestones');
    if (user.gamification) features.push('gamification');
    if (user.subscription) features.push('subscription');

    return features;
  }

  private async calculateRevenue(startDate: Date, endDate: Date): Promise<number> {
    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: 'active',
        createdAt: { gte: startDate, lte: endDate }
      },
      include: { plan: true }
    });

    return subscriptions.reduce((total, sub) => total + sub.plan.price, 0);
  }

  private async calculateSystemRetentionRate(startDate: Date, endDate: Date): Promise<number> {
    const totalUsers = await prisma.user.count({
      where: { createdAt: { lt: startDate } }
    });

    if (totalUsers === 0) return 0;

    const activeUsers = await prisma.user.count({
      where: {
        createdAt: { lt: startDate },
        lastLoginAt: { gte: startDate, lte: endDate }
      }
    });

    return activeUsers / totalUsers;
  }

  private async saveSystemMetrics(data: { date: Date; metrics: any }) {
    try {
      await prisma.systemAnalytics.create({
        data: {
          date: data.date,
          metric: 'daily_summary',
          value: 1,
          metadata: data.metrics
        }
      });
    } catch (error) {
      console.error('Erro ao salvar métricas do sistema:', error);
    }
  }

  private calculateLevelDistribution(gamificationData: any[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    gamificationData.forEach(g => {
      const level = g.level.toString();
      distribution[level] = (distribution[level] || 0) + 1;
    });

    return distribution;
  }

  private calculateBadgeStats(gamificationData: any[]): Record<string, number> {
    const badgeStats: Record<string, number> = {};
    
    gamificationData.forEach(g => {
      const badges = Array.isArray(g.badges) ? g.badges : [];
      badges.forEach((badge: any) => {
        const badgeName = badge.name || badge;
        badgeStats[badgeName] = (badgeStats[badgeName] || 0) + 1;
      });
    });

    return badgeStats;
  }
}

export default new AnalyticsService(); 