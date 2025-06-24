import React, { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from "react";
import { getMe, getGamificationData } from "@/lib/api";

interface AuthContextType {
  user: any;
  babies: any[];
  currentBaby: any | null;
  userPlan: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasBaby: boolean;
  error: string | null;
  refetch: () => Promise<void>;
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
  const [user, setUser] = useState<any>(null);
  const [babies, setBabies] = useState<any[]>([]);
  const [currentBaby, setCurrentBaby] = useState<any | null>(null);
  const [userPlan, setUserPlan] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const isFetchingRef = useRef(false);

  const fetchProfile = useCallback(async () => {
    // Evita múltiplas chamadas simultâneas
    if (isFetchingRef.current) {
      return;
    }

    // Verificar se há token antes de fazer a chamada
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      setHasInitialized(true);
      return;
    }

    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getMe();
      
      if (response.success && response.data) {
        setUser(response.data);
        const babyList = response.data.babies || [];
        setBabies(babyList);
        setCurrentBaby(babyList.length > 0 ? babyList[0] : null);
        setUserPlan(response.data.plan || null);
      } else {
        // Limpar estado se não estiver autenticado
        setUser(null);
        setBabies([]);
        setCurrentBaby(null);
        setUserPlan(null);
        setError(response.message || "Erro ao buscar dados do perfil");
      }
    } catch (err: any) {
      console.error("[AuthContext] Erro no fetchProfile:", err);
      // Limpar estado em caso de erro 401 (não autorizado)
      if (err.response?.status === 401) {
        setUser(null);
        setBabies([]);
        setCurrentBaby(null);
        setUserPlan(null);
        setError("Sessão expirada");
      }
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
      if (!hasInitialized) {
        setHasInitialized(true);
      }
    }
  }, []);

  // Efeito inicial - só executa uma vez na inicialização
  useEffect(() => {
    if (!hasInitialized) {
      fetchProfile();
    }
  }, [fetchProfile, hasInitialized]);

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

  const authState: AuthContextType = {
    user,
    babies,
    currentBaby,
    userPlan,
    isLoading,
    isAuthenticated: !!user,
    hasBaby: babies.length > 0,
    error,
    refetch: fetchProfile,
    isPregnancyMode,
    isPostpartumMode,
  };

  return (
    <AuthContext.Provider value={authState}>
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