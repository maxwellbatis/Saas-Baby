import React from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import UpgradePrompt from './UpgradePrompt';
import { useUpgradePrompt } from '@/hooks/useUpgradePrompt';

interface UpgradePromptWrapperProps {
  children: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  defaultConfig?: {
    variant?: 'default' | 'premium' | 'family';
    title?: string;
    description?: string;
    limit?: string;
  };
}

const UpgradePromptWrapper: React.FC<UpgradePromptWrapperProps> = ({
  children,
  isOpen = true,
  onClose,
  defaultConfig = {}
}) => {
  const { showUpgradePrompt, upgradeConfig, hideUpgrade } = useUpgradePrompt(defaultConfig);

  const handleClose = () => {
    hideUpgrade();
    onClose?.();
  };

  // Se deve mostrar o prompt de upgrade
  if (showUpgradePrompt) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-2xl">
          <UpgradePrompt
            title={upgradeConfig.title}
            description={upgradeConfig.description}
            limit={upgradeConfig.limit}
            variant={upgradeConfig.variant}
            className="border-0 shadow-none"
          />
          <div className="flex justify-center mt-4">
            <Button variant="outline" onClick={handleClose}>
              Voltar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return <>{children}</>;
};

export default UpgradePromptWrapper; 