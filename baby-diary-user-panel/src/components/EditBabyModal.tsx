import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
import ImageUpload from './ImageUpload';
import { Baby } from 'lucide-react';
import GrowthMeasurements from './GrowthMeasurements';

interface EditBabyModalProps {
  isOpen: boolean;
  onClose: () => void;
  baby: any;
  onUpdate: () => void;
}

const EditBabyModal: React.FC<EditBabyModalProps> = ({
  isOpen,
  onClose,
  baby,
  onUpdate
}) => {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [babyImage, setBabyImage] = useState<File | null>(null);
  const [babyImageUrl, setBabyImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { theme, getGradientClass } = useTheme();

  // Atualizar estados quando o bebê muda ou modal abre
  useEffect(() => {
    if (baby && isOpen) {
      setName(baby.name || '');
      setBirthDate(baby.birthDate ? new Date(baby.birthDate).toISOString().split('T')[0] : '');
      setGender(baby.gender || '');
      setBabyImageUrl(baby.photoUrl || '');
      setBabyImage(null);
    }
  }, [baby, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      let photoUrl = babyImageUrl;
      
      // Se há uma nova imagem, fazer upload
      if (babyImage) {
        const formData = new FormData();
        formData.append("image", babyImage);
        const uploadRes = await fetch("http://localhost:3000/api/upload/image", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!uploadRes.ok) throw new Error("Erro ao fazer upload da foto");
        const uploadData = await uploadRes.json();
        photoUrl = uploadData.data?.url || "";
      }

      // Atualizar bebê na API
      const res = await fetch(`http://localhost:3000/api/user/babies/${baby.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          birthDate,
          gender,
          photoUrl,
        }),
      });

      if (!res.ok) throw new Error("Erro ao atualizar bebê");
      
      toast({
        title: "Bebê atualizado com sucesso!",
        description: "As informações foram salvas com sucesso.",
      });
      
      onUpdate();
      onClose();
    } catch (err: any) {
      toast({
        title: "Erro ao atualizar bebê",
        description: err.message || "Erro ao processar requisição",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (file: File | null) => {
    console.log('Imagem selecionada:', file);
    setBabyImage(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setBabyImageUrl(url);
      console.log('URL da imagem:', url);
    }
  };

  const handleClose = () => {
    // Resetar estados ao fechar
    if (baby) {
      setName(baby.name || '');
      setBirthDate(baby.birthDate ? new Date(baby.birthDate).toISOString().split('T')[0] : '');
      setGender(baby.gender || '');
      setBabyImageUrl(baby.photoUrl || '');
      setBabyImage(null);
    }
    onClose();
  };

  // Não renderizar se não há bebê ou modal não está aberto
  if (!baby || !isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Só permitir fechar se não estiver carregando
      if (!isLoading) {
        handleClose();
      }
    }}>
      <DialogContent className="sm:max-w-lg" onPointerDownOutside={(e) => {
        // Prevenir fechamento ao clicar fora se estiver carregando
        if (isLoading) {
          e.preventDefault();
        }
      }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Baby className="w-5 h-5" />
            Editar {baby.name}
          </DialogTitle>
          <DialogDescription>
            Atualize as informações do seu bebê
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center">
            <ImageUpload
              currentImage={babyImageUrl}
              onImageSelect={handleImageSelect}
              size="lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="babyName" className="text-sm font-medium">
              Nome do bebê *
            </Label>
            <Input
              id="babyName"
              type="text"
              placeholder="Nome do seu bebê"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={`border-muted-foreground/20 focus:border-${theme === 'blue' ? 'blue' : 'pink'}-400 focus:ring-${theme === 'blue' ? 'blue' : 'pink'}-400/20`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate" className="text-sm font-medium">
              Data de nascimento *
            </Label>
            <Input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
              className={`border-muted-foreground/20 focus:border-${theme === 'blue' ? 'blue' : 'pink'}-400 focus:ring-${theme === 'blue' ? 'blue' : 'pink'}-400/20`}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Sexo *</Label>
            <div className="flex gap-3">
              {[
                { value: "male", label: "Menino", gradient: "baby-gradient-blue" },
                { value: "female", label: "Menina", gradient: "baby-gradient-pink" },
                { value: "other", label: "Outro", gradient: "baby-gradient-lavender" }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setGender(option.value)}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-300 ${
                    gender === option.value
                      ? `${option.gradient} text-white border-transparent shadow-lg`
                      : `bg-white/50 border-muted text-muted-foreground hover:border-${theme === 'blue' ? 'blue' : 'pink'}-300`
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className={`flex-1 ${getGradientClass()} text-white font-medium hover:shadow-lg transition-all duration-300 border-0`}
              disabled={isLoading}
            >
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
        {/* Medidas de Crescimento */}
        {baby?.id && (
          <div className="mt-6">
            <h4 className="text-md font-semibold mb-2">Histórico de Medidas</h4>
            <GrowthMeasurements babyId={baby.id} canEdit={true} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditBabyModal;
