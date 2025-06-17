import { api } from './api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: string;
  babyAge?: number;
}

export interface SleepAnalysis {
  analysis: string;
  recommendations: string[];
  statistics: {
    totalRecords: number;
    averageSleep: number;
    averageSleepFormatted: string;
    period: string;
  };
  records: any[];
}

export interface ActivitySuggestion {
  title: string;
  description: string;
  age: number;
  category: string;
  duration: number;
  materials: string[];
}

export interface FeedingTips {
  tips: string;
  nextSteps: string[];
  context: {
    babyAge: number;
    totalFeedings: number;
  };
}

export interface MilestonePrediction {
  predictions: string;
  timeline: any[];
  confidence: number;
}

export interface CryInterpretation {
  interpretation: string;
  urgency: 'low' | 'medium' | 'high';
  suggestions: string[];
}

export class AIService {
  // Chat com IA
  static async chat(message: string, babyId: string, babyAge: number): Promise<ApiResponse<any>> {
    try {
      console.log('=== AI SERVICE CHAT DEBUG ===');
      console.log('Enviando mensagem:', message);
      console.log('babyId:', babyId);
      console.log('babyAge:', babyAge);
      
      const response = await api.post('/ai/chat', {
        message,
        babyId,
        babyAge
      });
      
      console.log('Resposta completa da API:', response);
      console.log('Dados da resposta:', response.data);
      
      // Tratar a resposta como any para evitar problemas de tipagem
      const responseData = response.data as any;
      
      // Verificar se a resposta tem o formato esperado
      if (responseData && responseData.success && responseData.data) {
        console.log('Resposta da IA encontrada:', responseData.data);
        return {
          success: true,
          data: responseData.data
        };
      }
      
      // Se não tem o formato esperado, tentar outros formatos possíveis
      if (responseData && responseData.response) {
        console.log('Resposta da IA (formato alternativo):', responseData.response);
        return {
          success: true,
          data: responseData.response
        };
      }
      
      if (responseData && responseData.message) {
        console.log('Resposta da IA (formato message):', responseData.message);
        return {
          success: true,
          data: responseData.message
        };
      }
      
      // Se chegou até aqui, retornar a resposta completa
      console.log('Retornando resposta completa:', responseData);
      return {
        success: true,
        data: responseData
      };
      
    } catch (error: any) {
      console.error('Erro no chat:', error);
      console.error('Erro response:', error.response);
      console.error('Erro data:', error.response?.data);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Erro ao enviar mensagem'
      };
    }
  }

  // Análise de sono
  static async analyzeSleep(babyId: string, babyAge: number): Promise<ApiResponse<SleepAnalysis>> {
    try {
      const response = await api.post('/ai/analyze-sleep', {
        babyId,
        babyAge
      });
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao analisar sono'
      };
    }
  }

  // Sugestões de atividades
  static async getActivitySuggestions(babyId: string, babyAge: number): Promise<ApiResponse<ActivitySuggestion[]>> {
    try {
      const response = await api.post('/ai/activity-suggestions', {
        babyId,
        babyAge
      });
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar sugestões'
      };
    }
  }

  // Dicas de alimentação
  static async getFeedingTips(babyId: string, babyAge: number): Promise<ApiResponse<string[]>> {
    try {
      const response = await api.post('/ai/feeding-tips', {
        babyId,
        babyAge
      });
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar dicas'
      };
    }
  }

  // Previsão de marcos
  static async predictMilestones(babyId: string, babyAge: number): Promise<ApiResponse<MilestonePrediction[]>> {
    try {
      const response = await api.post('/ai/predict-milestones', {
        babyId,
        babyAge
      });
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao prever marcos'
      };
    }
  }

  // Interpretação de choro
  static async interpretCrying(babyId: string, babyAge: number, description: string): Promise<ApiResponse<string>> {
    try {
      const response = await api.post('/ai/interpret-crying', {
        babyId,
        babyAge,
        description
      });
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao interpretar choro'
      };
    }
  }

  // Conselhos personalizados
  static async getPersonalizedAdvice(babyId: string, babyAge: number, context: string): Promise<ApiResponse<string>> {
    try {
      const response = await api.post('/ai/personalized-advice', {
        babyId,
        babyAge,
        context
      });
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar conselhos'
      };
    }
  }
} 