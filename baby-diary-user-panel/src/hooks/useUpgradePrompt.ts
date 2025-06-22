import { useState } from 'react';

interface UseUpgradePromptProps {
  variant?: 'default' | 'premium' | 'family';
  title?: string;
  description?: string;
  limit?: string;
}

export const useUpgradePrompt = (props: UseUpgradePromptProps = {}) => {
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradeConfig, setUpgradeConfig] = useState({
    variant: props.variant || 'premium',
    title: props.title || 'Limite atingido! ⭐',
    description: props.description || 'Você atingiu um limite do plano gratuito. Faça upgrade para continuar.',
    limit: props.limit || 'Limite do plano gratuito'
  });

  const showUpgrade = (config?: Partial<UseUpgradePromptProps>) => {
    if (config) {
      setUpgradeConfig(prev => ({ ...prev, ...config }));
    }
    setShowUpgradePrompt(true);
  };

  const hideUpgrade = () => {
    setShowUpgradePrompt(false);
  };

  const checkLimitError = (error: any): boolean => {
    const errorMessage = error?.message || error?.error || '';
    const isLimitError = errorMessage.toLowerCase().includes('limite') || 
                        errorMessage.toLowerCase().includes('limit') ||
                        errorMessage.toLowerCase().includes('atingido');
    
    if (isLimitError) {
      showUpgrade();
      return true;
    }
    return false;
  };

  return {
    showUpgradePrompt,
    upgradeConfig,
    showUpgrade,
    hideUpgrade,
    checkLimitError
  };
}; 