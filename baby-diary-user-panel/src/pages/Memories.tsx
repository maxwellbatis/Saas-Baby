import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import MemoryModal from '@/components/MemoryModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PlusCircle, MoreVertical, Image as ImageIcon, Trash2, Edit, Eye } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import BackButton from '@/components/BackButton';
import AddBabyModal from '@/components/AddBabyModal';

interface Memory {
  id: string;
  title: string;
  description: string;
  date: string;
  photoUrl: string;
  babyId: string;
}

const Memories = () => {
  const { currentBaby, isLoading: isAuthLoading, isPregnancyMode, refetch } = useAuth();
  const { getGradientClass } = useTheme();
  const { toast } = useToast();

  const [memories, setMemories] = useState<Memory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | undefined>(undefined);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isLoading, setIsLoading] = useState(true);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [showAddBabyModal, setShowAddBabyModal] = useState(false);

  const handleBabyAdded = async () => {
    await refetch();
    setShowAddBabyModal(false);
  };

  const fetchMemories = useCallback(async () => {
    if (!currentBaby) {
      setMemories([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/user/memories?babyId=${currentBaby.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Falha ao buscar memórias');
      const data = await response.json();
      setMemories(Array.isArray(data.data) ? data.data : []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível buscar as memórias.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentBaby, toast]);

  useEffect(() => {
    // We wait for auth to finish before fetching
    if (!isAuthLoading) {
      fetchMemories();
    }
  }, [fetchMemories, isAuthLoading]);

  const handleCreateMemory = () => {
    setSelectedMemory(undefined);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditMemory = (memory: Memory) => {
    setSelectedMemory(memory);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewImage = (photoUrl: string) => {
    setViewingImage(photoUrl);
  };

  const handleDeleteMemory = async (memoryId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/user/memories/${memoryId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao deletar memória');
      }
      toast({
        title: "Sucesso",
        description: "Memória removida."
      });
      fetchMemories();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível remover a memória.",
        variant: "destructive"
      });
    }
  };

  if (isLoading || isAuthLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Memórias de {currentBaby?.name || 'Bebê'}</h1>
          <Skeleton className="h-10 w-40" />
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
    );
  }

  if (!currentBaby) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-baby-pink via-baby-peach to-baby-lavender flex flex-col">
        <Header />
        <div className="container mx-auto p-4 flex-1 flex flex-col items-center justify-center">
          <ImageIcon className="w-16 h-16 mb-4 text-pink-400" />
          <h2 className="text-2xl font-bold mb-2">{isPregnancyMode ? "Registre memórias da sua gestação!" : "Registre momentos especiais!"}</h2>
          <p className="text-muted-foreground mb-4 max-w-md text-center">
            {isPregnancyMode ? (
              <>
                Aqui você pode guardar fotos da barriga, ultrassons, textos sobre sentimentos e lembranças dessa fase única.<br />
                <b>Para começar, cadastre a previsão de parto.</b> Não se preocupe, você poderá alterar a data depois do nascimento!<br />
                Assim, você libera todas as funcionalidades do app para registrar sua gestação.<br />
              </>
            ) : "Aqui você poderá guardar fotos, textos e lembranças do seu bebê. Comece a criar memórias inesquecíveis!"}
          </p>
          <Card className="mb-6 max-w-xs">
            <CardContent className="p-4 text-center">
              <img src="/placeholder.svg" alt="Exemplo de memória" className="w-24 h-24 mx-auto mb-2 rounded-lg object-cover" />
              <div className="font-semibold">{isPregnancyMode ? "Primeiro ultrassom" : "Primeiro sorriso do bebê"}</div>
              <div className="text-xs text-muted-foreground">Exemplo de memória</div>
            </CardContent>
          </Card>
          <Button variant="outline" onClick={() => setShowAddBabyModal(true)}>{isPregnancyMode ? "Cadastrar previsão de parto" : "Adicionar bebê"}</Button>
        </div>
        <AddBabyModal isOpen={showAddBabyModal} onClose={() => setShowAddBabyModal(false)} onAdd={handleBabyAdded} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-baby-pink via-baby-peach to-baby-lavender">
      <Header />
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-4 mb-8">
          <BackButton to="/dashboard" />
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Memórias de {currentBaby.name}
          </h1>
          <Button onClick={handleCreateMemory} className="bg-pink-500 hover:bg-pink-600 text-white ml-auto px-6 py-2 rounded-lg shadow-lg text-base font-semibold flex items-center gap-2">
            <PlusCircle className="mr-2 h-4 w-4" /> Nova Memória
          </Button>
        </div>

        {memories.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/20 rounded-lg">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Sem memórias ainda</h3>
            <p className="mt-1 text-sm text-gray-500">Que tal registrar o primeiro momento especial?</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {memories.map((memory) => (
              <Card key={memory.id} className="overflow-hidden group">
                <CardContent className="p-0 relative">
                  <div className="overflow-hidden">
                      <img
                        src={memory.photoUrl}
                        alt={memory.title}
                        className="w-full h-48 object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                        onClick={() => handleViewImage(memory.photoUrl)}
                      />
                  </div>
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" className="h-8 w-8 p-0 rounded-full opacity-80 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewImage(memory.photoUrl)}>
                          <Eye className="mr-2 h-4 w-4" />
                          <span>Ver Foto</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditMemory(memory)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Editar Detalhes</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteMemory(memory.id)} className="text-red-500 focus:text-red-500">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Excluir</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
                <CardHeader>
                  <CardTitle>{memory.title}</CardTitle>
                  <CardDescription>{new Date(memory.date).toLocaleDateString()}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        <MemoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchMemories}
          memory={selectedMemory}
          mode={modalMode}
          babyId={currentBaby?.id}
        />

        {viewingImage && (
          <Dialog open={!!viewingImage} onOpenChange={() => setViewingImage(null)}>
            <DialogContent className="max-w-4xl w-auto p-0 bg-transparent border-0" onPointerDownOutside={(e) => e.preventDefault()}>
              <img src={viewingImage} alt="Visualização da Memória" className="w-full h-auto max-h-[90vh] object-contain rounded-lg" />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default Memories;