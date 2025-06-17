import { api, ApiResponse } from './api';
import { ENDPOINTS, replaceParams, ENV } from '@/config/environment';
import { AuthService } from '@/services/authService';

// Tipos para bebês
interface Baby {
  id: string;
  name: string;
  birthDate: string;
  gender: 'male' | 'female';
  photo?: string;
  photoUrl?: string;
  age: number;
  weight?: number;
  height?: number;
  userId: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateBabyData {
  name: string;
  birthDate: string;
  gender: 'male' | 'female';
  photo?: string;
  weight?: number;
  height?: number;
}

interface UpdateBabyData {
  id: string;
  name?: string;
  birthDate?: string;
  gender?: 'male' | 'female';
  photo?: string;
  weight?: number;
  height?: number;
  isActive?: boolean;
}

// Serviço de bebês
export class BabyService {
  // Buscar todos os bebês do usuário
  static async getBabies(): Promise<ApiResponse<Baby[]>> {
    try {
      return await api.get<Baby[]>(ENDPOINTS.GET_BABIES);
    } catch (error) {
      console.error('Erro ao buscar bebês:', error);
      return {
        success: false,
        error: 'Erro ao buscar bebês',
      };
    }
  }

  // Buscar um bebê específico
  static async getBaby(id: string): Promise<ApiResponse<Baby>> {
    try {
      return await api.get<Baby>(`/user/babies/${id}`);
    } catch (error: any) {
      console.error('Erro ao buscar bebê:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao buscar bebê' 
      };
    }
  }

  // Criar um novo bebê
  static async createBaby(data: CreateBabyData): Promise<ApiResponse<Baby>> {
    try {
      console.log('=== INÍCIO DO CREATE BABY ===');
      console.log('Tentando criar bebê com dados:', data);
      console.log('Endpoint:', ENDPOINTS.CREATE_BABY);
      console.log('URL completa:', `${ENV.BACKEND_URL}/api${ENDPOINTS.CREATE_BABY}`);
      
      const response = await api.post<Baby>(ENDPOINTS.CREATE_BABY, data);
      console.log('Resposta da criação do bebê:', response);
      console.log('=== FIM DO CREATE BABY ===');
      return response;
    } catch (error) {
      console.error('=== ERRO NO CREATE BABY ===');
      console.error('Erro ao criar bebê:', error);
      console.error('=== FIM DO ERRO ===');
      return {
        success: false,
        error: 'Erro ao criar bebê',
      };
    }
  }

  // Atualizar um bebê
  static async updateBaby(data: UpdateBabyData): Promise<ApiResponse<Baby>> {
    try {
      const endpoint = replaceParams(ENDPOINTS.UPDATE_BABY, { id: data.id });
      const { id, ...updateData } = data;
      return await api.put<Baby>(endpoint, updateData);
    } catch (error) {
      console.error('Erro ao atualizar bebê:', error);
      return {
        success: false,
        error: 'Erro ao atualizar bebê',
      };
    }
  }

  // Deletar um bebê
  static async deleteBaby(id: string): Promise<ApiResponse<void>> {
    try {
      const endpoint = replaceParams(ENDPOINTS.DELETE_BABY, { id });
      return await api.delete<void>(endpoint);
    } catch (error) {
      console.error('Erro ao deletar bebê:', error);
      return {
        success: false,
        error: 'Erro ao deletar bebê',
      };
    }
  }

  // Upload de foto do bebê
  static async uploadBabyPhoto(file: { uri: string; type: string; name: string }): Promise<ApiResponse<{ url: string }>> {
    try {
      console.log('Iniciando upload de foto do bebê:', file);
      return await api.uploadFile<{ url: string }>('/upload/image', file, { folder: 'babies' });
    } catch (error) {
      console.error('Erro no upload de foto:', error);
      return { success: false, error: 'Erro no upload de foto' };
    }
  }

  // Calcular idade do bebê
  static calculateAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 30.44); // Média de dias por mês
  }

  // Formatar data de nascimento
  static formatBirthDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  // Obter faixa etária
  static getAgeGroup(ageInMonths: number): string {
    if (ageInMonths < 1) return 'Recém-nascido';
    if (ageInMonths < 3) return 'Bebê (1-3 meses)';
    if (ageInMonths < 6) return 'Bebê (3-6 meses)';
    if (ageInMonths < 12) return 'Bebê (6-12 meses)';
    if (ageInMonths < 24) return 'Toddler (1-2 anos)';
    return 'Criança (2+ anos)';
  }
}

// Exportar tipos
export type { Baby, CreateBabyData, UpdateBabyData };