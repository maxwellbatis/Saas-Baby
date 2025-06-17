import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AuthService, LoginData, RegisterData, User } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<boolean>;
  updateUser: (data: Partial<User>) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar usuário autenticado ao iniciar o app
  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      try {
        const response = await AuthService.verifyToken();
        if (response.success && response.data) {
          setUser(response.data);
        } else {
          // Se sessão expirada ou inválida, limpa token e usuário
          await AuthService.clearAuth();
          setUser(null);
        }
      } catch (error) {
        await AuthService.clearAuth();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const response = await AuthService.login({ email, password });
      if (response.success && response.data) {
        await AuthService.clearAuth();
        await AuthService.setAuthToken(response.data.token);
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, message: response.message || response.error || 'Erro ao fazer login.' };
    } catch (error: any) {
      console.error('Erro no login:', error);
      return { success: false, message: error?.message || 'Erro inesperado no login.' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const response = await AuthService.register({ name, email, password });
      if (response.success && response.data) {
        await AuthService.clearAuth();
        await AuthService.setAuthToken(response.data.token);
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, message: response.message || response.error || 'Erro ao registrar.' };
    } catch (error: any) {
      console.error('Erro no registro:', error);
      return { success: false, message: error?.message || 'Erro inesperado no registro.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      setUser(null);
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await AuthService.forgotPassword(email);
      return response.success;
    } catch (error) {
      console.error('Erro ao recuperar senha:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (data: Partial<User>): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      console.log('=== UPDATE USER DEBUG ===');
      console.log('Dados enviados para atualização:', data);
      
      const response = await AuthService.updateProfile(data);
      console.log('Resposta do backend:', response);
      
      if (response.success && response.data) {
        console.log('Usuário atualizado no contexto:', response.data);
        setUser(response.data);
        return { success: true };
      }
      console.log('Erro na resposta:', response.message || response.error);
      return { success: false, message: response.message || response.error || 'Erro ao atualizar usuário.' };
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      return { success: false, message: error?.message || 'Erro inesperado ao atualizar usuário.' };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        forgotPassword,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}