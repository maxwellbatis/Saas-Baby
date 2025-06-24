// Tipos base para o sistema
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de usuário
export interface User extends BaseEntity {
  email: string;
  name?: string;
  password: string;
  avatarUrl?: string;
  isActive: boolean;
  emailVerified: boolean;
  planId?: string;
  plan?: Plan;
  subscription?: Subscription;
  gamification?: Gamification;
}

export interface Admin extends BaseEntity {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'super_admin';
  isActive: boolean;
}

// Tipos de planos e assinaturas
export interface Plan extends BaseEntity {
  name: string;
  price: number;
  yearlyPrice?: number;
  features: string[];
  userLimit: number;
  memoryLimit?: number;
  photoQuality: 'low' | 'high';
  familySharing: number;
  exportFeatures: boolean;
  prioritySupport: boolean;
  stripePriceId: string;
  stripeYearlyPriceId?: string;
  isActive: boolean;
}

export interface Subscription extends BaseEntity {
  userId: string;
  user: User;
  planId: string;
  plan: Plan;
  stripeSubscriptionId: string;
  stripeCustomerId?: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
}

// Tipos de gamificação
export interface GamificationRule extends BaseEntity {
  name: string;
  description: string;
  points: number;
  condition: string;
  badgeIcon?: string;
  category: string; // daily, milestone, special, weekly_challenge
  isActive: boolean;
  sortOrder: number;
}

export interface Gamification extends BaseEntity {
  userId: string;
  user: User;
  points: number;
  level: number;
  badges: Badge[];
  streaks: Record<string, number>;
  achievements: string[];
  // Novos campos
  totalActivities: number;
  totalMemories: number;
  totalMilestones: number;
  lastLoginDate?: Date;
  dailyGoal: number;
  dailyProgress: number;
  weeklyChallenges: WeeklyChallenge[];
  aiRewards: AIReward[];
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  earnedAt: Date;
}

// Novos tipos para gamificação avançada
export interface WeeklyChallenge extends BaseEntity {
  title: string;
  description: string;
  icon: string;
  category: string; // sleep, memory, activity, consistency
  goal: number;
  reward: string;
  points: number;
  isActive: boolean;
  weekStart: Date;
  weekEnd: Date;
}

export interface AIReward extends BaseEntity {
  title: string;
  description: string;
  type: 'tip' | 'activity' | 'milestone' | 'encouragement';
  content?: string;
  tips?: string[];
  activities?: string[];
  isActive: boolean;
  unlockCondition: string;
  sortOrder: number;
}

export interface UserAIReward extends BaseEntity {
  userId: string;
  user: User;
  rewardId: string;
  reward: AIReward;
  isUnlocked: boolean;
  unlockedAt?: Date;
}

export interface GamificationRanking extends BaseEntity {
  userId: string;
  user: User;
  week: number;
  year: number;
  points: number;
  rank?: number;
}

// Tipos para respostas da API de gamificação
export interface GamificationResponse {
  gamification: Gamification;
  weeklyChallenges: WeeklyChallenge[];
  aiRewards: AIReward[];
  ranking: GamificationRanking[];
  newBadges: string[];
  levelUp: boolean;
  // Novos dados para sistema de resgate manual
  shopItems: ShopItem[];
  dailyMissions: UserMission[];
  activeEvents: UserEvent[];
  userPurchases: UserPurchase[];
}

export interface ChallengeProgress {
  challengeId: string;
  progress: number;
  goal: number;
  isCompleted: boolean;
  reward: string;
}

// Tipos de landing page
export interface LandingPageContent {
  id: number;
  heroTitle: string;
  heroSubtitle: string;
  heroImage?: string;
  features: Feature[];
  testimonials: Testimonial[];
  faq: FAQ[];
  stats: Stat[];
  ctaText?: string;
  ctaButtonText?: string;
  updatedAt: Date;
}

export interface Feature {
  title: string;
  description: string;
  icon: string;
}

export interface Testimonial {
  name: string;
  text: string;
  rating: number;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Stat {
  label: string;
  value: string;
  description: string;
}

// Tipos de notificações
export interface NotificationTemplate extends BaseEntity {
  name: string;
  type: 'email' | 'push' | 'sms';
  subject: string;
  body: string;
  isActive: boolean;
}

// Tipos específicos do Baby Diary
export interface Baby extends BaseEntity {
  name: string;
  gender?: 'male' | 'female';
  birthDate: Date;
  photoUrl?: string;
  userId: string;
  user: User;
  isActive: boolean;
}

export interface Activity extends BaseEntity {
  type: 'sleep' | 'feeding' | 'diaper' | 'weight' | 'milestone' | 'memory';
  title: string;
  description?: string;
  photoUrl?: string;
  babyId: string;
  baby: Baby;
  userId: string;
  user: User;
  date: Date;
  duration?: number;
  notes?: string;
}

export interface Memory extends BaseEntity {
  title: string;
  description: string;
  photoUrl?: string;
  babyId: string;
  baby: Baby;
  userId: string;
  user: User;
  date: Date;
  tags: string[];
  isPublic: boolean;
}

export interface Milestone extends BaseEntity {
  title: string;
  description: string;
  category: 'motor' | 'cognitive' | 'social' | 'language';
  babyId: string;
  baby: Baby;
  userId: string;
  user: User;
  date: Date;
  photoUrl?: string;
}

export interface GrowthRecord extends BaseEntity {
  height?: number;
  weight?: number;
  headCircumference?: number;
  babyId: string;
  baby: Baby;
  userId: string;
  user: User;
  date: Date;
  notes?: string;
}

export interface SleepRecord extends BaseEntity {
  startTime: Date;
  endTime?: Date;
  duration?: number;
  quality?: 'good' | 'fair' | 'poor';
  babyId: string;
  baby: Baby;
  userId: string;
  user: User;
  notes?: string;
}

export interface FeedingRecord extends BaseEntity {
  type: 'breast' | 'bottle' | 'solid';
  amount?: number;
  duration?: number;
  babyId: string;
  baby: Baby;
  userId: string;
  user: User;
  date: Date;
  notes?: string;
}

export interface DiaperRecord extends BaseEntity {
  type: 'wet' | 'dirty' | 'both';
  babyId: string;
  baby: Baby;
  userId: string;
  user: User;
  date: Date;
  notes?: string;
}

export interface WeightRecord extends BaseEntity {
  weight: number;
  babyId: string;
  baby: Baby;
  userId: string;
  user: User;
  date: Date;
  notes?: string;
}

export interface VaccinationRecord extends BaseEntity {
  name: string;
  date: Date;
  nextDueDate?: Date;
  babyId: string;
  baby: Baby;
  userId: string;
  user: User;
  notes?: string;
}

export interface SymptomRecord extends BaseEntity {
  description: string;
  intensity?: 'leve' | 'moderado' | 'forte';
  startDate: Date;
  endDate?: Date;
  babyId: string;
  baby: Baby;
  userId: string;
  user: User;
  notes?: string;
  photoUrl?: string;
}

// Tipos para requisições e respostas da API
export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends AuthRequest {
  name: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Tipos para JWT
export interface JWTPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
  iat: number;
  exp: number;
}

// Tipos para upload
export interface UploadResponse {
  url: string;
  publicId: string;
  secureUrl: string;
}

// Tipos para Stripe
export interface StripeCheckoutSession {
  id: string;
  url: string;
}

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
}

// Tipos para validação
export interface ValidationError {
  field: string;
  message: string;
}

// Tipos para filtros e busca
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BabyFilters extends PaginationParams {
  search?: string;
  gender?: 'male' | 'female';
  isActive?: boolean;
}

export interface ActivityFilters extends PaginationParams {
  type?: string;
  babyId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// SISTEMA DE RESGATE MANUAL - LOJA DE RECOMPENSAS
export interface ShopItem extends BaseEntity {
  name: string;
  description: string;
  type: 'theme' | 'feature' | 'bonus' | 'cosmetic';
  category: 'premium' | 'basic' | 'seasonal';
  price: number;
  imageUrl?: string;
  isActive: boolean;
  isLimited: boolean;
  stock?: number;
  sortOrder: number;
}

export interface UserPurchase extends BaseEntity {
  userId: string;
  user: User;
  itemId: string;
  item: ShopItem;
  pointsSpent: number;
  purchasedAt: Date;
}

// SISTEMA DE MISSÕES DIÁRIAS
export interface DailyMission extends BaseEntity {
  title: string;
  description: string;
  type: 'login' | 'memory' | 'activity' | 'milestone' | 'streak';
  goal: number;
  points: number;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface UserMission extends BaseEntity {
  userId: string;
  user: User;
  missionId: string;
  mission: DailyMission;
  progress: number;
  isCompleted: boolean;
  completedAt?: Date;
  assignedAt: Date;
  expiresAt: Date;
}

// SISTEMA DE EVENTOS ESPECIAIS
export interface SpecialEvent extends BaseEntity {
  name: string;
  description: string;
  type: 'seasonal' | 'challenge' | 'celebration';
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  rewards: any[];
  challenges: any[];
}

export interface UserEvent extends BaseEntity {
  userId: string;
  user: User;
  eventId: string;
  event: SpecialEvent;
  progress: Record<string, any>;
  rewards: any[];
  joinedAt: Date;
  completedAt?: Date;
} 