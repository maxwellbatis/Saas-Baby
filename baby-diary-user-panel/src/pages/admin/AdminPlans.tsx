import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { adminPlans } from '../../lib/adminApi';
import { CheckCircle, Edit2, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '../../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Plan {
  id: string;
  name: string;
  price: number;
  yearlyPrice?: number | null;
  userLimit?: number | null;
  memoryLimit?: number | null;
  milestoneLimit?: number | null;
  activityLimit?: number | null;
  aiLimit?: number | null;
  isActive: boolean;
}

function formatLimit(limit: number | null | undefined, unidade: string = '') {
  if (limit === null || limit === undefined) return '—';
  if (limit >= 999) return 'Ilimitado';
  if (unidade) return `${limit}/${unidade}`;
  return `${limit}`;
}

export const AdminPlans: React.FC = () => {
  const queryClient = useQueryClient();

  // Modal state
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState<Partial<Plan>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Buscar planos com React Query
  const {
    data: plans = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['adminPlans'],
    queryFn: async () => {
      const response = await adminPlans.getAll();
      return response.data || response.plans || [];
    },
    staleTime: 1000 * 60 * 10,
  });

  // Mutação para editar plano
  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Plan> }) => {
      return await adminPlans.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPlans'] });
      toast({ title: 'Plano atualizado com sucesso!' });
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      toast({ title: 'Ocorreu um erro ao salvar.', description: err.message, variant: 'destructive' });
    },
    onSettled: () => setIsSaving(false),
  });

  // Mutação para deletar plano
  const deletePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      return await adminPlans.delete(planId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPlans'] });
      toast({ title: 'Plano excluído com sucesso!' });
    },
    onError: (err: any) => {
      toast({ title: 'Ocorreu um erro ao excluir.', description: err.message, variant: 'destructive' });
    },
  });

  const handleEditClick = (plan: Plan) => {
    setSelectedPlan(plan);
    setFormData({ ...plan });
    setIsModalOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const isNumberField = ['price', 'yearlyPrice', 'userLimit', 'memoryLimit', 'milestoneLimit', 'activityLimit', 'aiLimit'].includes(name);
    setFormData({
      ...formData,
      [name]: isNumberField ? (value === '' ? null : Number(value)) : value,
    });
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      if (!selectedPlan) {
        throw new Error('Nenhum plano selecionado para edição.');
      }
      const { id, ...dataToUpdate } = formData;
      updatePlanMutation.mutate({ id: selectedPlan.id, data: dataToUpdate });
    } catch (err: any) {
      toast({ title: 'Ocorreu um erro ao salvar.', description: err.message, variant: 'destructive' });
      setIsSaving(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    deletePlanMutation.mutate(planId);
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <div>
        <div className="mb-6 flex justify-between items-center">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Planos</CardTitle>
              <CardDescription>Gerencie os 3 planos padrão do sistema (Básico, Premium e Família).</CardDescription>
            </CardHeader>
          </Card>
        </div>
        {isLoading ? (
          <p>Carregando planos...</p>
        ) : error ? (
          <p className="text-red-500">{error.message || error.toString()}</p>
        ) : (
          <div className="flex flex-wrap gap-6 justify-center">
            {plans.map((plan) => {
              const isFree = plan.price === 0;
              return (
                <div
                  key={plan.id}
                  className={`relative w-full max-w-xs bg-white rounded-2xl shadow-lg border-2 ${isFree ? 'border-blue-400' : 'border-gray-200'} flex flex-col items-center p-6 transition-transform hover:scale-105`}
                >
                  {isFree && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-3 py-1 rounded-full shadow font-bold">Gratuito</span>
                  )}
                  <h3 className="text-xl font-bold text-center mb-1">{plan.name}</h3>
                  <div className="text-2xl font-extrabold text-blue-600 mb-2">
                    {isFree ? 'R$ 0' : `R$ ${plan.price.toFixed(2)}`}
                    {plan.price > 0 && <span className="text-base font-normal text-gray-500">/mês</span>}
                  </div>
                  <ul className="text-sm text-gray-700 mb-4 space-y-1 w-full">
                    <li className="flex items-center gap-2"><CheckCircle className="text-green-500 w-4 h-4" /> {formatLimit(plan.userLimit)} bebê(s)</li>
                    <li className="flex items-center gap-2"><CheckCircle className="text-green-500 w-4 h-4" /> {formatLimit(plan.memoryLimit, 'mês')} memórias</li>
                    <li className="flex items-center gap-2"><CheckCircle className="text-green-500 w-4 h-4" /> {formatLimit(plan.milestoneLimit, 'mês')} marcos</li>
                    <li className="flex items-center gap-2"><CheckCircle className="text-green-500 w-4 h-4" /> {formatLimit(plan.activityLimit, 'mês')} atividades</li>
                    <li className="flex items-center gap-2"><CheckCircle className="text-green-500 w-4 h-4" /> {formatLimit(plan.aiLimit, 'semana')} interações IA</li>
                  </ul>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={() => handleEditClick(plan)} size="sm" variant={isFree ? 'default' : 'outline'} className="w-full flex items-center gap-2 justify-center">
                      <Edit2 className="w-4 h-4" /> Editar
                    </Button>
                    {!['Básico', 'Premium 👑', 'Família 👨‍👩‍👧‍👦'].includes(plan.name) ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive" className="w-full flex items-center gap-2 justify-center">
                            <Trash2 className="w-4 h-4" /> Excluir
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Isso excluirá permanentemente o plano "{plan.name}".
                              A exclusão falhará se houver usuários ou assinaturas ativas neste plano.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeletePlan(plan.id)}>Excluir</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <Button size="sm" variant="outline" disabled className="w-full flex items-center gap-2 justify-center opacity-50">
                        <Trash2 className="w-4 h-4" /> Protegido
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Plano</DialogTitle>
          <DialogDescription>
            Ajuste os preços e limites do plano: {selectedPlan?.name}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Nome</Label>
            <Input id="name" name="name" value={formData.name ?? ''} disabled className="col-span-3 bg-gray-100" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">Preço Mensal</Label>
            <Input id="price" name="price" type="number" step="0.01" value={formData.price ?? ''} onChange={handleFormChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="yearlyPrice" className="text-right">Preço Anual</Label>
            <Input id="yearlyPrice" name="yearlyPrice" type="number" step="0.01" value={formData.yearlyPrice ?? ''} onChange={handleFormChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="userLimit" className="text-right">Bebês</Label>
            <Input id="userLimit" name="userLimit" type="number" value={formData.userLimit ?? ''} onChange={handleFormChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="memoryLimit" className="text-right">Memórias/mês</Label>
            <Input id="memoryLimit" name="memoryLimit" type="number" value={formData.memoryLimit ?? ''} onChange={handleFormChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="milestoneLimit" className="text-right">Marcos/mês</Label>
            <Input id="milestoneLimit" name="milestoneLimit" type="number" value={formData.milestoneLimit ?? ''} onChange={handleFormChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="activityLimit" className="text-right">Atividades/mês</Label>
            <Input id="activityLimit" name="activityLimit" type="number" value={formData.activityLimit ?? ''} onChange={handleFormChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="aiLimit" className="text-right">IA/semana</Label>
            <Input id="aiLimit" name="aiLimit" type="number" value={formData.aiLimit ?? ''} onChange={handleFormChange} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 