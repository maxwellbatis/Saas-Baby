import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';

interface AdModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
  loading?: boolean;
}

export const AdModal: React.FC<AdModalProps> = ({ open, onClose, onSave, initialData, loading }) => {
  const [form, setForm] = useState<any>({
    title: '',
    platform: '',
    adType: '',
    copyShort: '',
    copyLong: '',
    headline: '',
    description: '',
    cta: '',
    imageUrl: '',
    videoUrl: '',
    targetAudience: '',
    interests: '',
    budget: ''
  });

  useEffect(() => {
    if (initialData) setForm(initialData);
    else setForm({
      title: '', platform: '', adType: '', copyShort: '', copyLong: '', headline: '', description: '', cta: '', imageUrl: '', videoUrl: '', targetAudience: '', interests: '', budget: ''
    });
  }, [initialData, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar Anúncio' : 'Novo Anúncio'}</DialogTitle>
          <DialogDescription>Preencha os dados do anúncio.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Título</label>
            <Input name="title" value={form.title} onChange={handleChange} required />
          </div>
          <div>
            <label className="text-sm font-medium">Plataforma</label>
            <Input name="platform" value={form.platform} onChange={handleChange} placeholder="Ex: Instagram, Facebook" />
          </div>
          <div>
            <label className="text-sm font-medium">Tipo de Anúncio</label>
            <Input name="adType" value={form.adType} onChange={handleChange} placeholder="Ex: Imagem, Vídeo" />
          </div>
          <div>
            <label className="text-sm font-medium">Headline</label>
            <Input name="headline" value={form.headline} onChange={handleChange} />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Copy Curta</label>
            <Textarea name="copyShort" value={form.copyShort} onChange={handleChange} maxLength={125} />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Copy Longa</label>
            <Textarea name="copyLong" value={form.copyLong} onChange={handleChange} maxLength={500} />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Descrição</label>
            <Textarea name="description" value={form.description} onChange={handleChange} maxLength={2000} />
          </div>
          <div>
            <label className="text-sm font-medium">Call-to-Action</label>
            <Input name="cta" value={form.cta} onChange={handleChange} />
          </div>
          <div>
            <label className="text-sm font-medium">Imagem (URL)</label>
            <Input name="imageUrl" value={form.imageUrl} onChange={handleChange} />
          </div>
          <div>
            <label className="text-sm font-medium">Vídeo (URL)</label>
            <Input name="videoUrl" value={form.videoUrl} onChange={handleChange} />
          </div>
          <div>
            <label className="text-sm font-medium">Público Alvo</label>
            <Input name="targetAudience" value={form.targetAudience} onChange={handleChange} />
          </div>
          <div>
            <label className="text-sm font-medium">Interesses</label>
            <Input name="interests" value={form.interests} onChange={handleChange} placeholder="Separe por vírgula" />
          </div>
          <div>
            <label className="text-sm font-medium">Orçamento (R$)</label>
            <Input name="budget" value={form.budget} onChange={handleChange} type="number" min="0" />
          </div>
          <div className="md:col-span-2 flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : (initialData ? 'Salvar' : 'Criar')}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 