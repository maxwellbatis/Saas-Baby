import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "@/components/ImageUpload";
import { Baby } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import UpgradePrompt from "./UpgradePrompt";
import { LimiteBebeModal } from "./LimiteBebeModal";

interface AddBabyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: () => void;
}

const AddBabyModal: React.FC<AddBabyModalProps> = ({
  isOpen,
  onClose,
  onAdd
}) => {
  const [babyName, setBabyName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [babyImage, setBabyImage] = useState<File | null>(null);
  const [babyImageUrl, setBabyImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [showLimiteModal, setShowLimiteModal] = useState(false);
  const { toast } = useToast();
  const { theme, getGradientClass } = useTheme();

  // Resetar formulário quando modal abre
  useEffect(() => {
    if (isOpen) {
      setBabyName("");
      setBirthDate("");
      setGender("");
      setBabyImage(null);
      setBabyImageUrl("");
      setShowUpgradePrompt(false);
      setShowLimiteModal(false);
    }
  }, [isOpen]);

  const handleImageSelect = (file: File | null) => {
    console.log('Imagem do bebê selecionada:', file);
    setBabyImage(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setBabyImageUrl(url);
      console.log('URL da imagem do bebê:', url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      let photoUrl = "";
      
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

      const res = await fetch("http://localhost:3000/api/user/babies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: babyName,
          birthDate,
          gender,
          photoUrl,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (errorData.error?.includes('limite') || errorData.error?.includes('limit')) {
          setShowLimiteModal(true);
          return;
        }
        throw new Error(errorData.error || "Erro ao cadastrar bebê");
      }
      
      toast({
        title: "Bebê adicionado com sucesso!",
        description: `Bem-vindo(a) ${babyName} ao Baby Diary! 🎉`,
      });
      
      // Limpar formulário
      setBabyName("");
      setBirthDate("");
      setGender("");
      setBabyImage(null);
      setBabyImageUrl("");
      
      // Fechar modal e atualizar
      onAdd();
    } catch (err: any) {
      toast({
        title: "Erro ao adicionar bebê",
        description: err.message || "Erro ao processar requisição",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Limpar formulário ao fechar
    setBabyName("");
    setBirthDate("");
    setGender("");
    setBabyImage(null);
    setBabyImageUrl("");
    setShowUpgradePrompt(false);
    setShowLimiteModal(false);
    onClose();
  };

  // Não renderizar se modal não está aberto
  if (!isOpen) return null;

  // Renderiza o modal de limite se o estado for true
  if (showLimiteModal) {
    return <LimiteBebeModal open={showLimiteModal} onClose={handleClose} />;
  }

  // Se deve mostrar o prompt de upgrade
  if (showUpgradePrompt) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-2xl">
          <UpgradePrompt
            title="Limite de bebês atingido! 🍼"
            description="Você atingiu o limite de bebês do plano gratuito. Faça upgrade para adicionar mais bebês à sua família."
            limit="5 bebês (plano gratuito)"
            variant="family"
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
            Adicionar Novo Bebê
          </DialogTitle>
          <DialogDescription>
            Adicione as informações do seu pequeno para começar a documentar os momentos especiais
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
              value={babyName}
              onChange={(e) => setBabyName(e.target.value)}
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
              {isLoading ? "Adicionando..." : "Adicionar Bebê"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBabyModal; 