import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { BabyService } from '@/services/babyService';
import { ActivityService } from '@/services/activityService';
import { MemoryService } from '@/services/memoryService';
import { MilestoneService } from '@/services/milestoneService';

interface Baby {
  id: string;
  name: string;
  birthDate: string;
  gender: 'male' | 'female';
  photo?: string;
  photoUrl?: string;
  age: number;
  isActive?: boolean;
}

interface Activity {
  id: string;
  babyId: string;
  type: 'sleep' | 'feeding' | 'diaper' | 'growth' | 'play' | 'medical';
  title: string;
  description?: string;
  timestamp: string;
  duration?: string;
  amount?: string;
  notes?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
}

interface BabyContextType {
  user: User;
  babies: Baby[];
  selectedBaby: Baby | null;
  recentActivities: Activity[];
  totalPoints: number;
  addBaby: (baby: Omit<Baby, 'id'>) => Promise<any>;
  updateBaby: (baby: Baby) => void;
  selectBaby: (babyId: string) => void;
  addActivity: (activity: Omit<Activity, 'id'>) => void;
  isBabiesLoading: boolean;
  refreshPoints: () => Promise<void>;
}

const BabyContext = createContext<BabyContextType | undefined>(undefined);

export function BabyProvider({ children }: { children: ReactNode }) {
  const [babies, setBabies] = useState<Baby[]>([]);
  const [selectedBaby, setSelectedBaby] = useState<Baby | null>(null);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [user, setUser] = useState<User>({
    id: '',
    name: '',
    email: '',
  });
  const [totalPoints, setTotalPoints] = useState(0);
  const [isBabiesLoading, setIsBabiesLoading] = useState(true);

  // Função para calcular pontos baseado nas atividades, memórias e marcos
  const calculatePoints = async () => {
    try {
      let points = 0;
      
      // Calcular pontos baseado no número de bebês
      points += babies.length * 50; // 50 pontos por bebê
      
      // Calcular pontos baseado nas atividades
      for (const baby of babies) {
        try {
          const activitiesResponse = await ActivityService.getActivities({ babyId: baby.id });
          if (activitiesResponse.success && activitiesResponse.data) {
            const activities = activitiesResponse.data as any;
            const activitiesArray = activities.activities || activities;
            if (Array.isArray(activitiesArray)) {
              points += activitiesArray.length * 10; // 10 pontos por atividade
            }
          }
        } catch (error) {
          console.error('Erro ao buscar atividades para cálculo de pontos:', error);
        }
      }
      
      // Calcular pontos baseado nas memórias
      try {
        const memoriesResponse = await MemoryService.getAllMemories(1, 1);
        if (memoriesResponse.success && memoriesResponse.data) {
          const totalMemories = memoriesResponse.data.pagination?.total || 0;
          points += totalMemories * 25; // 25 pontos por memória
        }
      } catch (error) {
        console.error('Erro ao buscar memórias para cálculo de pontos:', error);
      }
      
      // Calcular pontos baseado nos marcos
      for (const baby of babies) {
        try {
          const milestonesResponse = await MilestoneService.getMilestones({ babyId: baby.id });
          if (milestonesResponse.success && milestonesResponse.data) {
            const milestones = milestonesResponse.data;
            if (Array.isArray(milestones)) {
              points += milestones.length * 100; // 100 pontos por marco
            }
          }
        } catch (error) {
          console.error('Erro ao buscar marcos para cálculo de pontos:', error);
        }
      }
      
      console.log('Pontos calculados:', points);
      setTotalPoints(points);
    } catch (error) {
      console.error('Erro ao calcular pontos:', error);
    }
  };

  // Função para atualizar pontos
  const refreshPoints = async () => {
    await calculatePoints();
  };

  // Buscar bebês do backend ao iniciar
  useEffect(() => {
    const fetchBabies = async () => {
      try {
        setIsBabiesLoading(true);
        console.log('Buscando bebês do backend...');
      const response = await BabyService.getBabies();
        console.log('Resposta da busca de bebês:', response);
        
      if (response.success && response.data) {
        setBabies(response.data);
        if (response.data.length > 0) {
          setSelectedBaby(response.data[0]);
        }
        } else {
          console.error('Erro ao buscar bebês:', response.error);
        }
      } catch (error) {
        console.error('Erro ao buscar bebês:', error);
      } finally {
        setIsBabiesLoading(false);
      }
    };
    fetchBabies();
  }, []);

  // Calcular pontos quando bebês mudarem
  useEffect(() => {
    if (babies.length > 0) {
      calculatePoints();
    }
  }, [babies]);

  const addBaby = async (baby: Omit<Baby, 'id'>) => {
    try {
      console.log('Tentando adicionar bebê:', baby);
    const response = await BabyService.createBaby(baby);
      console.log('Resposta da adição do bebê:', response);
      
    if (response.success && response.data) {
        const newBaby = response.data as Baby;
        console.log('Bebê adicionado com sucesso:', newBaby);
        
        // Atualizar a lista de bebês imediatamente
        setBabies((prev) => {
          const updated = [...prev, newBaby];
          console.log('Lista de bebês atualizada:', updated);
          return updated;
        });
        
        // Definir como bebê selecionado
        setSelectedBaby(newBaby);
        
        // Forçar uma atualização do contexto após um pequeno delay
        setTimeout(() => {
          console.log('Forçando atualização do contexto de bebês...');
          // Buscar bebês novamente do backend para garantir sincronização
          BabyService.getBabies().then((refreshResponse) => {
            if (refreshResponse.success && refreshResponse.data) {
              console.log('Bebês recarregados do backend:', refreshResponse.data);
              setBabies(refreshResponse.data);
            }
          });
        }, 1000);
        
        return response;
      } else {
        console.error('Erro ao adicionar bebê:', response.error);
        return response;
      }
    } catch (error) {
      console.error('Erro ao adicionar bebê:', error);
      return {
        success: false,
        error: 'Erro ao adicionar bebê',
      };
    }
  };

  const updateBaby = (updatedBaby: Baby) => {
    console.log('Atualizando bebê no contexto:', updatedBaby);
    
    // Atualizar a lista de bebês
    setBabies((prev) => {
      const updated = prev.map(baby => 
        baby.id === updatedBaby.id ? updatedBaby : baby
      );
      console.log('Lista de bebês atualizada após edição:', updated);
      return updated;
    });
    
    // Atualizar o bebê selecionado se for o mesmo
    setSelectedBaby((prev) => 
      prev?.id === updatedBaby.id ? updatedBaby : prev
    );
    
    // Forçar uma atualização do contexto
    setTimeout(() => {
      console.log('Forçando atualização do contexto após edição...');
      BabyService.getBabies().then((refreshResponse) => {
        if (refreshResponse.success && refreshResponse.data) {
          console.log('Bebês recarregados do backend após edição:', refreshResponse.data);
          setBabies(refreshResponse.data);
        }
      });
    }, 500);
  };

  const selectBaby = (babyId: string) => {
    const found = babies.find((b) => b.id === babyId) || null;
    setSelectedBaby(found);
  };

  const addActivity = (activity: Omit<Activity, 'id'>) => {
    // Implementation would add activity to state
    console.log('Adding activity:', activity);
  };

  return (
    <BabyContext.Provider
      value={{
        user,
        babies,
        selectedBaby,
        recentActivities,
        totalPoints,
        addBaby,
        updateBaby,
        selectBaby,
        addActivity,
        isBabiesLoading,
        refreshPoints,
      }}
    >
      {children}
    </BabyContext.Provider>
  );
}

export function useBabyContext() {
  const context = useContext(BabyContext);
  if (context === undefined) {
    throw new Error('useBabyContext must be used within a BabyProvider');
  }
  return context;
}