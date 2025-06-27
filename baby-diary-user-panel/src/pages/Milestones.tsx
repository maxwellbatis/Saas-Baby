import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth, useGamification } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PlusCircle, MoreVertical, Image as ImageIcon, Trash2, Edit, Eye, Baby, Star, Award, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import BackButton from '@/components/BackButton';
import Header from '@/components/Header';
import MilestoneModal from '@/components/MilestoneModal';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ImageUpload from '@/components/ImageUpload';
import PredictedMilestonesCard from '../components/PredictedMilestonesCard';
import { API_CONFIG } from '../config/api';
import { AchievementNotification } from '@/components/AchievementNotification';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface Milestone {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  photoUrl?: string;
  babyId: string;
}

interface SuggestedMilestone {
  id: string;
  title: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
  icon?: string;
}

const Milestones = () => {
  const { currentBaby, isLoading: isAuthLoading, refetch } = useAuth();
  const { getGradientClass, theme } = useTheme();
  const { toast } = useToast();
  const { fetchGamificationData, gamification } = useGamification();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | undefined>(undefined);
  const [selectedSuggested, setSelectedSuggested] = useState<SuggestedMilestone | null>(null);
  type ModalMode = 'create' | 'edit' | 'view' | 'create-from-suggested';
  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [suggestedImageFile, setSuggestedImageFile] = useState<File | null>(null);
  const [suggestedPhotoUrl, setSuggestedPhotoUrl] = useState<string | undefined>();
  const [showAchievement, setShowAchievement] = useState(false);
  const [achievementData, setAchievementData] = useState(null);
  const prevLevelRef = useRef<number | null>(null);
  const prevBadgesRef = useRef<string[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const fetchMilestones = async () => {
    if (!currentBaby) return [];
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_CONFIG.BASE_URL}/user/milestones?babyId=${currentBaby.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Falha ao buscar marcos');
    const data = await response.json();
    return Array.isArray(data.data) ? data.data : [];
  };

  const fetchSuggestedMilestones = async () => {
    if (!currentBaby) return [];
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_CONFIG.BASE_URL}/user/milestones/suggested?babyId=${currentBaby.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Falha ao buscar marcos sugeridos');
    const data = await response.json();
    return Array.isArray(data.data) ? data.data : [];
  };

  const {
    data: milestones = [],
    isLoading: milestonesLoading,
    error: milestonesError,
    refetch: refetchMilestones,
  } = useQuery({
    queryKey: ['milestones', currentBaby?.id],
    queryFn: fetchMilestones,
    enabled: !!currentBaby,
    staleTime: 1000 * 60 * 10,
  });

  const {
    data: suggestedMilestones = [],
    isLoading: suggestedLoading,
    error: suggestedError,
    refetch: refetchSuggested,
  } = useQuery({
    queryKey: ['suggestedMilestones', currentBaby?.id],
    queryFn: fetchSuggestedMilestones,
    enabled: !!currentBaby,
    staleTime: 1000 * 60 * 10,
  });

  const handleSuccess = () => {
    refetchMilestones();
    refetchSuggested();
    fetchGamificationData();
  };

  const handleCreateMilestone = () => {
    setSelectedMilestone(undefined);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditMilestone = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewImage = (photoUrl?: string) => {
    if (photoUrl) setViewingImage(photoUrl);
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_CONFIG.BASE_URL}/user/milestones/${milestoneId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao deletar marco');
      }
      toast({
        title: 'Sucesso',
        description: 'Marco removido.'
      });
      refetchMilestones();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível remover o marco.',
        variant: 'destructive',
      });
    }
  };

  const handleAddSuggestedMilestone = (sug: SuggestedMilestone) => {
    setSelectedSuggested(sug);
    setModalMode('create-from-suggested');
    setIsModalOpen(true);
  };

  const handleSubmitSuggestedMilestone = async (fields: { date: string; description: string; }) => {
    if (!selectedSuggested || !currentBaby) return;
    try {
      const token = localStorage.getItem('token');
      let finalPhotoUrl = suggestedPhotoUrl;
      if (suggestedImageFile) {
        const formData = new FormData();
        formData.append('image', suggestedImageFile);
        formData.append('folder', 'milestones');
        const uploadRes = await fetch(`${API_CONFIG.BASE_URL}/upload/image`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          throw new Error(errorData.error || 'Erro ao fazer upload da foto');
        }
        const uploadData = await uploadRes.json();
        finalPhotoUrl = uploadData.data?.url;
      }
      const res = await fetch(`${API_CONFIG.BASE_URL}/user/milestones/from-suggested`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          suggestedMilestoneId: selectedSuggested.id,
          babyId: currentBaby.id,
          date: new Date(fields.date).toISOString(),
          photoUrl: finalPhotoUrl,
          description: fields.description,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erro ao criar marco sugerido');
      }
      toast({
        title: 'Marco sugerido registrado!',
        description: `O marco "${selectedSuggested.title}" foi salvo com sucesso.`,
      });
      refetchMilestones();
      refetchSuggested();
      setIsModalOpen(false);
      setSelectedSuggested(null);
      setSuggestedImageFile(null);
      setSuggestedPhotoUrl(undefined);
    } catch (err: any) {
      toast({
        title: 'Erro ao registrar marco sugerido',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  // Detecta novos badges ou level up após atualização da gamificação
  useEffect(() => {
    if (!gamification) return;
    
    // Detecta level up
    if (
      prevLevelRef.current !== null &&
      gamification.level > prevLevelRef.current
    ) {
      setAchievementData({
        id: `level-${gamification.level}`,
        title: `Nível ${gamification.level}`,
        description: `Parabéns! Você subiu para o nível ${gamification.level}!`,
        icon: 'level-up',
        points: 0,
        type: 'level',
      });
      setShowAchievement(true);
    }
    
    // Detecta novos badges
    if (
      prevBadgesRef.current.length > 0 &&
      gamification.badges.length > prevBadgesRef.current.length
    ) {
      const newBadge = gamification.badges.find(
        (b) => !prevBadgesRef.current.includes(b)
      );
      if (newBadge) {
        setAchievementData({
          id: `badge-${newBadge}`,
          title: `Novo Badge: ${newBadge}`,
          description: 'Você conquistou um novo badge!',
          icon: 'first-milestone',
          points: 0,
          type: 'badge',
        });
        setShowAchievement(true);
      }
    }
    
    prevLevelRef.current = gamification.level;
    prevBadgesRef.current = gamification.badges;
  }, [gamification]);

  // Debounce do campo de busca
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Filtrar marcos pelo título
  const filteredMilestones = useMemo(() => {
    if (!debouncedSearch) return milestones;
    return milestones.filter(m => m.title.toLowerCase().includes(debouncedSearch.toLowerCase()));
  }, [milestones, debouncedSearch]);

  if (milestonesLoading || suggestedLoading || isAuthLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="w-full max-w-full px-2 sm:px-4 py-4 mx-auto flex-1 flex flex-col">
          <div className="flex items-center gap-4 mb-8">
            <BackButton to="/dashboard" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Marcos
            </h1>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!currentBaby) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-baby-blue via-baby-lavender to-baby-mint">
        <Header />
        <div className="w-full max-w-full px-2 sm:px-4 py-4 mx-auto flex-1 flex flex-col items-center justify-center">
          <Baby className="w-16 h-16 mb-4 text-blue-400" />
          <h2 className="text-2xl font-bold mb-2">Acompanhe o desenvolvimento!</h2>
          <p className="text-muted-foreground mb-4 max-w-md text-center">
            Aqui você poderá registrar os marcos do crescimento do seu bebê. Cada conquista é única!
          </p>
          <Card className="mb-6 max-w-xs">
            <CardContent className="p-4 text-center">
              <div className="font-semibold">Primeiro passo</div>
              <div className="text-xs text-muted-foreground">Exemplo de marco</div>
            </CardContent>
          </Card>
          <Button onClick={() => window.history.back()} className="mb-2">Voltar</Button>
          <Button variant="outline" onClick={() => window.location.href = '/settings'}>Adicionar bebê</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme === 'blue' ? 'from-baby-blue via-baby-lavender to-baby-mint' : 'from-baby-pink via-baby-peach to-baby-lavender'}`}>
      {/* Notificação de conquista */}
      <AchievementNotification
        achievement={achievementData}
        isVisible={showAchievement}
        onClose={() => setShowAchievement(false)}
      />
      <Header />
      <div className="w-full max-w-full px-2 sm:px-4 py-4 mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <BackButton to="/dashboard" />
          <h1 className={`text-3xl font-bold bg-gradient-to-r ${theme === 'blue' ? 'from-blue-600 to-cyan-600' : 'from-pink-600 to-purple-600'} bg-clip-text text-transparent`}>
            Marcos de {currentBaby.name}
          </h1>
          <Button onClick={handleCreateMilestone} className={`${getGradientClass()} text-white ml-auto`}>
            <PlusCircle className="mr-2 h-4 w-4" /> Novo Marco
          </Button>
        </div>
        {/* Campo de busca */}
        <div className="mb-6 max-w-md">
          <Input
            type="text"
            placeholder="Buscar marcos por título..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full"
          />
        </div>

        {suggestedMilestones.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-2">Marcos sugeridos</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {suggestedMilestones.map((sug) => (
                <Card key={sug.id} className="group">
                  <CardContent className="p-4 flex flex-col items-center">
                    {sug.icon && <span className="text-4xl mb-2">🎯</span>}
                    <span className="font-semibold">{sug.title}</span>
                    <span className="text-xs text-muted-foreground">{sug.category}</span>
                    <Button className="mt-4" onClick={() => handleAddSuggestedMilestone(sug)}>
                      Adicionar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {filteredMilestones.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/20 rounded-lg">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Sem marcos ainda</h3>
            <p className="mt-1 text-sm text-gray-500">Que tal registrar o primeiro marco do seu bebê?</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredMilestones.map((milestone) => (
              <Card key={milestone.id} className="overflow-hidden group">
                <CardContent className="p-0 relative">
                  <div className="overflow-hidden">
                    {milestone.photoUrl && (
                      <img
                        src={milestone.photoUrl}
                        alt={milestone.title}
                        className="w-full h-48 object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                        onClick={() => handleViewImage(milestone.photoUrl)}
                      />
                    )}
                  </div>
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" className="h-8 w-8 p-0 rounded-full opacity-80 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {milestone.photoUrl && (
                          <DropdownMenuItem onClick={() => handleViewImage(milestone.photoUrl)}>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>Ver Foto</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleEditMilestone(milestone)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Editar Detalhes</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteMilestone(milestone.id)} className="text-red-500 focus:text-red-500">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Excluir</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
                <CardHeader>
                  <CardTitle>{milestone.title}</CardTitle>
                  <CardDescription>{new Date(milestone.date).toLocaleDateString()} • {milestone.category}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        {(modalMode === 'create' || modalMode === 'edit' || modalMode === 'view') && (
          <MilestoneModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={handleSuccess}
            milestone={selectedMilestone}
            mode={modalMode as 'create' | 'edit' | 'view'}
            babyId={currentBaby?.id}
          />
        )}

        {modalMode === 'create-from-suggested' && selectedSuggested && (
          <Dialog open={isModalOpen} onOpenChange={() => setIsModalOpen(false)}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-2xl">Registrar marco sugerido</DialogTitle>
                <DialogDescription>Preencha os dados do marco sugerido abaixo.</DialogDescription>
              </DialogHeader>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const date = (form.elements.namedItem('date') as HTMLInputElement).value;
                  const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;
                  await handleSubmitSuggestedMilestone({ date, description });
                }}
                className="space-y-4 pt-4"
              >
                <div className="flex justify-center">
                  <ImageUpload
                    currentImage={suggestedPhotoUrl}
                    onImageSelect={(file) => {
                      setSuggestedImageFile(file);
                      if (file) setSuggestedPhotoUrl(URL.createObjectURL(file));
                      else setSuggestedPhotoUrl(undefined);
                    }}
                    onImageRemove={() => {
                      setSuggestedImageFile(null);
                      setSuggestedPhotoUrl(undefined);
                    }}
                    size="lg"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Título</Label>
                  <Input value={selectedSuggested?.title || ''} readOnly />
                </div>
                <div className="space-y-1">
                  <Label>Categoria</Label>
                  <Input value={selectedSuggested?.category || ''} readOnly />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="date">Data</Label>
                  <Input id="date" name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea id="description" name="description" rows={4} required placeholder="Descreva este marco..." />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className={`${getGradientClass()} text-white`}>
                    Salvar Marco
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {viewingImage && (
          <Dialog open={!!viewingImage} onOpenChange={() => setViewingImage(null)}>
            <DialogContent className="max-w-4xl w-auto p-0 bg-transparent border-0" onPointerDownOutside={(e) => e.preventDefault()}>
              <img src={viewingImage} alt="Visualização do Marco" className="w-full h-auto max-h-[90vh] object-contain rounded-lg" />
            </DialogContent>
          </Dialog>
        )}

        {/* Card de previsão de marcos IA */}
        {currentBaby?.id && (
          <div className="mb-6 animate-fade-in">
            <PredictedMilestonesCard babyId={currentBaby.id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Milestones;