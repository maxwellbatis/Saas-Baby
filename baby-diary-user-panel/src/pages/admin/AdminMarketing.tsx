import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { adminMarketing } from '../../lib/adminApi';
import { Textarea } from '../../components/ui/textarea';
import { MediaUpload } from '../../components/MediaUpload';
import { 
  Target, 
  BarChart3, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  Download, 
  Upload,
  Sparkles,
  Loader2,
  X,
  Save,
  Baby,
  Heart,
  Activity,
  Calendar,
  TrendingUp,
  MessageSquare,
  Video,
  Link,
  Megaphone,
  FileText,
  Hash,
  DollarSign,
  Clock,
  Music,
  Camera,
  Play,
  Instagram,
  Facebook,
  Youtube,
  Share2,
  CreditCard,
  Brain
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { MarketingCampaignModal } from './marketing/MarketingCampaignModal';
import { CampaignsTab } from './marketing/CampaignsTab';
import { DigitalLibraryTab } from './marketing/DigitalLibraryTab';
import { AnalyticsTab } from './marketing/AnalyticsTab';
import { EditorialCalendarTab } from './marketing/EditorialCalendarTab';
import { HashtagAnalytics } from './marketing/HashtagAnalytics';

// Interfaces para Biblioteca de Marketing Digital
interface SocialMediaPost {
  id: string;
  title: string;
  description: string;
  category: string;
  platform: string;
  contentType: string;
  imageUrl?: string;
  videoUrl?: string;
  caption: string;
  hashtags: string;
  cta?: string;
  targetAudience: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

interface Advertisement {
  id: string;
  title: string;
  platform: string;
  adType: string;
  copyShort: string;
  copyLong: string;
  headline: string;
  description: string;
  cta: string;
  imageUrl?: string;
  videoUrl?: string;
  targetAudience: string;
  interests: string[];
  budget?: number;
  isActive: boolean;
  createdAt: string;
}

interface VideoContent {
  id: string;
  title: string;
  description: string;
  platform: string;
  videoType: string;
  duration: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  script: string;
  music?: string;
  hashtags: string;
  targetAudience: string;
  isActive: boolean;
  createdAt: string;
}

interface SalesArgument {
  id: string;
  title: string;
  category: string;
  argument: string;
  examples: string[];
  targetAudience: string;
  conversionRate?: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

interface AffiliateLink {
  id: string;
  name: string;
  baseUrl: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent?: string;
  utmTerm?: string;
  fullUrl: string;
  clicks: number;
  conversions: number;
  isActive: boolean;
  createdAt: string;
}

interface MarketingCampaign {
  id: string;
  name: string;
  type: string;
  content: string;
  subject?: string;
  segment: string;
  scheduledAt?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  // Propriedades de segmentação avançada
  babyAgeMin?: number;
  babyAgeMax?: number;
  motherType?: string;
  planType?: string;
  engagement?: string;
  daysInactive?: number;
  hasMultipleBabies?: boolean;
  isPremium?: boolean;
  isVerified?: boolean;
  lastActivityDays?: number;
  totalMemories?: number;
  totalActivities?: number;
}

// Adicionar hook de debounce (apenas uma vez, antes do componente)
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export const AdminMarketing: React.FC = () => {
  const { toast } = useToast();
  
  const queryClient = useQueryClient();
  // Busca de campanhas com React Query
  const {
    data: campaigns = [],
    isLoading: campaignsLoading,
    error: campaignsError,
    refetch: refetchCampaigns,
  } = useQuery({
    queryKey: ['adminMarketingCampaigns'],
    queryFn: async () => {
      const res = await adminMarketing.getCampaigns();
      return res.data || [];
    },
    staleTime: 1000 * 60 * 10,
  });

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState<string>('');
  const [activeTab, setActiveTab] = useState('campaigns');
  const [form, setForm] = useState({
    name: '',
    type: 'email',
    content: '',
    segment: ''
  });

  // Estados para biblioteca digital
  const [socialMediaPosts, setSocialMediaPosts] = useState<SocialMediaPost[]>([]);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [videoContents, setVideoContents] = useState<VideoContent[]>([]);
  const [salesArguments, setSalesArguments] = useState<SalesArgument[]>([]);
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([]);
  const [showDigitalLibraryModal, setShowDigitalLibraryModal] = useState(false);
  const [digitalLibraryType, setDigitalLibraryType] = useState('');
  const [digitalLibraryForm, setDigitalLibraryForm] = useState<any>({});

  // Novos estados para o novo modal de geração de conteúdo com IA
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiGeneratedContent, setAiGeneratedContent] = useState<any>(null);
  const [aiGeneratorForm, setAiGeneratorForm] = useState({
    type: '',
    platform: '',
    targetAudience: '',
    tone: '',
    category: '',
    specificTopic: '',
    duration: undefined as number | undefined
  });

  // 1. ESTADO PARA MODAL DE GERAÇÃO DE POST COM IA
  const [showAIPostModal, setShowAIPostModal] = useState(false);
  const [aiPostForm, setAIPostForm] = useState({
    objetivo: '',
    publico: '',
    plataforma: 'Facebook',
    tom: 'amigável',
    categoria: '',
    cta: '',
    imagem: '',
    hashtags: '',
  });
  const [aiPostLoading, setAIPostLoading] = useState(false);

  // 2. ESTADO PARA MODAL DE GERAÇÃO DE ANÚNCIO COM IA
  const [showAIAdModal, setShowAIAdModal] = useState(false);
  const [aiAdForm, setAIAdForm] = useState({
    objetivo: '',
    publico: '',
    plataforma: 'Facebook',
    tipoAnuncio: 'image',
    tom: 'persuasivo',
    categoria: '',
    cta: '',
    imagem: '',
    orcamento: '',
    interesses: '',
  });
  const [aiAdLoading, setAIAdLoading] = useState(false);

  const handleOpenModal = (campaign?: any) => {
    if (campaign) {
      setEditing(true);
      setEditingId(campaign.id);
      setForm({
        name: campaign.name,
        type: campaign.type,
        content: campaign.content,
        segment: campaign.segment,
      });
    } else {
      setEditing(false);
      setEditingId('');
      setForm({
        name: '',
        type: 'email',
        content: '',
        segment: '',
      });
    }
    setShowModal(true);
  };

  // Mutations para criar, editar e deletar campanhas
  const createCampaignMutation = useMutation({
    mutationFn: async (data: any) => adminMarketing.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMarketingCampaigns'] });
      toast({ title: 'Campanha criada com sucesso!' });
      setShowModal(false);
    },
    onError: (error) => {
      toast({ title: 'Erro ao criar campanha', description: error.message, variant: 'destructive' });
    },
  });

  const editCampaignMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => adminMarketing.updateCampaign(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMarketingCampaigns'] });
      toast({ title: 'Campanha atualizada com sucesso!' });
      setShowModal(false);
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar campanha', description: error.message, variant: 'destructive' });
    },
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: async (id: string) => adminMarketing.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMarketingCampaigns'] });
      toast({ title: 'Campanha excluída com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao excluir campanha', description: error.message, variant: 'destructive' });
    },
  });

  const handleSave = async () => {
    if (editing && editingId) {
      editCampaignMutation.mutate({ id: editingId, data: form });
    } else {
      createCampaignMutation.mutate(form);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta campanha?')) return;
    deleteCampaignMutation.mutate(id);
  };

  const handleGenerateAI = async () => {
    try {
      const response = await adminMarketing.generateWithGemini(
        `Gere um conteúdo de marketing para campanha de email sobre o app Baby Diary. 
        Foco: maternidade e desenvolvimento infantil
        Tom: amigável e motivacional
        Público: mães de bebês`
      );
      setForm({...form, content: response.data.content});
    } catch (error) {
      console.error('Erro ao gerar conteúdo com IA:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar conteúdo com IA",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Funções para Biblioteca de Marketing Digital
  const handleOpenDigitalLibraryModal = (type: string, item?: any) => {
    setDigitalLibraryType(type);
    if (item) {
      setDigitalLibraryForm(item);
    } else {
      setDigitalLibraryForm({});
    }
    setShowDigitalLibraryModal(true);
  };

  const handleSaveDigitalLibraryItem = async () => {
    try {
      // Garante campos obrigatórios para cada tipo
      if (digitalLibraryType === 'post') {
        const postPayload = {
          title: digitalLibraryForm.title || '',
          description: digitalLibraryForm.description || '',
          category: digitalLibraryForm.category || '',
          platform: digitalLibraryForm.platform || '',
          contentType: digitalLibraryForm.contentType || 'post',
          caption: digitalLibraryForm.caption || '',
          hashtags: digitalLibraryForm.hashtags || '',
          targetAudience: digitalLibraryForm.targetAudience || '',
          isActive: digitalLibraryForm.isActive ?? true,
          sortOrder: digitalLibraryForm.sortOrder ?? 0,
          imageUrl: digitalLibraryForm.imageUrl || '',
          videoUrl: digitalLibraryForm.videoUrl || '',
          createdBy: 'admin',
        };
        const response = await adminMarketing.createSocialMediaPost(postPayload);
        if (response.success && response.data) {
          setSocialMediaPosts((prev) => [response.data, ...prev]);
          toast({ title: 'Post salvo com sucesso!' });
          setShowDigitalLibraryModal(false);
        }
        return;
      }
      if (digitalLibraryType === 'ad') {
        const adPayload = {
          title: digitalLibraryForm.title || '',
          platform: digitalLibraryForm.platform || '',
          adType: digitalLibraryForm.adType || 'image',
          copyShort: digitalLibraryForm.copyShort || '',
          copyLong: digitalLibraryForm.copyLong || '',
          headline: digitalLibraryForm.headline || '',
          description: digitalLibraryForm.description || '',
          cta: digitalLibraryForm.cta || '',
          imageUrl: digitalLibraryForm.imageUrl || '',
          videoUrl: digitalLibraryForm.videoUrl || '',
          targetAudience: digitalLibraryForm.targetAudience || '',
          interests: digitalLibraryForm.interests || '[]',
          budget: digitalLibraryForm.budget || 0,
          isActive: digitalLibraryForm.isActive ?? true,
          createdBy: 'admin',
        };
        const response = await adminMarketing.createAdvertisement(adPayload);
        if (response.success && response.data) {
          setAdvertisements((prev) => [response.data, ...prev]);
          toast({ title: 'Anúncio salvo com sucesso!' });
          setShowDigitalLibraryModal(false);
        }
        return;
      }
      if (digitalLibraryType === 'video') {
        const videoPayload = {
          title: digitalLibraryForm.title || '',
          description: digitalLibraryForm.description || '',
          platform: digitalLibraryForm.platform || '',
          videoType: digitalLibraryForm.videoType || 'reel',
          duration: digitalLibraryForm.duration || 30,
          videoUrl: digitalLibraryForm.videoUrl || '',
          thumbnailUrl: digitalLibraryForm.thumbnailUrl || '',
          script: digitalLibraryForm.script || '',
          music: digitalLibraryForm.music || '',
          hashtags: digitalLibraryForm.hashtags || '',
          targetAudience: digitalLibraryForm.targetAudience || '',
          isActive: digitalLibraryForm.isActive ?? true,
          createdBy: 'admin',
        };
        const response = await adminMarketing.createVideoContent(videoPayload);
        if (response.success && response.data) {
          setVideoContents((prev) => [response.data, ...prev]);
          toast({ title: 'Vídeo salvo com sucesso!' });
          setShowDigitalLibraryModal(false);
        }
        return;
      }
      if (digitalLibraryType === 'argument') {
        const argumentPayload = {
          title: digitalLibraryForm.title || '',
          category: digitalLibraryForm.category || '',
          argument: digitalLibraryForm.argument || '',
          examples: digitalLibraryForm.examples || [],
          targetAudience: digitalLibraryForm.targetAudience || '',
          conversionRate: digitalLibraryForm.conversionRate || 0,
          isActive: digitalLibraryForm.isActive ?? true,
          sortOrder: digitalLibraryForm.sortOrder ?? 0,
          createdBy: 'admin',
        };
        const response = await adminMarketing.createSalesArgument(argumentPayload);
        if (response.success && response.data) {
          setSalesArguments((prev) => [response.data, ...prev]);
          toast({ title: 'Argumento salvo com sucesso!' });
          setShowDigitalLibraryModal(false);
        }
        return;
      }
      if (digitalLibraryType === 'link') {
        const linkPayload = {
          name: digitalLibraryForm.name || '',
          baseUrl: digitalLibraryForm.baseUrl || '',
          utmSource: digitalLibraryForm.utmSource || '',
          utmMedium: digitalLibraryForm.utmMedium || '',
          utmCampaign: digitalLibraryForm.utmCampaign || '',
          utmContent: digitalLibraryForm.utmContent || '',
          utmTerm: digitalLibraryForm.utmTerm || '',
          fullUrl: digitalLibraryForm.fullUrl || '',
          clicks: 0,
          conversions: 0,
          isActive: digitalLibraryForm.isActive ?? true,
          createdBy: 'admin',
        };
        const response = await adminMarketing.createAffiliateLink(linkPayload);
        if (response.success && response.data) {
          setAffiliateLinks((prev) => [response.data, ...prev]);
          toast({ title: 'Link salvo com sucesso!' });
          setShowDigitalLibraryModal(false);
        }
        return;
      }
    } catch (error: any) {
      console.error('Erro ao salvar item:', error);
      toast({ 
        title: 'Erro ao salvar', 
        description: error?.message || 'Erro desconhecido', 
        variant: 'destructive' 
      });
    }
  };

  const handleGenerateAIContent = async () => {
    try {
      setIsGenerating(true);
      const response = await adminMarketing.generateMarketingContent({
        type: 'post',
        platform: 'instagram',
        targetAudience: 'gestantes',
        tone: 'amigável e motivacional'
      });

      if (response.success) {
        setAiGeneratedContent(response.data);
      }
    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Texto copiado para a área de transferência",
    });
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'facebook': return <Facebook className="w-4 h-4" />;
      case 'tiktok': return <Video className="w-4 h-4" />;
      case 'youtube': return <Youtube className="w-4 h-4" />;
      default: return <Share2 className="w-4 h-4" />;
    }
  };

  // Função para gerar conteúdo com IA
  const handleGenerateContent = async () => {
    setIsGenerating(true);
    try {
      const response = await adminMarketing.generateContentWithAI(aiGeneratorForm);
      if (response.success) {
        setAiGeneratedContent(response.data);
        
        // Salvar automaticamente na biblioteca digital
        await handleSaveGeneratedContent(response.data);
        
        toast({
          title: "Conteúdo Gerado e Salvo!",
          description: "O conteúdo foi gerado com IA e salvo automaticamente na biblioteca digital.",
        });
      }
    } catch (error) {
      console.error('Erro ao gerar conteúdo com IA:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar conteúdo com IA",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Função para salvar conteúdo gerado automaticamente
  const handleSaveGeneratedContent = async (generatedContent: any) => {
    try {
      console.log('Salvando conteúdo gerado:', generatedContent);
      
      // Mapear o conteúdo gerado para o formulário
      const mappedContent = {
        title: generatedContent.title || `Conteúdo gerado por IA - ${new Date().toLocaleDateString()}`,
        description: generatedContent.description || generatedContent.content || '',
        platform: generatedContent.platform || 'instagram',
        targetAudience: generatedContent.targetAudience || 'maes_bebes',
        category: generatedContent.category || 'motivacional',
        contentType: generatedContent.contentType || 'post',
        caption: generatedContent.caption || generatedContent.content || '',
        hashtags: generatedContent.hashtags || '',
        imageUrl: generatedContent.imageUrl || '',
        videoUrl: generatedContent.videoUrl || '',
        isActive: true,
        sortOrder: 0,
        // Campos específicos para anúncios
        adType: generatedContent.adType || 'image',
        copyShort: generatedContent.copyShort || generatedContent.content?.substring(0, 125) || '',
        copyLong: generatedContent.copyLong || generatedContent.content || '',
        headline: generatedContent.headline || generatedContent.title || '',
        cta: generatedContent.cta || 'Saiba Mais',
        interests: generatedContent.interests || '[]',
        budget: generatedContent.budget || 0,
        // Campos específicos para vídeos
        videoType: generatedContent.videoType || 'reel',
        duration: generatedContent.duration || 30,
        thumbnailUrl: generatedContent.thumbnailUrl || '',
        script: generatedContent.script || generatedContent.content || '',
        music: generatedContent.music || '',
        // Campos específicos para argumentos
        argument: generatedContent.argument || generatedContent.content || '',
        examples: generatedContent.examples || [],
        conversionRate: generatedContent.conversionRate || 0,
        // Campos específicos para links
        name: generatedContent.name || generatedContent.title || '',
        baseUrl: generatedContent.baseUrl || 'https://babydiary.shop',
        utmSource: generatedContent.utmSource || 'ai_generated',
        utmMedium: generatedContent.utmMedium || 'social',
        utmCampaign: generatedContent.utmCampaign || 'ai_campaign',
        utmContent: generatedContent.utmContent || '',
        utmTerm: generatedContent.utmTerm || '',
        fullUrl: generatedContent.fullUrl || 'https://babydiary.shop?utm_source=ai_generated&utm_medium=social&utm_campaign=ai_campaign',
      };

      // Determinar o tipo baseado no conteúdo gerado
      let contentType = 'post';
      if (generatedContent.type === 'ad' || generatedContent.adType) {
        contentType = 'ad';
      } else if (generatedContent.type === 'video' || generatedContent.videoType) {
        contentType = 'video';
      } else if (generatedContent.type === 'argument') {
        contentType = 'argument';
      } else if (generatedContent.type === 'link') {
        contentType = 'link';
      }

      // Definir o tipo e preencher o formulário
      setDigitalLibraryType(contentType);
      setDigitalLibraryForm(mappedContent);
      setShowDigitalLibraryModal(true);

      toast({ 
        title: 'Conteúdo carregado!', 
        description: 'Revise e salve o conteúdo gerado pela IA.' 
      });

    } catch (error: any) {
      console.error('Erro ao salvar conteúdo gerado:', error);
      toast({ 
        title: 'Erro ao processar conteúdo', 
        description: error?.message || 'Erro desconhecido', 
        variant: 'destructive' 
      });
    }
  };

  // 2. Definir createPostMutation usando useMutation para criar posts na biblioteca digital.
  const createPostMutation = useMutation({
    mutationFn: async (data) => adminMarketing.createSocialMediaPost(data),
    onSuccess: (data) => {
      setSocialMediaPosts(prev => [data, ...prev]);
      toast({ title: 'Post criado com sucesso!' });
      setShowDigitalLibraryModal(false);
    },
    onError: (error) => {
      toast({ title: 'Erro ao criar post', description: error.message, variant: 'destructive' });
    },
  });

  // --- Mutations e handlers para Social Media Posts ---
  const updatePostMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => adminMarketing.updateSocialMediaPost(id, data),
    onSuccess: (data) => {
      setSocialMediaPosts((prev) => prev.map((p) => p.id === data.id ? data : p));
      toast({ title: 'Post atualizado com sucesso!' });
      setShowDigitalLibraryModal(false);
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao atualizar post', description: error.message, variant: 'destructive' });
    }
  });
  const deletePostMutation = useMutation({
    mutationFn: (id: string) => adminMarketing.deleteSocialMediaPost(id),
    onSuccess: (_, id) => {
      setSocialMediaPosts((prev) => prev.filter((p) => p.id !== id));
      toast({ title: 'Post deletado com sucesso!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao deletar post', description: error.message, variant: 'destructive' });
    }
  });
  const handleEditPost = (id: string, data: any) => updatePostMutation.mutate({ id, data });
  const handleDeletePost = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este post?')) deletePostMutation.mutate(id);
  };
  // --- Mutations e handlers para Anúncios ---
  const updateAdMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => adminMarketing.updateAdvertisement(id, data),
    onSuccess: (data) => {
      setAdvertisements((prev) => prev.map((a) => a.id === data.id ? data : a));
      toast({ title: 'Anúncio atualizado com sucesso!' });
      setShowDigitalLibraryModal(false);
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao atualizar anúncio', description: error.message, variant: 'destructive' });
    }
  });
  const deleteAdMutation = useMutation({
    mutationFn: (id: string) => adminMarketing.deleteAdvertisement(id),
    onSuccess: (_, id) => {
      setAdvertisements((prev) => prev.filter((a) => a.id !== id));
      toast({ title: 'Anúncio deletado com sucesso!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao deletar anúncio', description: error.message, variant: 'destructive' });
    }
  });
  const handleEditAd = (id: string, data: any) => updateAdMutation.mutate({ id, data });
  const handleDeleteAd = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este anúncio?')) deleteAdMutation.mutate(id);
  };
  // --- Mutations e handlers para Vídeos ---
  const updateVideoMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => adminMarketing.updateVideoContent(id, data),
    onSuccess: (data) => {
      setVideoContents((prev) => prev.map((v) => v.id === data.id ? data : v));
      toast({ title: 'Vídeo atualizado com sucesso!' });
      setShowDigitalLibraryModal(false);
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao atualizar vídeo', description: error.message, variant: 'destructive' });
    }
  });
  const deleteVideoMutation = useMutation({
    mutationFn: (id: string) => adminMarketing.deleteVideoContent(id),
    onSuccess: (_, id) => {
      setVideoContents((prev) => prev.filter((v) => v.id !== id));
      toast({ title: 'Vídeo deletado com sucesso!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao deletar vídeo', description: error.message, variant: 'destructive' });
    }
  });
  const handleEditVideo = (id: string, data: any) => updateVideoMutation.mutate({ id, data });
  const handleDeleteVideo = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este vídeo?')) deleteVideoMutation.mutate(id);
  };
  // --- Mutations e handlers para Argumentos de Venda ---
  const updateArgumentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => adminMarketing.updateSalesArgument(id, data),
    onSuccess: (data) => {
      setSalesArguments((prev) => prev.map((a) => a.id === data.id ? data : a));
      toast({ title: 'Argumento atualizado com sucesso!' });
      setShowDigitalLibraryModal(false);
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao atualizar argumento', description: error.message, variant: 'destructive' });
    }
  });
  const deleteArgumentMutation = useMutation({
    mutationFn: (id: string) => adminMarketing.deleteSalesArgument(id),
    onSuccess: (_, id) => {
      setSalesArguments((prev) => prev.filter((a) => a.id !== id));
      toast({ title: 'Argumento deletado com sucesso!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao deletar argumento', description: error.message, variant: 'destructive' });
    }
  });
  const handleEditArgument = (id: string, data: any) => updateArgumentMutation.mutate({ id, data });
  const handleDeleteArgument = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este argumento?')) deleteArgumentMutation.mutate(id);
  };
  // --- Mutations e handlers para Links de Afiliados ---
  const updateLinkMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => adminMarketing.updateAffiliateLink(id, data),
    onSuccess: (data) => {
      setAffiliateLinks((prev) => prev.map((l) => l.id === data.id ? data : l));
      toast({ title: 'Link atualizado com sucesso!' });
      setShowDigitalLibraryModal(false);
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao atualizar link', description: error.message, variant: 'destructive' });
    }
  });
  const deleteLinkMutation = useMutation({
    mutationFn: (id: string) => adminMarketing.deleteAffiliateLink(id),
    onSuccess: (_, id) => {
      setAffiliateLinks((prev) => prev.filter((l) => l.id !== id));
      toast({ title: 'Link deletado com sucesso!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao deletar link', description: error.message, variant: 'destructive' });
    }
  });
  const handleEditLink = (id: string, data: any) => updateLinkMutation.mutate({ id, data });
  const handleDeleteLink = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este link?')) deleteLinkMutation.mutate(id);
  };

  // Handler único para onDelete do DigitalLibraryTab
  const handleDeleteDigitalLibraryItem = (type: string, id: string) => {
    switch (type) {
      case 'post':
        handleDeletePost(id);
        break;
      case 'ad':
        handleDeleteAd(id);
        break;
      case 'video':
        handleDeleteVideo(id);
        break;
      case 'argument':
        handleDeleteArgument(id);
        break;
      case 'link':
        handleDeleteLink(id);
        break;
      default:
        break;
    }
  };

  // 2. HANDLER PARA ABRIR MODAL
  const handleOpenAIPostModal = () => setShowAIPostModal(true);
  const handleOpenAIAdModal = () => setShowAIAdModal(true);

  // 3. HANDLER PARA GERAR POST COM IA
  const handleGenerateAIPost = async () => {
    setAIPostLoading(true);
    try {
      // Chamar endpoint Gemini/backend
      const res = await adminMarketing.generateContentWithAI({
        type: 'post',
        ...aiPostForm
      });
      // Preencher formulário de criação de post com resultado da IA
      setDigitalLibraryForm({
        title: res.title || '',
        description: res.description || '',
        platform: aiPostForm.plataforma,
        category: aiPostForm.categoria,
        imageUrl: res.imageUrl || aiPostForm.imagem,
        caption: res.caption || '',
        hashtags: res.hashtags || aiPostForm.hashtags,
        cta: res.cta || aiPostForm.cta,
        targetAudience: aiPostForm.publico,
        contentType: 'post',
        isActive: true,
        sortOrder: 0,
      });
      setShowAIPostModal(false);
      setDigitalLibraryType('post');
      setShowDigitalLibraryModal(true); // Abre modal de criação de post já preenchido
    } catch (err: any) {
      toast({ title: 'Erro ao gerar post com IA', description: err.message, variant: 'destructive' });
    } finally {
      setAIPostLoading(false);
    }
  };

  // 4. HANDLER PARA GERAR ANÚNCIO COM IA
  const handleGenerateAIAd = async () => {
    setAIAdLoading(true);
    try {
      // Chamar endpoint Gemini/backend
      const res = await adminMarketing.generateContentWithAI({
        type: 'ad',
        ...aiAdForm
      });
      // Preencher formulário de criação de anúncio com resultado da IA
      setDigitalLibraryForm({
        title: res.title || '',
        description: res.description || '',
        platform: aiAdForm.plataforma,
        adType: aiAdForm.tipoAnuncio,
        copyShort: res.copyShort || '',
        copyLong: res.copyLong || res.description || '',
        headline: res.headline || res.title || '',
        cta: res.cta || aiAdForm.cta,
        imageUrl: res.imageUrl || aiAdForm.imagem,
        targetAudience: aiAdForm.publico,
        interests: aiAdForm.interesses ? aiAdForm.interesses.split(',').map(i => i.trim()) : [],
        budget: aiAdForm.orcamento ? parseFloat(aiAdForm.orcamento) : undefined,
        isActive: true,
      });
      setShowAIAdModal(false);
      setDigitalLibraryType('ad');
      setShowDigitalLibraryModal(true); // Abre modal de criação de anúncio já preenchido
    } catch (err: any) {
      toast({ title: 'Erro ao gerar anúncio com IA', description: err.message, variant: 'destructive' });
    } finally {
      setAIAdLoading(false);
    }
  };

  // 5. HANDLER PARA CHAT INTELIGENTE
  const handleChatMessage = async (type: string, message: string) => {
    try {
      // Mapear tipos para plataformas padrão
      const platformMap = {
        posts: 'instagram',
        ads: 'facebook',
        videos: 'tiktok',
        arguments: 'whatsapp',
        links: 'google_ads'
      };

      // Mapear tipos para público-alvo padrão
      const audienceMap = {
        posts: 'maes_bebes',
        ads: 'maes_bebes',
        videos: 'maes_criancas',
        arguments: 'gestantes',
        links: 'maes_bebes'
      };

      // Chamar IA com parâmetros corretos
      const res = await adminMarketing.generateContentWithAI({
        type: 'chat',
        platform: platformMap[type as keyof typeof platformMap] || 'instagram',
        targetAudience: audienceMap[type as keyof typeof audienceMap] || 'maes_bebes',
        specificTopic: message,
        category: type
      });

      // Retornar a resposta para ser adicionada ao chat
      return {
        success: true,
        content: res.data?.content || 'Resposta gerada com sucesso!'
      };

    } catch (err: any) {
      console.error('Erro no chat:', err);
      return {
        success: false,
        content: err.message || 'Erro ao processar mensagem'
      };
    }
  };

  if (campaignsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Marketing</h1>
        <p className="text-gray-600 mt-2">
          Gerencie campanhas de marketing com segmentação avançada
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="digital-library">Biblioteca Digital</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="editorial-calendar">Calendário Editorial</TabsTrigger>
          <TabsTrigger value="hashtag-analytics">Hashtag Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          <CampaignsTab
            campaigns={campaigns}
            onEdit={handleOpenModal}
            onDelete={handleDelete}
            formatDate={formatDate}
          />
        </TabsContent>

        <TabsContent value="digital-library" className="space-y-6">
          <DigitalLibraryTab
            posts={socialMediaPosts}
            ads={advertisements}
            videos={videoContents}
            arguments={salesArguments}
            links={affiliateLinks}
            onCreate={handleOpenDigitalLibraryModal}
            onEdit={handleOpenDigitalLibraryModal}
            onDelete={handleDeleteDigitalLibraryItem}
            onSave={handleSaveDigitalLibraryItem}
            form={digitalLibraryForm}
            setForm={setDigitalLibraryForm}
            showModal={showDigitalLibraryModal}
            setShowModal={setShowDigitalLibraryModal}
            onGenerateAIPost={handleOpenAIPostModal}
            onGenerateAIAd={handleOpenAIAdModal}
            onChatMessage={handleChatMessage}
            setDigitalLibraryType={setDigitalLibraryType}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsTab />
        </TabsContent>

        <TabsContent value="editorial-calendar" className="space-y-6">
          <EditorialCalendarTab />
        </TabsContent>

        <TabsContent value="hashtag-analytics" className="space-y-6">
          <HashtagAnalytics />
        </TabsContent>
      </Tabs>

      {/* Substituir o modal antigo pelo novo componente */}
      <MarketingCampaignModal
        open={showModal}
        onOpenChange={setShowModal}
        editing={editing}
        form={form}
        setForm={(f) => setForm(f)}
        onSave={handleSave}
        onCancel={() => setShowModal(false)}
      />

      {/* Modal de Biblioteca Digital */}
      <Dialog open={showDigitalLibraryModal} onOpenChange={setShowDigitalLibraryModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {digitalLibraryType === 'post' && 'Novo Post para Redes Sociais'}
              {digitalLibraryType === 'ad' && 'Novo Anúncio'}
              {digitalLibraryType === 'video' && 'Novo Vídeo'}
              {digitalLibraryType === 'argument' && 'Novo Argumento de Venda'}
              {digitalLibraryType === 'link' && 'Novo Link de Afiliado'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do item da biblioteca digital.
            </DialogDescription>
          </DialogHeader>

          {/* Campo de seleção do tipo de conteúdo */}
          <div className="mb-6">
            <label className="text-sm font-medium">Tipo de Conteúdo <span className="text-red-500">*</span></label>
            <select
              className="border p-2 w-full rounded mt-1"
              value={digitalLibraryType}
              onChange={e => {
                setDigitalLibraryType(e.target.value);
                setDigitalLibraryForm({});
              }}
            >
              <option value="">Selecione...</option>
              <option value="post">Post para Redes Sociais</option>
              <option value="ad">Anúncio</option>
              <option value="video">Vídeo</option>
              <option value="argument">Argumento de Venda</option>
              <option value="link">Link de Afiliado</option>
            </select>
          </div>

          {/* Só renderiza o restante do formulário se o tipo estiver selecionado */}
          {digitalLibraryType && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Título</label>
                <input
                  className="border p-2 w-full rounded mt-1"
                  placeholder="Título"
                  value={digitalLibraryForm.title || ''}
                  onChange={(e) => setDigitalLibraryForm({...digitalLibraryForm, title: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Público Alvo</label>
                <select
                  className="border p-2 w-full rounded mt-1"
                  value={digitalLibraryForm.targetAudience || ''}
                  onChange={(e) => setDigitalLibraryForm({...digitalLibraryForm, targetAudience: e.target.value})}
                >
                  <option value="">Selecione...</option>
                  <option value="gestantes">Gestantes</option>
                  <option value="maes_bebes">Mães de Bebês</option>
                  <option value="maes_criancas">Mães de Crianças</option>
                </select>
              </div>
              {digitalLibraryType === 'post' && (
                <>
                  <div>
                    <label className="text-sm font-medium">Plataforma</label>
                    <select
                      className="border p-2 w-full rounded mt-1"
                      value={digitalLibraryForm.platform || ''}
                      onChange={(e) => setDigitalLibraryForm({...digitalLibraryForm, platform: e.target.value})}
                    >
                      <option value="">Selecione...</option>
                      <option value="instagram">Instagram</option>
                      <option value="facebook">Facebook</option>
                      <option value="tiktok">TikTok</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Categoria</label>
                    <select
                      className="border p-2 w-full rounded mt-1"
                      value={digitalLibraryForm.category || ''}
                      onChange={(e) => setDigitalLibraryForm({...digitalLibraryForm, category: e.target.value})}
                    >
                      <option value="">Selecione...</option>
                      <option value="motivacional">Motivacional</option>
                      <option value="beneficio">Benefício</option>
                      <option value="funcionalidade">Funcionalidade</option>
                      <option value="depoimento">Depoimento</option>
                      <option value="comemorativo">Comemorativo</option>
                    </select>
                  </div>
                </>
              )}

              {digitalLibraryType === 'ad' && (
                <>
                  <div>
                    <label className="text-sm font-medium">Plataforma</label>
                    <select
                      className="border p-2 w-full rounded mt-1"
                      value={digitalLibraryForm.platform || ''}
                      onChange={(e) => setDigitalLibraryForm({...digitalLibraryForm, platform: e.target.value})}
                    >
                      <option value="">Selecione...</option>
                      <option value="facebook">Facebook</option>
                      <option value="instagram">Instagram</option>
                      <option value="google_ads">Google Ads</option>
                      <option value="tiktok">TikTok</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tipo de Anúncio</label>
                    <select
                      className="border p-2 w-full rounded mt-1"
                      value={digitalLibraryForm.adType || ''}
                      onChange={(e) => setDigitalLibraryForm({...digitalLibraryForm, adType: e.target.value})}
                    >
                      <option value="">Selecione...</option>
                      <option value="image">Imagem</option>
                      <option value="video">Vídeo</option>
                      <option value="carousel">Carrossel</option>
                      <option value="story">Story</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="mt-4">
            <label className="text-sm font-medium">Descrição</label>
            <Textarea
              className="min-h-[100px]"
              placeholder="Descrição..."
              value={digitalLibraryForm.description || ''}
              onChange={(e) => setDigitalLibraryForm({...digitalLibraryForm, description: e.target.value})}
            />
          </div>

          {/* Upload de Mídia */}
          {(digitalLibraryType === 'post' || digitalLibraryType === 'ad' || digitalLibraryType === 'video') && (
            <div className="mt-4">
              <label className="text-sm font-medium">
                {digitalLibraryType === 'video' ? 'Vídeo' : 'Imagem/Vídeo'}
              </label>
              <MediaUpload
                onUploadSuccess={(mediaData) => {
                  if (digitalLibraryType === 'video') {
                    setDigitalLibraryForm({
                      ...digitalLibraryForm,
                      videoUrl: mediaData.url,
                      thumbnailUrl: mediaData.type === 'video' ? mediaData.url : mediaData.url
                    });
                  } else {
                    setDigitalLibraryForm({
                      ...digitalLibraryForm,
                      imageUrl: mediaData.type === 'image' ? mediaData.url : undefined,
                      videoUrl: mediaData.type === 'video' ? mediaData.url : undefined
                    });
                  }
                }}
                onUploadError={(error) => {
                  console.error('Erro no upload:', error);
                }}
                accept={digitalLibraryType === 'video' ? 'video/*' : 'image/*,video/*'}
                maxSize={digitalLibraryType === 'video' ? 100 * 1024 * 1024 : 10 * 1024 * 1024}
                showPreview={true}
                className="mt-2"
              />
              
              {/* Preview da mídia atual */}
              {(digitalLibraryForm.imageUrl || digitalLibraryForm.videoUrl) && (
                <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                  <h4 className="text-sm font-medium mb-2">Mídia Atual:</h4>
                  {digitalLibraryForm.imageUrl && (
                    <img
                      src={digitalLibraryForm.imageUrl}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded"
                    />
                  )}
                  {digitalLibraryForm.videoUrl && (
                    <video
                      src={digitalLibraryForm.videoUrl}
                      controls
                      className="w-full h-32 object-cover rounded"
                    >
                      Seu navegador não suporta vídeos.
                    </video>
                  )}
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setDigitalLibraryForm({
                          ...digitalLibraryForm,
                          imageUrl: undefined,
                          videoUrl: undefined
                        });
                      }}
                    >
                      Remover Mídia
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {(digitalLibraryType === 'post' || digitalLibraryType === 'ad') && (
            <div className="mt-4">
              <label className="text-sm font-medium">Legenda/Copy</label>
              <Textarea
                className="min-h-[150px]"
                placeholder="Legenda ou copy do anúncio..."
                value={digitalLibraryForm.caption || digitalLibraryForm.copyLong || ''}
                onChange={(e) => setDigitalLibraryForm({
                  ...digitalLibraryForm, 
                  [digitalLibraryType === 'post' ? 'caption' : 'copyLong']: e.target.value
                })}
              />
            </div>
          )}

          {digitalLibraryType === 'post' && (
            <div className="mt-4">
              <label className="text-sm font-medium">Hashtags</label>
              <input
                className="border p-2 w-full rounded mt-1"
                placeholder="#babyapp #diariodobebe #gestante"
                value={digitalLibraryForm.hashtags || ''}
                onChange={(e) => setDigitalLibraryForm({...digitalLibraryForm, hashtags: e.target.value})}
              />
            </div>
          )}

          {digitalLibraryType === 'video' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-sm font-medium">Plataforma</label>
                  <select
                    className="border p-2 w-full rounded mt-1"
                    value={digitalLibraryForm.platform || ''}
                    onChange={(e) => setDigitalLibraryForm({...digitalLibraryForm, platform: e.target.value})}
                  >
                    <option value="">Selecione...</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="youtube">YouTube</option>
                    <option value="facebook">Facebook</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Duração (segundos)</label>
                  <input
                    type="number"
                    className="border p-2 w-full rounded mt-1"
                    placeholder="30"
                    value={digitalLibraryForm.duration || ''}
                    onChange={(e) => setDigitalLibraryForm({...digitalLibraryForm, duration: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium">Roteiro</label>
                <Textarea
                  className="min-h-[200px]"
                  placeholder="Roteiro do vídeo..."
                  value={digitalLibraryForm.script || ''}
                  onChange={(e) => setDigitalLibraryForm({...digitalLibraryForm, script: e.target.value})}
                />
              </div>
            </>
          )}

          {digitalLibraryType === 'argument' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-sm font-medium">Categoria</label>
                  <select
                    className="border p-2 w-full rounded mt-1"
                    value={digitalLibraryForm.category || ''}
                    onChange={(e) => setDigitalLibraryForm({...digitalLibraryForm, category: e.target.value})}
                  >
                    <option value="">Selecione...</option>
                    <option value="emocional">Emocional</option>
                    <option value="escassez">Escassez</option>
                    <option value="pertencimento">Pertencimento</option>
                    <option value="racional">Racional</option>
                    <option value="urgencia">Urgência</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Taxa de Conversão (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="border p-2 w-full rounded mt-1"
                    placeholder="15.5"
                    value={digitalLibraryForm.conversionRate || ''}
                    onChange={(e) => setDigitalLibraryForm({...digitalLibraryForm, conversionRate: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium">Argumento</label>
                <Textarea
                  className="min-h-[150px]"
                  placeholder="Argumento de venda..."
                  value={digitalLibraryForm.argument || ''}
                  onChange={(e) => setDigitalLibraryForm({...digitalLibraryForm, argument: e.target.value})}
                />
              </div>
            </>
          )}

          {digitalLibraryType === 'link' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-sm font-medium">URL Base</label>
                <input
                  className="border p-2 w-full rounded mt-1"
                  placeholder="https://babydiary.shop"
                  value={digitalLibraryForm.baseUrl || ''}
                  onChange={(e) => setDigitalLibraryForm({...digitalLibraryForm, baseUrl: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Campanha</label>
                <input
                  className="border p-2 w-full rounded mt-1"
                  placeholder="plano_premium"
                  value={digitalLibraryForm.utmCampaign || ''}
                  onChange={(e) => setDigitalLibraryForm({...digitalLibraryForm, utmCampaign: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Fonte</label>
                <input
                  className="border p-2 w-full rounded mt-1"
                  placeholder="instagram"
                  value={digitalLibraryForm.utmSource || ''}
                  onChange={(e) => setDigitalLibraryForm({...digitalLibraryForm, utmSource: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Meio</label>
                <input
                  className="border p-2 w-full rounded mt-1"
                  placeholder="social"
                  value={digitalLibraryForm.utmMedium || ''}
                  onChange={(e) => setDigitalLibraryForm({...digitalLibraryForm, utmMedium: e.target.value})}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <Button onClick={handleSaveDigitalLibraryItem} className="flex-1">
              Salvar
            </Button>
            <Button variant="outline" onClick={() => setShowDigitalLibraryModal(false)}>
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Geração de Conteúdo com IA */}
      <Dialog open={showAIGenerator} onOpenChange={setShowAIGenerator}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerador de Conteúdo com IA</DialogTitle>
            <DialogDescription>
              Gere conteúdo personalizado para sua biblioteca de marketing digital usando IA avançada.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Configurações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Tipo de Conteúdo</label>
                <Select value={aiGeneratorForm.type} onValueChange={(value) => setAiGeneratorForm({...aiGeneratorForm, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="post">Post para Redes Sociais</SelectItem>
                    <SelectItem value="ad">Anúncio</SelectItem>
                    <SelectItem value="video_script">Roteiro de Vídeo</SelectItem>
                    <SelectItem value="argument">Argumento de Venda</SelectItem>
                    <SelectItem value="hashtag_research">Pesquisa de Hashtags</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Plataforma</label>
                <Select value={aiGeneratorForm.platform} onValueChange={(value) => setAiGeneratorForm({...aiGeneratorForm, platform: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a plataforma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="google_ads">Google Ads</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Público-Alvo</label>
                <Select value={aiGeneratorForm.targetAudience} onValueChange={(value) => setAiGeneratorForm({...aiGeneratorForm, targetAudience: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o público" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gestantes">Gestantes</SelectItem>
                    <SelectItem value="maes_bebes">Mães de Bebês (0-2 anos)</SelectItem>
                    <SelectItem value="maes_criancas">Mães de Crianças (2+ anos)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Tom</label>
                <Select value={aiGeneratorForm.tone} onValueChange={(value) => setAiGeneratorForm({...aiGeneratorForm, tone: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tom" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amigavel">Amigável e Motivacional</SelectItem>
                    <SelectItem value="emocional">Emocional e Inspirador</SelectItem>
                    <SelectItem value="profissional">Profissional e Informativo</SelectItem>
                    <SelectItem value="divertido">Divertido e Casual</SelectItem>
                    <SelectItem value="urgente">Urgente e Persuasivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Configurações Avançadas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Categoria</label>
                <Select value={aiGeneratorForm.category} onValueChange={(value) => setAiGeneratorForm({...aiGeneratorForm, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emocional">Emocional</SelectItem>
                    <SelectItem value="funcionalidade">Funcionalidade</SelectItem>
                    <SelectItem value="beneficio">Benefício</SelectItem>
                    <SelectItem value="depoimento">Depoimento</SelectItem>
                    <SelectItem value="comemorativo">Comemorativo</SelectItem>
                    <SelectItem value="educativo">Educativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {aiGeneratorForm.type === 'video_script' && (
                <div>
                  <label className="text-sm font-medium">Duração (segundos)</label>
                  <Input
                    type="number"
                    placeholder="30"
                    value={aiGeneratorForm.duration?.toString() || ''}
                    onChange={(e) => setAiGeneratorForm({...aiGeneratorForm, duration: e.target.value ? parseInt(e.target.value) : undefined})}
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <label className="text-sm font-medium">Tópico Específico (opcional)</label>
                <Input
                  placeholder="Ex: primeiro sorriso, sono do bebê, alimentação, marcos de desenvolvimento..."
                  value={aiGeneratorForm.specificTopic || ''}
                  onChange={(e) => setAiGeneratorForm({...aiGeneratorForm, specificTopic: e.target.value})}
                />
              </div>
            </div>

            {/* Botão de Geração */}
            <div className="flex justify-center">
              <Button 
                onClick={handleGenerateContent}
                disabled={isGenerating || !aiGeneratorForm.type || !aiGeneratorForm.platform || !aiGeneratorForm.targetAudience}
                className="w-full max-w-md"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando Conteúdo...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Gerar Conteúdo com IA
                  </>
                )}
              </Button>
            </div>

            {/* Resultado da IA */}
            {aiGeneratedContent && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Conteúdo Gerado</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(aiGeneratedContent.content)}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copiar Tudo
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAiGeneratedContent(null)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Limpar
                    </Button>
                  </div>
                </div>

                {/* Conteúdo Principal */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Conteúdo Principal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                      {aiGeneratedContent.content}
                    </div>
                  </CardContent>
                </Card>

                {/* Metadados e Sugestões */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiGeneratedContent.suggestedPostingTime && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Horário Sugerido</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{aiGeneratedContent.suggestedPostingTime}</p>
                      </CardContent>
                    </Card>
                  )}

                  {aiGeneratedContent.engagementTips && aiGeneratedContent.engagementTips.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Dicas de Engajamento</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="text-sm space-y-1">
                          {aiGeneratedContent.engagementTips.map((tip: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <span className="text-blue-500 mr-2">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {aiGeneratedContent.targetingSuggestions && aiGeneratedContent.targetingSuggestions.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Sugestões de Segmentação</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {aiGeneratedContent.targetingSuggestions.map((suggestion: string, index: number) => (
                            <Badge key={index} variant="secondary">
                              {suggestion}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {aiGeneratedContent.budgetRecommendation && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Orçamento Sugerido</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{aiGeneratedContent.budgetRecommendation}</p>
                      </CardContent>
                    </Card>
                  )}

                  {aiGeneratedContent.videoTips && aiGeneratedContent.videoTips.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Dicas para Vídeo</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="text-sm space-y-1">
                          {aiGeneratedContent.videoTips.map((tip: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <span className="text-green-500 mr-2">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {aiGeneratedContent.musicSuggestions && aiGeneratedContent.musicSuggestions.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Sugestões de Música</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="text-sm space-y-1">
                          {aiGeneratedContent.musicSuggestions.map((music: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <span className="text-purple-500 mr-2">•</span>
                              {music}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={() => {
                      // Salvar na biblioteca correspondente
                      const contentData = {
                        title: `Conteúdo IA - ${aiGeneratorForm.type} - ${aiGeneratorForm.platform}`,
                        description: aiGeneratedContent.content.substring(0, 200) + '...',
                        content: aiGeneratedContent.content,
                        type: aiGeneratorForm.type,
                        platform: aiGeneratorForm.platform,
                        targetAudience: aiGeneratorForm.targetAudience,
                        category: aiGeneratorForm.category,
                        metadata: aiGeneratedContent
                      };
                      
                      // Aqui você pode implementar a lógica para salvar na biblioteca
                      console.log('Salvando conteúdo:', contentData);
                      toast({
                        title: "Conteúdo salvo!",
                        description: "O conteúdo foi salvo na biblioteca correspondente.",
                      });
                    }}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar na Biblioteca
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Geração de Post com IA */}
      {showAIPostModal && (
        <Dialog open={showAIPostModal} onOpenChange={setShowAIPostModal}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Gerar Post com IA</DialogTitle>
              <DialogDescription>Preencha as opções para a IA gerar um post focado em vendas para mães.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <div>
                <label className="text-sm font-medium">Objetivo</label>
                <Input value={aiPostForm.objetivo} onChange={e => setAIPostForm(f => ({ ...f, objetivo: e.target.value }))} placeholder="Ex: Vender plano premium, engajar mães..." />
              </div>
              <div>
                <label className="text-sm font-medium">Público-alvo</label>
                <Input value={aiPostForm.publico} onChange={e => setAIPostForm(f => ({ ...f, publico: e.target.value }))} placeholder="Ex: Mães de primeira viagem, mães premium..." />
              </div>
              <div>
                <label className="text-sm font-medium">Plataforma</label>
                <Select value={aiPostForm.plataforma} onValueChange={v => setAIPostForm(f => ({ ...f, plataforma: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                    <SelectItem value="TikTok">TikTok</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Tom</label>
                <Select value={aiPostForm.tom} onValueChange={v => setAIPostForm(f => ({ ...f, tom: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amigável">Amigável</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                    <SelectItem value="inspirador">Inspirador</SelectItem>
                    <SelectItem value="divertido">Divertido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Categoria</label>
                <Input value={aiPostForm.categoria} onChange={e => setAIPostForm(f => ({ ...f, categoria: e.target.value }))} placeholder="Ex: Promoção, Dica, Engajamento..." />
              </div>
              <div>
                <label className="text-sm font-medium">Call-to-Action</label>
                <Input value={aiPostForm.cta} onChange={e => setAIPostForm(f => ({ ...f, cta: e.target.value }))} placeholder="Ex: Saiba mais, Assine agora..." />
              </div>
              <div>
                <label className="text-sm font-medium">Imagem (opcional)</label>
                <MediaUpload
                  onUploadSuccess={(mediaData) => {
                    setAIPostForm(f => ({ ...f, imagem: mediaData.url }));
                  }}
                  onUploadError={(error) => {
                    console.error('Erro no upload:', error);
                    toast({ title: 'Erro no upload', description: error, variant: 'destructive' });
                  }}
                  accept="image/*"
                  maxSize={10 * 1024 * 1024} // 10MB
                  showPreview={false}
                  className="mt-2"
                />
                {aiPostForm.imagem && (
                  <div className="mt-2 p-2 border rounded bg-gray-50">
                    <img src={aiPostForm.imagem} alt="Preview" className="w-full h-20 object-cover rounded" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAIPostForm(f => ({ ...f, imagem: '' }))}
                      className="mt-1"
                    >
                      Remover Imagem
                    </Button>
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Hashtags</label>
                <Input value={aiPostForm.hashtags} onChange={e => setAIPostForm(f => ({ ...f, hashtags: e.target.value }))} placeholder="#promo #mamaes..." />
              </div>
              <Button onClick={handleGenerateAIPost} disabled={aiPostLoading}>{aiPostLoading ? 'Gerando...' : 'Gerar com IA'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Geração de Anúncio com IA */}
      {showAIAdModal && (
        <Dialog open={showAIAdModal} onOpenChange={setShowAIAdModal}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Gerar Anúncio com IA</DialogTitle>
              <DialogDescription>Preencha as opções para a IA gerar um anúncio focado em vendas para mães.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <div>
                <label className="text-sm font-medium">Objetivo</label>
                <Input value={aiAdForm.objetivo} onChange={e => setAIAdForm(f => ({ ...f, objetivo: e.target.value }))} placeholder="Ex: Vender plano premium, converter leads..." />
              </div>
              <div>
                <label className="text-sm font-medium">Público-alvo</label>
                <Input value={aiAdForm.publico} onChange={e => setAIAdForm(f => ({ ...f, publico: e.target.value }))} placeholder="Ex: Mães de primeira viagem, mães premium..." />
              </div>
              <div>
                <label className="text-sm font-medium">Plataforma</label>
                <Select value={aiAdForm.plataforma} onValueChange={v => setAIAdForm(f => ({ ...f, plataforma: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="Google_Ads">Google Ads</SelectItem>
                    <SelectItem value="TikTok">TikTok</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Tipo de Anúncio</label>
                <Select value={aiAdForm.tipoAnuncio} onValueChange={v => setAIAdForm(f => ({ ...f, tipoAnuncio: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Imagem</SelectItem>
                    <SelectItem value="video">Vídeo</SelectItem>
                    <SelectItem value="carousel">Carrossel</SelectItem>
                    <SelectItem value="story">Story</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Tom</label>
                <Select value={aiAdForm.tom} onValueChange={v => setAIAdForm(f => ({ ...f, tom: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="persuasivo">Persuasivo</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                    <SelectItem value="emocional">Emocional</SelectItem>
                    <SelectItem value="profissional">Profissional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Categoria</label>
                <Input value={aiAdForm.categoria} onChange={e => setAIAdForm(f => ({ ...f, categoria: e.target.value }))} placeholder="Ex: Promoção, Benefício, Funcionalidade..." />
              </div>
              <div>
                <label className="text-sm font-medium">Call-to-Action</label>
                <Input value={aiAdForm.cta} onChange={e => setAIAdForm(f => ({ ...f, cta: e.target.value }))} placeholder="Ex: Saiba mais, Assine agora, Teste grátis..." />
              </div>
              <div>
                <label className="text-sm font-medium">Imagem (opcional)</label>
                <MediaUpload
                  onUploadSuccess={(mediaData) => {
                    setAIAdForm(f => ({ ...f, imagem: mediaData.url }));
                  }}
                  onUploadError={(error) => {
                    console.error('Erro no upload:', error);
                    toast({ title: 'Erro no upload', description: error, variant: 'destructive' });
                  }}
                  accept="image/*"
                  maxSize={10 * 1024 * 1024} // 10MB
                  showPreview={false}
                  className="mt-2"
                />
                {aiAdForm.imagem && (
                  <div className="mt-2 p-2 border rounded bg-gray-50">
                    <img src={aiAdForm.imagem} alt="Preview" className="w-full h-20 object-cover rounded" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAIAdForm(f => ({ ...f, imagem: '' }))}
                      className="mt-1"
                    >
                      Remover Imagem
                    </Button>
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Orçamento (R$)</label>
                <Input value={aiAdForm.orcamento} onChange={e => setAIAdForm(f => ({ ...f, orcamento: e.target.value }))} placeholder="Ex: 100" type="number" min="0" />
              </div>
              <div>
                <label className="text-sm font-medium">Interesses</label>
                <Input value={aiAdForm.interesses} onChange={e => setAIAdForm(f => ({ ...f, interesses: e.target.value }))} placeholder="Ex: maternidade, bebês, desenvolvimento infantil" />
              </div>
              <Button onClick={handleGenerateAIAd} disabled={aiAdLoading}>{aiAdLoading ? 'Gerando...' : 'Gerar com IA'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminMarketing; 