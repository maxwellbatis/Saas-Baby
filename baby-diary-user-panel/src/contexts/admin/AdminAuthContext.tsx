import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { adminAuth } from '../../lib/adminApi';

interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
}

interface AdminAuthContextType {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  getAdminProfile: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth deve ser usado dentro de AdminAuthProvider');
  }
  return context;
};

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!admin;

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('🔐 Tentando login admin:', { email });
      
      const response = await adminAuth.login(email, password);
      console.log('📡 Resposta do login admin:', response);
      
      if (response.success) {
        const { token, admin: adminData } = response.data;
        console.log('✅ Login admin bem-sucedido:', { adminData });
        localStorage.setItem('adminToken', token);
        setAdmin(adminData);
        return { success: true };
      } else {
        console.log('❌ Login admin falhou:', response.error);
        return { success: false, error: response.error || 'Erro no login' };
      }
    } catch (error: any) {
      console.error('💥 Erro no login admin:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro de conexão' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('🚪 Logout admin');
    adminAuth.logout();
    setAdmin(null);
  };

  const getAdminProfile = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      console.log('🔍 Verificando token admin:', !!token);
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await adminAuth.getProfile();
      console.log('📡 Resposta do perfil admin:', response);

      if (response.success) {
        setAdmin(response.data);
        console.log('✅ Perfil admin carregado:', response.data);
      } else {
        console.log('❌ Falha ao carregar perfil admin');
        localStorage.removeItem('adminToken');
      }
    } catch (error) {
      console.error('💥 Erro ao buscar perfil admin:', error);
      localStorage.removeItem('adminToken');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAdminProfile();
  }, []);

  const value: AdminAuthContextType = {
    admin,
    isAuthenticated,
    isLoading,
    login,
    logout,
    getAdminProfile,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}; 