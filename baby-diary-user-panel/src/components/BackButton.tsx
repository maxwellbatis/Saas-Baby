
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackButtonProps {
  to?: string;
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ to, className = '' }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className={`text-muted-foreground hover:text-foreground ${className}`}
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Voltar
    </Button>
  );
};

export default BackButton;
