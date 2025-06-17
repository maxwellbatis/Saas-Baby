import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '@/config/environment';

// Configuração da API
const API_CONFIG = {
  BASE_URL: `${ENV.BACKEND_URL}/api`,
  TIMEOUT: ENV.API_TIMEOUT,
  VERSION: ENV.API_VERSION,
};

// Tipos de resposta da API
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Classe principal da API
class ApiService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  // Método para obter o token de autenticação
  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Erro ao obter token:', error);
      return null;
    }
  }

  // Método para salvar o token de autenticação
  public async setAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Erro ao salvar token:', error);
    }
  }

  // Método para remover o token de autenticação
  private async removeAuthToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('authToken');
    } catch (error) {
      console.error('Erro ao remover token:', error);
    }
  }

  // Método para fazer requisições HTTP
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      
      // Construir headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      if (includeAuth) {
        const token = await this.getAuthToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const config: RequestInit = {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      };

      // Adicionar timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      config.signal = controller.signal;

      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      // Verificar se a resposta é ok
      if (!response.ok) {
        // Se for 401, remover token e redirecionar para login
        if (response.status === 401) {
          await this.removeAuthToken();
          throw new Error('Sessão expirada. Faça login novamente.');
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Se a resposta incluir um token, salvá-lo
      if (data.token) {
        await this.setAuthToken(data.token);
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      console.error('Erro na requisição:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Timeout na requisição. Verifique sua conexão.',
          };
        }
        
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: false,
        error: 'Erro desconhecido na requisição',
      };
    }
  }

  // Métodos HTTP
  async get<T>(endpoint: string, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' }, includeAuth);
  }

  async post<T>(endpoint: string, data?: any, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, includeAuth);
  }

  async put<T>(endpoint: string, data?: any, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }, includeAuth);
  }

  async patch<T>(endpoint: string, data?: any, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }, includeAuth);
  }

  async delete<T>(endpoint: string, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' }, includeAuth);
  }

  // Upload de arquivos
  async uploadFile<T>(
    endpoint: string,
    file: { uri: string; type: string; name: string },
    data?: any,
    includeAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      // Headers para upload
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      if (includeAuth) {
        const token = await this.getAuthToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
      const formData = new FormData();
      // Adicionar arquivo (campo correto: 'image')
      formData.append('image', {
        uri: file.uri,
        type: file.type,
        name: file.name,
      } as any);
      // Adicionar dados extras
      if (data) {
        Object.keys(data).forEach(key => {
          formData.append(key, data[key]);
        });
      }
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      const responseData = await response.json();
      return {
        success: true,
        data: responseData.data || responseData,
        message: responseData.message,
      };
    } catch (error) {
      console.error('Erro no upload:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro no upload',
      };
    }
  }

  // Limpar token (logout)
  async clearAuth(): Promise<void> {
    await this.removeAuthToken();
  }

  // Verificar se está autenticado
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAuthToken();
    return !!token;
  }
}

// Instância única do serviço
export const api = new ApiService();

// Exportar tipos
export type { ApiResponse, ApiError };

// Exportar configuração
export { API_CONFIG };