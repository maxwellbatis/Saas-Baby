import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/admin/AdminAuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const location = useLocation();

  console.log('🛡️ ProtectedAdminRoute - Status:', { isAuthenticated, isLoading, pathname: location.pathname });

  if (isLoading) {
    console.log('⏳ ProtectedAdminRoute - Carregando...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('🚫 ProtectedAdminRoute - Não autenticado, redirecionando para login');
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  console.log('✅ ProtectedAdminRoute - Autenticado, renderizando conteúdo');
  return <>{children}</>;
}; 