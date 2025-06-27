import React, { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from "react";
import { getMe, getGamificationData } from "@/lib/api";
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
  user: any;
  babies: any[];
  currentBaby: any | null;
  userPlan: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasBaby: boolean;
  error: string | null;
  refetch: () => Promise<any>;
  isPregnancyMode: boolean;
  isPostpartumMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const queryClient = useQueryClient();
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    staleTime: 1000 * 60 * 5,
  });

  const user = data?.success ? data.data : null;
  const babies = user?.babies || [];
  const currentBaby = babies.length > 0 ? babies[0] : null;
  const userPlan = user?.plan || null;
  const isAuthenticated = !!user;
  const hasBaby = babies.length > 0;

  // Flags de modo gestante e pós-parto
  const isFutureDate = (dateString: string) => {
    if (!dateString) return false;
    // O formato YYYY-MM-DD é interpretado como UTC. Para evitar problemas de fuso,
    // que podem mudar a data, usamos / como separador, que é interpretado como local.
    const date = new Date(dateString.split('T')[0].replace(/-/g, '/'));
    const today = new Date();
    date.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

  const isPastOrTodayDate = (dateString: string) => {
    if (!dateString) return false;
    const date = new Date(dateString.split('T')[0].replace(/-/g, '/'));
    const today = new Date();
    date.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return date <= today;
  };

  const isPregnancyMode = babies.length === 0 || babies.some(b => isFutureDate(b.birthDate));
  const isPostpartumMode = babies.length > 0 && babies.some(b => isPastOrTodayDate(b.birthDate));

  return (
    <AuthContext.Provider
      value={{
        user,
        babies,
        currentBaby,
        userPlan,
        isLoading,
        isAuthenticated,
        hasBaby,
        error: error ? (error as Error).message : null,
        refetch,
        isPregnancyMode,
        isPostpartumMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

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
  totalGrowthRecords: number;
  totalVaccineRecords: number;
}

interface GamificationContextType {
  gamification: Gamification | null;
  loading: boolean;
  fetchGamificationData: () => Promise<void>;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gamification, setGamification] = useState<Gamification | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchGamificationData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getGamificationData();
      setGamification(data.gamification);
    } catch (error) {
      setGamification(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Opcional: buscar ao montar
  // useEffect(() => { fetchGamificationData(); }, []);

  return (
    <GamificationContext.Provider value={{ gamification, loading, fetchGamificationData }}>
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const ctx = useContext(GamificationContext);
  if (!ctx) throw new Error('useGamification deve ser usado dentro de GamificationProvider');
  return ctx;
}; 