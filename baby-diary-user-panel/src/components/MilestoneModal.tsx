import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ImageUpload from './ImageUpload';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface Milestone {
  id?: string;
  title: string;
  date: string;
  description: string;
  category: string;
  photoUrl?: string;
  babyId: string;
}

interface MilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  milestone?: Milestone;
  mode: 'create' | 'edit' | 'view';
  babyId: string | undefined;
}

const MilestoneModal: React.FC<MilestoneModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  milestone,
  mode,
  babyId
}) => {
  const { getGradientClass } = useTheme();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('motor');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isViewMode = mode === 'view';

  useEffect(() => {
    if (milestone) {
      setTitle(milestone.title);
      setDescription(milestone.description);
      setDate(new Date(milestone.date).toISOString().split('T')[0]);
      setCategory(milestone.category || 'motor');
      setPhotoUrl(milestone.photoUrl);
    } else {
      setTitle('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setCategory('motor');
      setPhotoUrl(undefined);
      setImageFile(null);
    }
  }, [milestone, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewMode) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      let finalPhotoUrl = photoUrl;
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        formData.append("folder", "milestones");
        const uploadRes = await fetch("http://localhost:3000/api/upload/image", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          throw new Error(errorData.error || "Erro ao fazer upload da foto");
        }
        const uploadData = await uploadRes.json();
        finalPhotoUrl = uploadData.data?.url;
      }
      const milestoneData = {
        title,
        description,
        date: new Date(date).toISOString(),
        category,
        photoUrl: finalPhotoUrl,
        babyId: babyId,
      };
      const isEditing = mode === 'edit' && milestone?.id;
      const url = isEditing
        ? `http://localhost:3000/api/user/milestones/${milestone.id}`
        : 'http://localhost:3000/api/user/milestones';
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(milestoneData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Erro ao ${isEditing ? 'atualizar' : 'criar'} o marco`);
      }
      toast({
        title: `Marco ${isEditing ? 'atualizado' : 'criado'}!`,
        description: `O marco "${title}" foi salvo com sucesso.`,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      toast({
        title: "Erro ao salvar marco",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (file: File | null) => {
    setImageFile(file);
    if (file) {
      setPhotoUrl(URL.createObjectURL(file));
    }
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setPhotoUrl(milestone?.photoUrl);
  };

  const handleClose = () => {
    if (isLoading) return;
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg" onPointerDownOutside={(e) => {
        if (isLoading) e.preventDefault();
      }}>
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {mode === 'create' && 'Novo Marco'}
            {mode === 'edit' && 'Editar Marco'}
            {mode === 'view' && 'Visualizar Marco'}
          </DialogTitle>
          <DialogDescription>
            {isViewMode ? 'Detalhes do marco registrado.' : 'Preencha os dados do marco do seu bebê.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="flex justify-center">
            <ImageUpload
              currentImage={photoUrl}
              onImageSelect={handleImageSelect}
              onImageRemove={handleImageRemove}
              size="lg"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Primeiro Passo"
              required
              readOnly={isViewMode}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              readOnly={isViewMode}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="category">Categoria</Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              disabled={isViewMode}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              <option value="motor">Motor</option>
              <option value="cognitive">Cognitivo</option>
              <option value="social">Social</option>
              <option value="language">Linguagem</option>
              <option value="general">Outro</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva este marco importante..."
              rows={4}
              required
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
                {isLoading ? 'Salvando...' : `Salvar Marco`}
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MilestoneModal;
