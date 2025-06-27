import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Instagram,
  Facebook,
  Youtube,
  MessageSquare,
  Video,
  Image,
  FileText,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Settings,
  Filter,
  Download,
  Upload,
  Zap,
  Target,
  Users,
  TrendingUp
} from 'lucide-react';
import { adminMarketing } from '../../../lib/adminApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../hooks/use-toast';

interface ScheduledPost {
  id: string;
  title: string;
  content: string;
  platform: string;
  contentType: 'post' | 'story' | 'reel' | 'video' | 'ad';
  scheduledAt: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  imageUrl?: string;
  videoUrl?: string;
  hashtags?: string;
  targetAudience: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CalendarView {
  type: 'month' | 'week' | 'day';
  currentDate: Date;
}

interface EditorialCalendarTabProps {
  onSchedulePost?: (post: ScheduledPost) => void;
}

export const EditorialCalendarTab: React.FC<EditorialCalendarTabProps> = ({ onSchedulePost }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [view, setView] = useState<CalendarView>({
    type: 'month',
    currentDate: new Date()
  });
  
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [previewPost, setPreviewPost] = useState<ScheduledPost | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    content: '',
    platform: 'instagram',
    contentType: 'post' as 'post' | 'story' | 'reel' | 'video' | 'ad',
    scheduledAt: '',
    scheduledTime: '09:00',
    targetAudience: 'maes_bebes',
    category: 'motivacional',
    hashtags: '',
    imageUrl: '',
    videoUrl: ''
  });

  // Buscar posts agendados
  const { data: scheduledPosts = [], isLoading } = useQuery({
    queryKey: ['scheduledPosts', view.currentDate.getMonth(), view.currentDate.getFullYear()],
    queryFn: async () => {
      const response = await adminMarketing.getScheduledPosts({
        month: view.currentDate.getMonth() + 1,
        year: view.currentDate.getFullYear()
      });
      return response.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Mutation para agendar post
  const schedulePostMutation = useMutation({
    mutationFn: async (data: any) => adminMarketing.schedulePost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledPosts'] });
      toast({ title: 'Post agendado com sucesso!' });
      setShowScheduleModal(false);
      setScheduleForm({
        title: '',
        content: '',
        platform: 'instagram',
        contentType: 'post',
        scheduledAt: '',
        scheduledTime: '09:00',
        targetAudience: 'maes_bebes',
        category: 'motivacional',
        hashtags: '',
        imageUrl: '',
        videoUrl: ''
      });
    },
    onError: (error) => {
      toast({ title: 'Erro ao agendar post', description: error.message, variant: 'destructive' });
    },
  });

  // Mutation para atualizar post agendado
  const updateScheduledPostMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => adminMarketing.updateScheduledPost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledPosts'] });
      toast({ title: 'Post atualizado com sucesso!' });
      setShowScheduleModal(false);
      setSelectedPost(null);
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar post', description: error.message, variant: 'destructive' });
    },
  });

  // Mutation para deletar post agendado
  const deleteScheduledPostMutation = useMutation({
    mutationFn: async (id: string) => adminMarketing.deleteScheduledPost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledPosts'] });
      toast({ title: 'Post removido com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao remover post', description: error.message, variant: 'destructive' });
    },
  });

  // Gerar calendário
  const calendarDays = useMemo(() => {
    const year = view.currentDate.getFullYear();
    const month = view.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= lastDay || days.length < 42) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  }, [view.currentDate]);

  // Agrupar posts por data
  const postsByDate = useMemo(() => {
    const grouped: Record<string, ScheduledPost[]> = {};
    scheduledPosts.forEach(post => {
      const date = new Date(post.scheduledAt).toISOString().split('T')[0];
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(post);
    });
    return grouped;
  }, [scheduledPosts]);

  // Navegar no calendário
  const navigateCalendar = (direction: 'prev' | 'next') => {
    const newDate = new Date(view.currentDate);
    if (view.type === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (view.type === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    setView({ ...view, currentDate: newDate });
  };

  // Abrir modal de preview
  const openPreviewModal = (post: ScheduledPost) => {
    setPreviewPost(post);
    setShowPreviewModal(true);
  };

  // Abrir modal de agendamento
  const openScheduleModal = (post?: ScheduledPost) => {
    if (post) {
      setSelectedPost(post);
      setScheduleForm({
        title: post.title,
        content: post.content,
        platform: post.platform,
        contentType: post.contentType,
        scheduledAt: new Date(post.scheduledAt).toISOString().split('T')[0],
        scheduledTime: new Date(post.scheduledAt).toTimeString().slice(0, 5),
        targetAudience: post.targetAudience,
        category: post.category,
        hashtags: post.hashtags || '',
        imageUrl: post.imageUrl || '',
        videoUrl: post.videoUrl || ''
      });
    } else {
      setSelectedPost(null);
      setScheduleForm({
        title: '',
        content: '',
        platform: 'instagram',
        contentType: 'post',
        scheduledAt: new Date().toISOString().split('T')[0],
        scheduledTime: '09:00',
        targetAudience: 'maes_bebes',
        category: 'motivacional',
        hashtags: '',
        imageUrl: '',
        videoUrl: ''
      });
    }
    setShowScheduleModal(true);
  };

  // Salvar agendamento
  const handleSaveSchedule = () => {
    if (!scheduleForm.title || !scheduleForm.content || !scheduleForm.scheduledAt) {
      toast({ title: 'Campos obrigatórios', description: 'Preencha título, conteúdo e data', variant: 'destructive' });
      return;
    }

    const scheduledDateTime = new Date(`${scheduleForm.scheduledAt}T${scheduleForm.scheduledTime}`);
    
    const postData = {
      ...scheduleForm,
      scheduledAt: scheduledDateTime.toISOString(),
      status: 'scheduled'
    };

    if (selectedPost) {
      updateScheduledPostMutation.mutate({ id: selectedPost.id, data: postData });
    } else {
      schedulePostMutation.mutate(postData);
    }
  };

  // Deletar post agendado
  const handleDeletePost = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este post?')) {
      deleteScheduledPostMutation.mutate(id);
    }
  };

  // Obter ícone da plataforma
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'facebook': return <Facebook className="w-4 h-4" />;
      case 'youtube': return <Youtube className="w-4 h-4" />;
      case 'tiktok': return <Video className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  // Obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obter ícone do tipo de conteúdo
  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'post': return <FileText className="w-3 h-3" />;
      case 'story': return <Image className="w-3 h-3" />;
      case 'reel': return <Video className="w-3 h-3" />;
      case 'video': return <Play className="w-3 h-3" />;
      case 'ad': return <Target className="w-3 h-3" />;
      default: return <FileText className="w-3 h-3" />;
    }
  };

  // Formatar data
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  // Formatar hora
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Verificar se é hoje
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Verificar se é do mês atual
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === view.currentDate.getMonth();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando calendário...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header do Calendário */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Calendário Editorial</h2>
          <p className="text-gray-600">Agende e gerencie posts para redes sociais</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={view.type} onValueChange={(value: 'month' | 'week' | 'day') => setView({ ...view, type: value })}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Mês</SelectItem>
              <SelectItem value="week">Semana</SelectItem>
              <SelectItem value="day">Dia</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => openScheduleModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Agendar Post
          </Button>
        </div>
      </div>

      {/* Navegação do Calendário */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigateCalendar('prev')}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>
        <h3 className="text-lg font-semibold">
          {view.currentDate.toLocaleDateString('pt-BR', { 
            month: 'long', 
            year: 'numeric' 
          })}
        </h3>
        <Button variant="outline" onClick={() => navigateCalendar('next')}>
          Próximo
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Calendário */}
      <Card>
        <CardContent className="p-6">
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Dias do calendário */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              const dateString = date.toISOString().split('T')[0];
              const dayPosts = postsByDate[dateString] || [];
              const isCurrentMonthDay = isCurrentMonth(date);
              const isTodayDate = isToday(date);

              return (
                <div
                  key={index}
                  className={`
                    min-h-[120px] p-2 border rounded-lg cursor-pointer transition-colors
                    ${isCurrentMonthDay ? 'bg-white' : 'bg-gray-50'}
                    ${isTodayDate ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                    hover:bg-gray-50
                  `}
                  onClick={() => openScheduleModal()}
                >
                  {/* Número do dia */}
                  <div className={`
                    text-sm font-medium mb-2
                    ${isCurrentMonthDay ? 'text-gray-900' : 'text-gray-400'}
                    ${isTodayDate ? 'text-blue-600 font-bold' : ''}
                  `}>
                    {date.getDate()}
                  </div>

                  {/* Posts agendados */}
                  <div className="space-y-1">
                    {dayPosts.slice(0, 3).map(post => (
                      <div
                        key={post.id}
                        className="p-2 rounded border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          openPreviewModal(post);
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1">
                            {getPlatformIcon(post.platform)}
                            {getContentTypeIcon(post.contentType)}
                          </div>
                          <Badge className={`text-xs ${getStatusColor(post.status)}`}>
                            {post.status === 'published' ? 'Publicado' :
                             post.status === 'scheduled' ? 'Agendado' :
                             post.status === 'draft' ? 'Rascunho' : 'Falhou'}
                          </Badge>
                        </div>
                        <div className="font-medium text-xs truncate mb-1">{post.title}</div>
                        <div className="text-gray-500 text-xs">{formatTime(post.scheduledAt)}</div>
                        <div className="flex items-center gap-1 mt-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              openScheduleModal(post);
                            }}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              openPreviewModal(post);
                            }}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {dayPosts.length > 3 && (
                      <div className="text-xs text-gray-500 text-center py-1">
                        +{dayPosts.length - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Posts Agendados</p>
                <p className="text-2xl font-bold">
                  {scheduledPosts.filter(p => p.status === 'scheduled').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Publicados Hoje</p>
                <p className="text-2xl font-bold">
                  {scheduledPosts.filter(p => 
                    p.status === 'published' && 
                    new Date(p.scheduledAt).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rascunhos</p>
                <p className="text-2xl font-bold">
                  {scheduledPosts.filter(p => p.status === 'draft').length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Falharam</p>
                <p className="text-2xl font-bold">
                  {scheduledPosts.filter(p => p.status === 'failed').length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Agendamento */}
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPost ? 'Editar Post Agendado' : 'Agendar Novo Post'}
            </DialogTitle>
            <DialogDescription>
              Configure os detalhes do post e escolha quando publicá-lo.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Título</label>
              <Input
                value={scheduleForm.title}
                onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                placeholder="Título do post"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Plataforma</label>
              <Select value={scheduleForm.platform} onValueChange={(value) => setScheduleForm({ ...scheduleForm, platform: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Tipo de Conteúdo</label>
              <Select value={scheduleForm.contentType} onValueChange={(value: any) => setScheduleForm({ ...scheduleForm, contentType: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="post">Post</SelectItem>
                  <SelectItem value="story">Story</SelectItem>
                  <SelectItem value="reel">Reel</SelectItem>
                  <SelectItem value="video">Vídeo</SelectItem>
                  <SelectItem value="ad">Anúncio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Público-alvo</label>
              <Select value={scheduleForm.targetAudience} onValueChange={(value) => setScheduleForm({ ...scheduleForm, targetAudience: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gestantes">Gestantes</SelectItem>
                  <SelectItem value="maes_bebes">Mães de Bebês</SelectItem>
                  <SelectItem value="maes_criancas">Mães de Crianças</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Data de Publicação</label>
              <Input
                type="date"
                value={scheduleForm.scheduledAt}
                onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledAt: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Horário</label>
              <Input
                type="time"
                value={scheduleForm.scheduledTime}
                onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledTime: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Categoria</label>
              <Select value={scheduleForm.category} onValueChange={(value) => setScheduleForm({ ...scheduleForm, category: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="motivacional">Motivacional</SelectItem>
                  <SelectItem value="beneficio">Benefício</SelectItem>
                  <SelectItem value="funcionalidade">Funcionalidade</SelectItem>
                  <SelectItem value="depoimento">Depoimento</SelectItem>
                  <SelectItem value="comemorativo">Comemorativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Hashtags</label>
              <Input
                value={scheduleForm.hashtags}
                onChange={(e) => setScheduleForm({ ...scheduleForm, hashtags: e.target.value })}
                placeholder="#maternidade #bebê"
                className="mt-1"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium">Conteúdo</label>
            <Textarea
              value={scheduleForm.content}
              onChange={(e) => setScheduleForm({ ...scheduleForm, content: e.target.value })}
              placeholder="Escreva o conteúdo do post..."
              className="mt-1 min-h-[100px]"
            />
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="flex gap-2">
              {selectedPost && (
                <Button
                  variant="destructive"
                  onClick={() => handleDeletePost(selectedPost.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remover
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowScheduleModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveSchedule}>
                {selectedPost ? 'Atualizar' : 'Agendar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Preview */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preview do Post</DialogTitle>
            <DialogDescription>
              Visualize como o post aparecerá nas redes sociais.
            </DialogDescription>
          </DialogHeader>

          {previewPost && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getPlatformIcon(previewPost.platform)}
                <span className="font-medium">{previewPost.title}</span>
                <Badge className={getStatusColor(previewPost.status)}>
                  {previewPost.status === 'published' ? 'Publicado' :
                   previewPost.status === 'scheduled' ? 'Agendado' :
                   previewPost.status === 'draft' ? 'Rascunho' : 'Falhou'}
                </Badge>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    BD
                  </div>
                  <div>
                    <div className="font-medium text-sm">Baby Diary</div>
                    <div className="text-xs text-gray-500">
                      {formatDate(new Date(previewPost.scheduledAt))} às {formatTime(previewPost.scheduledAt)}
                    </div>
                  </div>
                </div>
                
                <div className="text-sm leading-relaxed mb-3">
                  {previewPost.content}
                </div>

                {previewPost.hashtags && (
                  <div className="text-blue-600 text-sm">
                    {previewPost.hashtags}
                  </div>
                )}

                {previewPost.imageUrl && (
                  <div className="mt-3">
                    <img 
                      src={previewPost.imageUrl} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Plataforma:</span> {previewPost.platform}
                </div>
                <div>
                  <span className="font-medium">Tipo:</span> {previewPost.contentType}
                </div>
                <div>
                  <span className="font-medium">Categoria:</span> {previewPost.category}
                </div>
                <div>
                  <span className="font-medium">Público-alvo:</span> {previewPost.targetAudience}
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowPreviewModal(false);
                    openScheduleModal(previewPost);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    handleDeletePost(previewPost.id);
                    setShowPreviewModal(false);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remover
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}; 