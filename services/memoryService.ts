import { api } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '@/config/environment';

export interface Memory {
  id: string;
  title: string;
  description: string;
  photoUrl?: string;
  babyId: string;
  userId: string;
  date: string;
  tags: string[];
  isPublic: boolean;
  sharedWith: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMemoryData {
  title: string;
  description: string;
  babyId: string;
  date?: string;
  photoUrl?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface UpdateMemoryData {
  title?: string;
  description?: string;
  date?: string;
  photoUrl?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface MemoryResponse {
  success: boolean;
  data?: Memory;
  message?: string;
  error?: string;
}

export interface MemoriesListResponse {
  success: boolean;
  data?: {
    memories: Memory[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  message?: string;
  error?: string;
}

export interface UploadResponse {
  success: boolean;
  data?: {
    url: string;
  };
  message?: string;
  error?: string;
}

export class MemoryService {
  // Buscar memórias de um bebê
  static async getMemories(babyId: string, page: number = 1, limit: number = 20): Promise<MemoriesListResponse> {
    try {
      console.log('=== GET MEMORIES DEBUG ===');
      console.log('babyId:', babyId);
      console.log('page:', page);
      console.log('limit:', limit);
      
      const response = await api.get(`/user/babies/${babyId}/memories?page=${page}&limit=${limit}`);
      console.log('API Response:', response);
      
      if (response.success && response.data) {
        // Garante que retorna sempre { success, data: { memories, ... } }
        return {
          success: true,
          data: response.data,
        };
      } else {
        console.error('Resposta da API sem sucesso:', response);
        return {
          success: false,
          data: { memories: [], pagination: { page, limit, total: 0, pages: 0 } },
          error: response.error || 'Erro ao buscar memórias',
        };
      }
    } catch (error: any) {
      console.error('fetchMemories: Erro ao buscar memórias:', error.message);
      return {
        success: false,
        data: { memories: [], pagination: { page, limit, total: 0, pages: 0 } },
        error: error.message || 'Erro ao buscar memórias',
      };
    }
  }

  // Buscar todas as memórias do usuário
  static async getAllMemories(page: number = 1, limit: number = 20): Promise<MemoriesListResponse> {
    try {
      const response = await api.get(`/user/memories?page=${page}&limit=${limit}`);
      return response.data as MemoriesListResponse;
    } catch (error: any) {
      console.error('Erro ao buscar memórias:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar memórias',
      };
    }
  }

  // Criar nova memória
  static async createMemory(data: CreateMemoryData): Promise<MemoryResponse> {
    try {
      const response = await api.post('/user/memories', data);
      return response.data as MemoryResponse;
    } catch (error: any) {
      console.error('Erro ao criar memória:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao criar memória',
      };
    }
  }

  // Atualizar memória
  static async updateMemory(id: string, data: UpdateMemoryData): Promise<MemoryResponse> {
    try {
      const response = await api.put(`/user/memories/${id}`, data);
      return response.data as MemoryResponse;
    } catch (error: any) {
      console.error('Erro ao atualizar memória:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao atualizar memória',
      };
    }
  }

  // Excluir memória
  static async deleteMemory(id: string): Promise<MemoryResponse> {
    try {
      const response = await api.delete(`/user/memories/${id}`);
      return response.data as MemoryResponse;
    } catch (error: any) {
      console.error('Erro ao excluir memória:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao excluir memória',
      };
    }
  }

  // Upload de foto para memória
  static async uploadMemoryPhoto(file: {
    uri: string;
    type: string;
    name: string;
  }): Promise<UploadResponse> {
    try {
      console.log('Tentando upload para:', '/upload/memories/upload');
      
      // Usar o método uploadFile padrão do API service
      const response = await api.uploadFile<{ url: string }>('/upload/memories/upload', file);
      
      console.log('Resposta do upload:', response);
      return response as UploadResponse;
    } catch (error: any) {
      console.error('Erro no upload da foto:', error);
      return {
        success: false,
        error: error.message || 'Erro no upload da foto',
      };
    }
  }

  // Buscar memória por ID
  static async getMemoryById(id: string): Promise<MemoryResponse> {
    try {
      const response = await api.get(`/user/memories/${id}`);
      return response.data as MemoryResponse;
    } catch (error: any) {
      console.error('Erro ao buscar memória:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar memória',
      };
    }
  }
} 