import { api, ApiResponse } from './api';
import { ENDPOINTS, replaceParams } from '@/config/environment';

// Tipos para atividades
interface Activity {
  id: string;
  babyId: string;
  type: 'sleep' | 'feeding' | 'diaper' | 'weight' | 'play' | 'medical';
  title: string;
  description?: string;
  timestamp: string;
  duration?: string | number;
  amount?: string | number;
  height?: number;
  notes?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateActivityData {
  babyId: string;
  type: Activity['type'];
  title: string;
  description?: string;
  date: string;
  duration?: string | number;
  amount?: string | number;
  height?: number;
  notes?: string;
}

interface UpdateActivityData extends Partial<CreateActivityData> {
  id: string;
}

interface ActivityFilters {
  babyId?: string;
  type?: Activity['type'];
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

// Serviço de atividades
export class ActivityService {
  // Buscar todas as atividades
  static async getActivities(filters?: ActivityFilters): Promise<ApiResponse<Activity[]>> {
    if (!filters?.babyId) {
      return {
        success: false,
        error: 'babyId é obrigatório para buscar atividades',
        data: []
      };
    }

    const queryParams = new URLSearchParams();
    
    if (filters?.type) queryParams.append('type', filters.type);
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.offset) queryParams.append('offset', filters.offset.toString());

    const endpoint = `/user/babies/${filters.babyId}/activities?${queryParams.toString()}`;
    return api.get<Activity[]>(endpoint);
  }

  // Buscar uma atividade específica
  static async getActivity(id: string): Promise<ApiResponse<Activity>> {
    const endpoint = replaceParams(ENDPOINTS.UPDATE_ACTIVITY, { id });
    return api.get<Activity>(endpoint);
  }

  // Criar uma nova atividade
  static async createActivity(data: CreateActivityData): Promise<ApiResponse<Activity>> {
    return api.post<Activity>(ENDPOINTS.CREATE_ACTIVITY, data);
  }

  // Atualizar uma atividade
  static async updateActivity(data: UpdateActivityData): Promise<ApiResponse<Activity>> {
    const endpoint = replaceParams(ENDPOINTS.UPDATE_ACTIVITY, { id: data.id });
    const { id, ...updateData } = data;
    return api.put<Activity>(endpoint, updateData);
  }

  // Deletar uma atividade
  static async deleteActivity(id: string): Promise<ApiResponse<void>> {
    const endpoint = replaceParams(ENDPOINTS.DELETE_ACTIVITY, { id });
    return api.delete<void>(endpoint);
  }

  // Buscar atividades de hoje
  static async getTodayActivities(babyId?: string): Promise<ApiResponse<Activity[]>> {
    const today = new Date().toISOString().split('T')[0];
    return this.getActivities({
      startDate: today,
      endDate: today,
      babyId,
    });
  }

  // Buscar atividades da semana
  static async getWeekActivities(babyId?: string): Promise<ApiResponse<Activity[]>> {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return this.getActivities({
      startDate: weekAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
      babyId,
    });
  }

  // Buscar atividades do mês
  static async getMonthActivities(babyId?: string): Promise<ApiResponse<Activity[]>> {
    const today = new Date();
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    return this.getActivities({
      startDate: monthAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
      babyId,
    });
  }

  // Obter estatísticas de atividades
  static async getActivityStats(babyId: string, period: 'day' | 'week' | 'month'): Promise<ApiResponse<any>> {
    const endpoint = `/activities/stats?babyId=${babyId}&period=${period}`;
    return api.get(endpoint);
  }

  // Formatar timestamp
  static formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR');
  }

  // Formatar duração
  static formatDuration(duration: string): string {
    // Assumindo que duration está em minutos
    const minutes = parseInt(duration);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}min`;
    }
    return `${remainingMinutes}min`;
  }

  // Obter ícone da atividade
  static getActivityIcon(type: Activity['type']): string {
    const icons = {
      sleep: '😴',
      feeding: '🍼',
      diaper: '👶',
      weight: '📏',
      play: '🎮',
      medical: '🏥',
    };
    return icons[type] || '📝';
  }

  // Obter cor da atividade
  static getActivityColor(type: Activity['type']): string {
    const colors = {
      sleep: '#6366F1',
      feeding: '#EF4444',
      diaper: '#10B981',
      weight: '#F59E0B',
      play: '#8B5CF6',
      medical: '#EC4899',
    };
    return colors[type] || '#6B7280';
  }
}

// Exportar tipos
export type { Activity, CreateActivityData, UpdateActivityData, ActivityFilters }; 