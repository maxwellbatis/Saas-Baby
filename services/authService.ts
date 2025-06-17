import { api, ApiResponse } from './api';

// Tipos para autenticação
interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
  photoUrl?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

// Serviço de autenticação
export class AuthService {
  // Login
  static async login(data: LoginData): Promise<ApiResponse<AuthResponse>> {
    return api.post<AuthResponse>('/auth/login', data, false);
  }

  // Registro
  static async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    return api.post<AuthResponse>('/auth/register', data, false);
  }

  // Logout
  static async logout(): Promise<ApiResponse<void>> {
    const response = await api.post<void>('/auth/logout');
    if (response.success) {
      await api.clearAuth();
    }
    return response;
  }

  // Recuperar senha
  static async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return api.post<void>('/auth/forgot-password', { email }, false);
  }

  // Redefinir senha
  static async resetPassword(token: string, password: string): Promise<ApiResponse<void>> {
    return api.post<void>('/auth/reset-password', { token, password }, false);
  }

  // Verificar token
  static async verifyToken(): Promise<ApiResponse<User>> {
    return api.get<User>('/auth/me');
  }

  // Atualizar perfil
  static async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return api.put<User>('/auth/me', data);
  }

  // Upload foto do perfil
  static async uploadProfilePhoto(file: { uri: string; type: string; name: string }): Promise<ApiResponse<{ photoUrl: string }>> {
    return api.uploadFile<{ photoUrl: string }>('/auth/profile-photo', file);
  }

  // Verificar se está autenticado
  static async isAuthenticated(): Promise<boolean> {
    return api.isAuthenticated();
  }

  // Limpar autenticação
  static async clearAuth(): Promise<void> {
    return api.clearAuth();
  }

  // Adicionar método para salvar token JWT
  static async setAuthToken(token: string): Promise<void> {
    return api.setAuthToken(token);
  }
}

// Exportar tipos
export type { LoginData, RegisterData, User, AuthResponse };