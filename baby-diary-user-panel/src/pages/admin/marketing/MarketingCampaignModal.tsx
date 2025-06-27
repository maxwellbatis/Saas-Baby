import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';

export interface CampaignFormType {
  name: string;
  type: string;
  subject?: string;
  segment: string;
  scheduledAt?: string;
  content: string;
}

interface MarketingCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: boolean;
  form: CampaignFormType;
  setForm: (form: CampaignFormType) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const MarketingCampaignModal: React.FC<MarketingCampaignModalProps> = ({
  open,
  onOpenChange,
  editing,
  form,
  setForm,
  onSave,
  onCancel
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar Campanha' : 'Nova Campanha'}</DialogTitle>
          <DialogDescription>
            Preencha os dados da campanha. Use a IA para gerar conteúdo se desejar.
          </DialogDescription>
        </DialogHeader>
        {/* Formulário da campanha */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Nome da Campanha</label>
            <input
              className="border p-2 w-full rounded mt-1"
              placeholder="Nome"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Tipo</label>
            <select
              className="border p-2 w-full rounded mt-1"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="email">Email</option>
              <option value="push">Push</option>
              <option value="sms">SMS</option>
              <option value="inapp">In-App</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Assunto (para email)</label>
            <input
              className="border p-2 w-full rounded mt-1"
              placeholder="Assunto"
              value={form.subject || ''}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Segmento</label>
            <input
              className="border p-2 w-full rounded mt-1"
              placeholder="Ex: novas_mamaes, premium"
              value={form.segment}
              onChange={(e) => setForm({ ...form, segment: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Data Agendada</label>
            <input
              type="datetime-local"
              className="border p-2 w-full rounded mt-1"
              value={form.scheduledAt || ''}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="text-sm font-medium">Conteúdo</label>
          <Textarea
            className="min-h-[200px]"
            placeholder="Conteúdo da campanha..."
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
        </div>
        <div className="flex gap-2 mt-4">
          <Button onClick={onSave} className="flex-1">
            {editing ? 'Atualizar' : 'Criar'} Campanha
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 