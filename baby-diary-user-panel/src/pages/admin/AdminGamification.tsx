import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Edit, Trash2, Trophy, Target, Star, Zap } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { adminApi } from '../../lib/adminApi';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

interface GamificationRule {
  id: string;
  name: string;
  description: string;
  points: number;
  condition: string;
  badgeIcon?: string;
  category: string;
  isActive: boolean;
  sortOrder: number;
}

const CATEGORIES = [
  { value: 'daily', label: 'Diário' },
  { value: 'milestone', label: 'Marco' },
  { value: 'special', label: 'Especial' },
  { value: 'streak', label: 'Sequência' },
];

const CONDITION_OPTIONS = [
  { value: 'login', label: 'Login' },
  { value: 'first_login', label: 'Primeiro Login' },
  { value: 'login_streak_7', label: 'Login 7 dias seguidos' },
  { value: 'login_streak_30', label: 'Login 30 dias seguidos' },
  { value: 'first_baby', label: 'Primeiro Bebê' },
  { value: 'memory_created', label: 'Memória Criada' },
  { value: 'memories_10', label: '10 Memórias' },
  { value: 'milestone_recorded', label: 'Marco Registrado' },
  { value: 'activity_created', label: 'Atividade Criada' },
  { value: 'activities_5', label: '5 Atividades' },
  { value: 'photo_uploaded', label: 'Foto Enviada' },
  { value: 'any', label: 'Qualquer Ação' },
];

const BADGE_ICONS = [
  '🏆', '⭐', '🎯', '👶', '🍼', '🚼', '🏅', '🥇', '🎉', '📸', '💡', '🧠', '🦶', '🗣️', '🤝', '🧩', '🔥', '💎', '🌟', '🎖️'
];

export const AdminGamification: React.FC = () => {
  const [rules, setRules] = useState<GamificationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedRule, setSelectedRule] = useState<GamificationRule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await adminApi.get('/admin/gamification-rules');
      if (response.data.success) {
        setRules(response.data.data);
      } else {
        setError(response.data.error || 'Erro ao carregar regras de gamificação');
      }
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (rule: GamificationRule | null = null) => {
    setSelectedRule(rule ? { ...rule } : { 
      id: '', 
      name: '', 
      description: '', 
      points: 0, 
      condition: '', 
      badgeIcon: '', 
      category: 'daily', 
      isActive: true, 
      sortOrder: 0 
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedRule) return;

    try {
      let response;
      if (selectedRule.id) {
        // Atualizar
        response = await adminApi.put(`/admin/gamification-rules/${selectedRule.id}`, selectedRule);
      } else {
        // Criar
        const { id, ...createData } = selectedRule;
        response = await adminApi.post('/admin/gamification-rules', createData);
      }

      if (response.data.success) {
        toast({ 
          title: "Sucesso!", 
          description: `Regra ${selectedRule.id ? 'atualizada' : 'criada'} com sucesso.` 
        });
        setIsModalOpen(false);
        fetchRules();
      } else {
        toast({ 
          variant: "destructive", 
          title: "Erro", 
          description: response.data.error || 'Não foi possível salvar a regra.' 
        });
      }
    } catch (err) {
      toast({ 
        variant: "destructive", 
        title: "Erro de Conexão", 
        description: "Não foi possível conectar ao servidor." 
      });
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      const response = await adminApi.delete(`/admin/gamification-rules/${id}`);
      if (response.data.success) {
        toast({ title: "Sucesso!", description: "Regra deletada com sucesso." });
        fetchRules();
      } else {
        toast({ 
          variant: "destructive", 
          title: "Erro", 
          description: response.data.error || 'Não foi possível deletar a regra.' 
        });
      }
    } catch (err) {
      toast({ 
        variant: "destructive", 
        title: "Erro de Conexão", 
        description: "Não foi possível conectar ao servidor." 
      });
    }
  };

  const getCategoryLabel = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.label || category;
  };

  const getConditionLabel = (condition: string) => {
    return CONDITION_OPTIONS.find(c => c.value === condition)?.label || condition;
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <div className="space-y-6">
        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Regras</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rules.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Regras Ativas</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rules.filter(r => r.isActive).length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pontos</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rules.reduce((sum, r) => sum + r.points, 0)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorias</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Set(rules.map(r => r.category)).size}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de regras */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Regras de Gamificação</CardTitle>
              <CardDescription>Gerencie as regras e badges do sistema de gamificação.</CardDescription>
            </div>
            <Button onClick={() => handleOpenModal()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Regra
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Condição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Pontos</TableHead>
                  <TableHead>Ícone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{rule.description}</TableCell>
                    <TableCell>{getConditionLabel(rule.condition)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getCategoryLabel(rule.category)}</Badge>
                    </TableCell>
                    <TableCell>{rule.points}</TableCell>
                    <TableCell className="text-2xl">{rule.badgeIcon || '🏆'}</TableCell>
                    <TableCell>
                      <Badge variant={rule.isActive ? "default" : "secondary"}>
                        {rule.isActive ? "Ativo" : "Inativo"}
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
                          <DropdownMenuItem onClick={() => handleOpenModal(rule)}>
                            <Edit className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(rule.id)}>
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
      </div>

      {/* Modal de criação/edição */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedRule?.id ? 'Editar Regra' : 'Criar Nova Regra'}</DialogTitle>
            <DialogDescription>
              Configure uma nova regra de gamificação ou badge.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Regra</Label>
                <Input
                  id="name"
                  value={selectedRule?.name || ''}
                  onChange={(e) => setSelectedRule(prev => ({...prev!, name: e.target.value}))}
                  placeholder="Ex: Login Diário"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="points">Pontos</Label>
                <Input
                  id="points"
                  type="number"
                  value={selectedRule?.points || 0}
                  onChange={(e) => setSelectedRule(prev => ({...prev!, points: parseInt(e.target.value, 10)}))}
                  placeholder="10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={selectedRule?.description || ''}
                onChange={(e) => setSelectedRule(prev => ({...prev!, description: e.target.value}))}
                placeholder="Descreva a regra ou badge..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="condition">Condição</Label>
                <Select
                  value={selectedRule?.condition || ''}
                  onValueChange={(value) => setSelectedRule(prev => ({...prev!, condition: value}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma condição" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={selectedRule?.category || 'daily'}
                  onValueChange={(value) => setSelectedRule(prev => ({...prev!, category: value}))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ícone do Badge</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {BADGE_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    className={`text-2xl p-2 rounded border ${selectedRule?.badgeIcon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    onClick={() => setSelectedRule(prev => ({...prev!, badgeIcon: icon}))}
                  >
                    {icon}
                  </button>
                ))}
              </div>
              <Input
                placeholder="Ou digite um emoji"
                value={selectedRule?.badgeIcon || ''}
                onChange={(e) => setSelectedRule(prev => ({...prev!, badgeIcon: e.target.value}))}
                maxLength={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sortOrder">Ordem</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={selectedRule?.sortOrder || 0}
                  onChange={(e) => setSelectedRule(prev => ({...prev!, sortOrder: parseInt(e.target.value, 10)}))}
                  placeholder="0"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={selectedRule?.isActive}
                  onCheckedChange={(checked) => setSelectedRule(prev => ({...prev!, isActive: checked}))}
                />
                <Label htmlFor="isActive">Regra Ativa</Label>
              </div>
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