import { api } from './api';

export interface Milestone {
  id: string;
  title: string;
  description: string;
  category: 'motor' | 'cognitive' | 'social' | 'language';
  babyId: string;
  baby: {
    id: string;
    name: string;
  };
  userId: string;
  date: string;
  photoUrl?: string;
  isPredicted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMilestoneData {
  title: string;
  description: string;
  babyId: string;
  date: string;
  category: 'motor' | 'cognitive' | 'social' | 'language';
  photoUrl?: string;
}

export interface UpdateMilestoneData {
  title?: string;
  description?: string;
  date?: string;
  category?: 'motor' | 'cognitive' | 'social' | 'language';
  photoUrl?: string;
}

export interface MilestoneFilters {
  page?: number;
  limit?: number;
  babyId?: string;
  category?: string;
}

export interface MilestoneResponse {
  success: boolean;
  data: Milestone[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message?: string;
  error?: string;
}

export interface SingleMilestoneResponse {
  success: boolean;
  data: Milestone;
  message?: string;
  error?: string;
}

export class MilestoneService {
  static async getMilestones(filters: MilestoneFilters = {}): Promise<MilestoneResponse> {
    try {
      console.log('Buscando marcos com filtros:', filters);
      
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.babyId) params.append('babyId', filters.babyId);
      if (filters.category) params.append('category', filters.category);

      const endpoint = `/user/milestones?${params.toString()}`;
      console.log('Endpoint para marcos:', endpoint);
      
      const response = await api.get(endpoint);
      
      console.log('Milestones response:', response);
      
      if (response.success) {
        return {
          success: true,
          data: (response.data as Milestone[]) || [],
          pagination: (response as any).pagination,
        };
      } else {
        return {
          success: false,
          data: [],
          error: response.error || 'Erro ao buscar marcos',
        };
      }
    } catch (error: any) {
      console.error('Erro ao buscar marcos:', error);
      return {
        success: false,
        data: [],
        error: error.message || 'Erro ao buscar marcos',
      };
    }
  }

  static async getMilestone(id: string): Promise<SingleMilestoneResponse> {
    try {
      const response = await api.get(`/user/milestones/${id}`);
      
      if (response.success) {
        return {
          success: true,
          data: response.data as Milestone,
        };
      } else {
        return {
          success: false,
          data: {} as Milestone,
          error: response.error || 'Erro ao buscar marco',
        };
      }
    } catch (error: any) {
      console.error('Erro ao buscar marco:', error);
      return {
        success: false,
        data: {} as Milestone,
        error: error.message || 'Erro ao buscar marco',
      };
    }
  }

  static async createMilestone(data: CreateMilestoneData): Promise<SingleMilestoneResponse> {
    try {
      console.log('Criando marco:', data);
      
      const response = await api.post('/user/milestones', data);
      
      console.log('Marco criado:', response);
      
      if (response.success) {
        return {
          success: true,
          data: response.data as Milestone,
          message: response.message,
        };
      } else {
        return {
          success: false,
          data: {} as Milestone,
          error: response.error || 'Erro ao criar marco',
        };
      }
    } catch (error: any) {
      console.error('Erro ao criar marco:', error);
      return {
        success: false,
        data: {} as Milestone,
        error: error.message || 'Erro ao criar marco',
      };
    }
  }

  static async updateMilestone(id: string, data: UpdateMilestoneData): Promise<SingleMilestoneResponse> {
    try {
      const response = await api.put(`/user/milestones/${id}`, data);
      
      if (response.success) {
        return {
          success: true,
          data: response.data as Milestone,
          message: response.message,
        };
      } else {
        return {
          success: false,
          data: {} as Milestone,
          error: response.error || 'Erro ao atualizar marco',
        };
      }
    } catch (error: any) {
      console.error('Erro ao atualizar marco:', error);
      return {
        success: false,
        data: {} as Milestone,
        error: error.message || 'Erro ao atualizar marco',
      };
    }
  }

  static async deleteMilestone(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await api.delete(`/user/milestones/${id}`);
      
      if (response.success) {
        return {
          success: true,
          message: response.message,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Erro ao excluir marco',
        };
      }
    } catch (error: any) {
      console.error('Erro ao excluir marco:', error);
      return {
        success: false,
        error: error.message || 'Erro ao excluir marco',
      };
    }
  }

  static async uploadMilestonePhoto(file: {
    uri: string;
    type: string;
    name: string;
  }): Promise<{ success: boolean; data?: { url: string }; error?: string }> {
    try {
      console.log('Fazendo upload da foto do marco...');
      
      const response = await api.uploadFile<{ url: string }>('/upload/memories/upload', file);
      
      console.log('Upload da foto do marco concluído:', response);

      if (response.success && response.data) {
        return {
          success: true,
          data: {
            url: response.data.url,
          },
        };
      } else {
        return {
          success: false,
          error: response.error || 'Erro no upload da foto',
        };
      }
    } catch (error: any) {
      console.error('Erro no upload da foto do marco:', error);
      return {
        success: false,
        error: error.message || 'Erro no upload da foto',
      };
    }
  }

  static async completeMilestone(id: string): Promise<SingleMilestoneResponse> {
    try {
      const response = await api.post(`/user/milestones/${id}/complete`);
      
      if (response.success) {
        return {
          success: true,
          data: response.data as Milestone,
          message: response.message,
        };
      } else {
        return {
          success: false,
          data: {} as Milestone,
          error: response.error || 'Erro ao completar marco',
        };
      }
    } catch (error: any) {
      console.error('Erro ao completar marco:', error);
      return {
        success: false,
        data: {} as Milestone,
        error: error.message || 'Erro ao completar marco',
      };
    }
  }

  // Método para obter marcos por categoria
  static async getMilestonesByCategory(category: string, babyId?: string): Promise<MilestoneResponse> {
    return this.getMilestones({ category, babyId });
  }

  // Método para obter marcos de um bebê específico
  static async getMilestonesByBaby(babyId: string): Promise<MilestoneResponse> {
    return this.getMilestones({ babyId });
  }

  // Método para obter estatísticas de marcos
  static async getMilestoneStats(babyId?: string): Promise<{
    success: boolean;
    data?: {
      total: number;
      completed: number;
      byCategory: Record<string, number>;
    };
    error?: string;
  }> {
    try {
      const params = new URLSearchParams();
      if (babyId) params.append('babyId', babyId);

      const response = await api.get(`/user/milestones/stats?${params.toString()}`);
      
      if (response.success) {
        return {
          success: true,
          data: response.data as {
            total: number;
            completed: number;
            byCategory: Record<string, number>;
          },
        };
      } else {
        return {
          success: false,
          error: response.error || 'Erro ao buscar estatísticas',
        };
      }
    } catch (error: any) {
      console.error('Erro ao buscar estatísticas de marcos:', error);
      return {
        success: false,
        error: error.message || 'Erro ao buscar estatísticas',
      };
    }
  }
} 