import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import UpgradePrompt from "./UpgradePrompt";
import { useAuth } from '@/contexts/AuthContext';
import { Calendar } from 'lucide-react';
import { API_CONFIG } from '../config/api';

interface Activity {
  id?: string;
  type: 'sleep' | 'feeding' | 'play' | 'bath' | 'diaper' | 'medicine' | 'general';
  title: string;
  description: string;
  date: string;
  duration: number; // in minutes
  notes?: string;
  babyId?: string;
}

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  activity?: Activity;
  mode: 'create' | 'edit' | 'view';
  babyId: string | undefined;
  isViewMode?: boolean;
}

const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  activity,
  mode,
  babyId,
  isViewMode = false
}) => {
  const { currentBaby } = useAuth();
  const { theme, getGradientClass } = useTheme();
  const { toast } = useToast();
  
  const [type, setType] = useState<Activity['type']>(activity?.type || 'general');
  const [title, setTitle] = useState(activity?.title || '');
  const [description, setDescription] = useState(activity?.description || '');
  const [date, setDate] = useState(activity?.date ? new Date(activity.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState(activity?.duration || 0);
  const [notes, setNotes] = useState(activity?.notes || '');
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  useEffect(() => {
    if (activity) {
      setType(activity.type);
      setTitle(activity.title);
      setDescription(activity.description);
      setDate(new Date(activity.date).toISOString().split('T')[0]);
      setDuration(activity.duration || 0);
      setNotes(activity.notes || '');
    } else {
      // Reset form
      setType('general');
      setTitle('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setDuration(0);
      setNotes('');
    }
  }, [activity, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewMode) return;
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      
      const activityData = {
        type,
        title,
        description,
        date: new Date(date).toISOString(),
        duration,
        notes,
        babyId: babyId,
      };

      const isEditing = mode === 'edit' && activity?.id;
      const url = isEditing 
        ? `${API_CONFIG.BASE_URL}/user/activities/${activity.id}`
        : `${API_CONFIG.BASE_URL}/user/activities`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(activityData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (errorData.error?.includes('limite') || errorData.error?.includes('limit')) {
          setShowUpgradePrompt(true);
          return;
        }
        throw new Error(errorData.error || `Erro ao ${isEditing ? 'atualizar' : 'criar'} a atividade`);
      }

      toast({
        title: `Atividade ${isEditing ? 'atualizada' : 'criada'}!`,
        description: `A atividade "${title}" foi salva com sucesso.`,
      });
      
      onSuccess();
      onClose();

    } catch (err: any) {
      toast({
        title: "Erro ao salvar atividade",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClose = () => {
    if (isLoading) return;
    setShowUpgradePrompt(false);
    onClose();
  };

  const getActivityOptions = () => [
    { value: 'general', label: 'Geral' },
    { value: 'feeding', label: 'Alimentação' },
    { value: 'sleep', label: 'Sono' },
    { value: 'diaper', label: 'Fralda' },
    { value: 'bath', label: 'Banho' },
    { value: 'play', label: 'Brincadeira' },
    { value: 'medicine', label: 'Remédio' },
  ];

  // Se deve mostrar o prompt de upgrade
  if (showUpgradePrompt) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-2xl">
          <UpgradePrompt
            title="Limite de atividades atingido! 🎯"
            description="Você atingiu o limite de atividades do plano gratuito. Faça upgrade para registrar mais momentos especiais com seu bebê."
            limit="10 atividades/mês (plano gratuito)"
            variant="premium"
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {isViewMode ? 'Ver Atividade' : mode === 'edit' ? 'Editar Atividade' : 'Nova Atividade'}
          </DialogTitle>
          <DialogDescription>
            {isViewMode 
              ? 'Detalhes da atividade registrada'
              : mode === 'edit' 
                ? 'Edite as informações da atividade'
                : 'Registre uma nova atividade do seu bebê'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="type">Tipo</Label>
              <Select value={type} onValueChange={(v) => setType(v as Activity['type'])} disabled={isViewMode}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {getActivityOptions().map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Soneca da tarde"
                required
                readOnly={isViewMode}
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva a atividade..."
              rows={2}
              readOnly={isViewMode}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="date">Data e Hora</Label>
              <Input
                id="date"
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                readOnly={isViewMode}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="duration">Duração (minutos)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                placeholder="Ex: 60"
                readOnly={isViewMode}
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="notes">Notas adicionais</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Alguma observação importante?"
              rows={2}
              readOnly={isViewMode}
            />
          </div>
          
          {!isViewMode && (
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="ghost" onClick={handleClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" className={`${getGradientClass()} text-white`} disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isLoading ? 'Salvando...' : `Salvar Atividade`}
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityModal;
