import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
import ImageUpload from './ImageUpload';
import { User } from 'lucide-react';
import { API_CONFIG } from '../config/api';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUpdate: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdate
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { theme, getGradientClass } = useTheme();

  // Atualizar estados quando o usuário muda ou modal abre
  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || '');
      setEmail(user.email || '');
      setProfileImageUrl(user.avatarUrl || '');
      setProfileImage(null);
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      let avatarUrl = profileImageUrl;
      
      // Se há uma nova imagem, fazer upload
      if (profileImage) {
        console.log('EditProfileModal: Fazendo upload da nova imagem...');
        const formData = new FormData();
        formData.append("image", profileImage);
        const uploadRes = await fetch(`${API_CONFIG.BASE_URL}/upload/image`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!uploadRes.ok) throw new Error("Erro ao fazer upload da foto");
        const uploadData = await uploadRes.json();
        avatarUrl = uploadData.data?.url || "";
        console.log('EditProfileModal: Upload concluído, URL:', avatarUrl);
      }

      console.log('EditProfileModal: Atualizando perfil com dados:', { name, avatarUrl });

      // Atualizar perfil na API
      const res = await fetch(`${API_CONFIG.BASE_URL}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          avatarUrl,
        }),
      });

      if (!res.ok) throw new Error("Erro ao atualizar perfil");
      
      const responseData = await res.json();
      console.log('EditProfileModal: Resposta da API:', responseData);
      
      toast({
        title: "Perfil atualizado com sucesso!",
        description: "Suas informações foram salvas com sucesso.",
      });
      
      // Forçar atualização do contexto
      console.log('EditProfileModal: Chamando onUpdate para atualizar contexto...');
      onUpdate();
      onClose();
    } catch (err: any) {
      console.error('EditProfileModal: Erro:', err);
      toast({
        title: "Erro ao atualizar perfil",
        description: err.message || "Erro ao processar requisição",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (file: File | null) => {
    console.log('Imagem de perfil selecionada:', file);
    setProfileImage(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setProfileImageUrl(url);
      console.log('URL da imagem de perfil:', url);
    }
  };

  const handleClose = () => {
    // Resetar estados ao fechar
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setProfileImageUrl(user.avatarUrl || '');
      setProfileImage(null);
    }
    onClose();
  };

  // Não renderizar se não há usuário ou modal não está aberto
  if (!user || !isOpen) return null;

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
            <User className="w-5 h-5" />
            Editar Perfil
          </DialogTitle>
          <DialogDescription>
            Atualize suas informações pessoais e foto de perfil
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center">
            <ImageUpload
              currentImage={profileImageUrl}
              onImageSelect={handleImageSelect}
              size="lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nome completo *
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Seu nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={`border-muted-foreground/20 focus:border-${theme === 'blue' ? 'blue' : 'pink'}-400 focus:ring-${theme === 'blue' ? 'blue' : 'pink'}-400/20`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              E-mail *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled // E-mail não pode ser alterado
              className={`border-muted-foreground/20 focus:border-${theme === 'blue' ? 'blue' : 'pink'}-400 focus:ring-${theme === 'blue' ? 'blue' : 'pink'}-400/20 bg-gray-50`}
            />
            <p className="text-xs text-muted-foreground">
              O e-mail não pode ser alterado por questões de segurança
            </p>
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
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
