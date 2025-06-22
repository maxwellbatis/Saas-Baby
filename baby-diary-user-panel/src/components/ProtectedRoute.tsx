import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
  requireBaby?: boolean;
}

const ProtectedRoute = ({ children, requireBaby = true }: ProtectedRouteProps) => {
  const { isLoading, isAuthenticated, hasBaby } = useAuth();
  const location = useLocation();

  // Mostra loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Redireciona para login se não autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se está na página de onboarding e já tem bebê, redireciona para dashboard
  if (location.pathname === "/onboarding" && hasBaby) {
    return <Navigate to="/dashboard" replace />;
  }

  // Se precisa de bebê mas não tem, redireciona para onboarding
  if (requireBaby && !hasBaby && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  // Renderiza o conteúdo protegido
  return <>{children}</>;
};

export default ProtectedRoute;