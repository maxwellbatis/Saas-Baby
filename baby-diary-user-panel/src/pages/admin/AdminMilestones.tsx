import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { adminApi } from '../../lib/adminApi';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';

interface SuggestedMilestone {
  id: string;
  title: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
  icon?: string;
}

const ICON_OPTIONS = [
  '👶', '🏆', '⭐', '🎯', '🍼', '🚼', '🏅', '🥇', '🎉', '📸', '💡', '🧠', '🦶', '🗣️', '🤝', '🧩'
];

export const AdminMilestones: React.FC = () => {
  const [milestones, setMilestones] = useState<SuggestedMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedMilestone, setSelectedMilestone] = useState<SuggestedMilestone | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMilestones();
  }, []);

  const fetchMilestones = async () => {
    try {
      setLoading(true);
      const response = await adminApi.get('/admin/suggested-milestones');
      if (response.data.success) {
        setMilestones(response.data.data);
      } else {
        setError(response.data.error || 'Erro ao carregar marcos sugeridos');
      }
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (milestone: SuggestedMilestone | null = null) => {
    setSelectedMilestone(milestone ? { ...milestone } : { id: '', title: '', category: '', sortOrder: 0, isActive: true, icon: '' });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedMilestone) return;

    try {
      let response;
      if (selectedMilestone.id) {
        // Atualizar
        response = await adminApi.put(`/admin/suggested-milestones/${selectedMilestone.id}`, selectedMilestone);
      } else {
        // Criar
        const { id, ...createData } = selectedMilestone;
        response = await adminApi.post('/admin/suggested-milestones', createData);
      }

      if (response.data.success) {
        toast({ title: "Sucesso!", description: `Marco ${selectedMilestone.id ? 'atualizado' : 'criado'} com sucesso.` });
        setIsModalOpen(false);
        fetchMilestones();
      } else {
        toast({ variant: "destructive", title: "Erro", description: response.data.error || 'Não foi possível salvar o marco.' });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Erro de Conexão", description: "Não foi possível conectar ao servidor." });
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      const response = await adminApi.delete(`/admin/suggested-milestones/${id}`);
      if (response.data.success) {
        toast({ title: "Sucesso!", description: "Marco deletado com sucesso." });
        fetchMilestones();
      } else {
        toast({ variant: "destructive", title: "Erro", description: response.data.error || 'Não foi possível deletar o marco.' });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Erro de Conexão", description: "Não foi possível conectar ao servidor." });
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Marcos Sugeridos</CardTitle>
            <CardDescription>Gerencie os modelos de marcos de desenvolvimento.</CardDescription>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Marco
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Ícone</TableHead>
                <TableHead>Ordem</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {milestones.map((milestone) => (
                <TableRow key={milestone.id}>
                  <TableCell className="font-medium">{milestone.title}</TableCell>
                  <TableCell>{milestone.category}</TableCell>
                  <TableCell>{milestone.icon}</TableCell>
                  <TableCell>{milestone.sortOrder}</TableCell>
                  <TableCell>
                    <Badge variant={milestone.isActive ? 'default' : 'secondary'}>
                      {milestone.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenModal(milestone)}>
                          <Edit className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(milestone.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Deletar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedMilestone?.id ? 'Editar Marco' : 'Criar Novo Marco'}</DialogTitle>
            <DialogDescription>
              Preencha os detalhes do marco sugerido.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Título</Label>
              <Input id="title" value={selectedMilestone?.title || ''} onChange={(e) => setSelectedMilestone(prev => ({...prev!, title: e.target.value}))} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Categoria</Label>
              <Input id="category" value={selectedMilestone?.category || ''} onChange={(e) => setSelectedMilestone(prev => ({...prev!, category: e.target.value}))} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="icon" className="text-right">Ícone</Label>
              <div className="col-span-3 flex flex-col gap-2">
                <div className="flex flex-wrap gap-1 mb-1">
                  {ICON_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className={`text-2xl p-1 rounded border ${selectedMilestone?.icon === emoji ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                      onClick={() => setSelectedMilestone(prev => ({...prev!, icon: emoji}))}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <Input
                  id="icon"
                  placeholder="Ex: 👶"
                  value={selectedMilestone?.icon || ''}
                  onChange={(e) => setSelectedMilestone(prev => ({...prev!, icon: e.target.value}))}
                  className="w-24"
                  maxLength={2}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sortOrder" className="text-right">Ordem</Label>
              <Input id="sortOrder" type="number" value={selectedMilestone?.sortOrder || 0} onChange={(e) => setSelectedMilestone(prev => ({...prev!, sortOrder: parseInt(e.target.value, 10)}))} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isActive" className="text-right">Ativo</Label>
              <Switch id="isActive" checked={selectedMilestone?.isActive} onCheckedChange={(checked) => setSelectedMilestone(prev => ({...prev!, isActive: checked}))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}; 