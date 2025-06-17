import React, { useEffect, useRef } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useBabyContext } from '@/contexts/BabyContext';
import { useAuth } from '@/contexts/AuthContext';

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { babies, isBabiesLoading } = useBabyContext();
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const lastBabyCount = useRef(babies.length);
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    console.log('=== ONBOARDING GUARD DEBUG ===');
    console.log('OnboardingGuard - babies.length:', babies.length);
    console.log('OnboardingGuard - lastBabyCount:', lastBabyCount.current);
    console.log('OnboardingGuard - isAuthenticated:', isAuthenticated);
    console.log('OnboardingGuard - isLoading:', isLoading);
    console.log('OnboardingGuard - isBabiesLoading:', isBabiesLoading);
    console.log('OnboardingGuard - segments:', segments);
    
    const isOnboardingPage = segments.some(segment => segment === 'onboarding-baby');
    const isAddBabyPage = segments.some(segment => segment === 'add-baby');
    const isManageBabiesPage = segments.some(segment => segment === 'manage-babies');
    const isEditBabyPage = segments.some(segment => segment === 'edit-baby');
    const isTabsPage = segments.some(segment => segment === '(tabs)');
    
    console.log('OnboardingGuard - isOnboardingPage:', isOnboardingPage);
    console.log('OnboardingGuard - isAddBabyPage:', isAddBabyPage);
    console.log('OnboardingGuard - isManageBabiesPage:', isManageBabiesPage);
    console.log('OnboardingGuard - isEditBabyPage:', isEditBabyPage);
    console.log('OnboardingGuard - isTabsPage:', isTabsPage);
    
    // Limpar timeout anterior se existir
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }
    
    // Só redireciona se não estiver carregando auth nem bebês
    if (!isLoading && !isBabiesLoading && isAuthenticated && babies.length === 0 && !isOnboardingPage && !isAddBabyPage && !isManageBabiesPage && !isEditBabyPage) {
      console.log('OnboardingGuard - redirecionando para onboarding-baby');
      router.replace('/onboarding-baby');
    }
    
    // Se tem bebês e está na página de onboarding, redirecionar para tabs
    if (!isLoading && !isBabiesLoading && isAuthenticated && babies.length > 0 && isOnboardingPage) {
      console.log('OnboardingGuard - tem bebês, redirecionando para tabs');
      router.replace('/(tabs)');
    }
    
    // Se tem bebês e não está em nenhuma página específica, garantir que está nas tabs
    if (!isLoading && !isBabiesLoading && isAuthenticated && babies.length > 0 && !isOnboardingPage && !isAddBabyPage && !isManageBabiesPage && !isEditBabyPage && !isTabsPage) {
      console.log('OnboardingGuard - tem bebês mas não está nas tabs, redirecionando');
      router.replace('/(tabs)');
    }
    
    // Se o número de bebês mudou (bebê foi criado), aguardar um pouco e verificar novamente
    if (babies.length > lastBabyCount.current && isOnboardingPage) {
      console.log('OnboardingGuard - bebê criado, aguardando atualização do contexto...');
      redirectTimeoutRef.current = setTimeout(() => {
        console.log('OnboardingGuard - timeout executado, verificando novamente...');
        if (babies.length > 0) {
          console.log('OnboardingGuard - confirmando bebê criado, redirecionando para tabs');
          router.replace('/(tabs)');
        }
      }, 2000); // Aguardar 2 segundos para o contexto atualizar
    }
    
    // Atualizar o contador de bebês
    lastBabyCount.current = babies.length;
    
    console.log('=== FIM ONBOARDING GUARD DEBUG ===');
  }, [babies, isAuthenticated, isLoading, isBabiesLoading, segments]);

  // Limpar timeout quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  return <>{children}</>;
}
