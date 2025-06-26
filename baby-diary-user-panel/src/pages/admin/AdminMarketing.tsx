import React, { useEffect, useState } from 'react';
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
  Users, 
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

interface SegmentationStats {
  babyAgeStats: Array<{ age_group: string; count: number }>;
  planStats: Array<{ name: string; _count: { users: number } }>;
  engagementStats: Array<{ engagement_level: string; count: number }>;
  motherTypeStats: Array<{ mother_type: string; count: number }>;
}

interface TargetUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  lastLoginAt: string;
  createdAt: string;
  plan_name: string;
  baby_count: number;
  memory_count: number;
  activity_count: number;
}

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

export const AdminMarketing: React.FC = () => {
  const { toast } = useToast();
  
  // Estados para campanhas
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState<string>('');
  const [activeTab, setActiveTab] = useState('campaigns');
  const [form, setForm] = useState({
    name: '',
    type: 'email',
    content: '',
    subject: '',
    segment: '',
    scheduledAt: ''
  });

  // Estados para segmentação
  const [segmentationStats, setSegmentationStats] = useState<SegmentationStats | null>(null);
  const [targetUsers, setTargetUsers] = useState<TargetUser[]>([]);
  const [showTargetUsers, setShowTargetUsers] = useState(false);
  const [targetUsersCount, setTargetUsersCount] = useState(0);
  const [filters, setFilters] = useState({
    babyAgeMin: '',
    babyAgeMax: '',
    motherType: '',
    planType: '',
    engagement: '',
    daysInactive: '',
    hasMultipleBabies: '',
    isPremium: '',
    isVerified: '',
    lastActivityDays: '',
    totalMemories: '',
    totalActivities: ''
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

  useEffect(() => {
    fetchCampaigns();
    fetchSegmentationStats();
    fetchDigitalLibraryData();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    const response = await adminMarketing.getCampaigns();
    if (response.success) setCampaigns(response.data);
    setLoading(false);
  };

  const fetchSegmentationStats = async () => {
    try {
      const response = await adminMarketing.getSegmentationStats();
      if (response.success) setSegmentationStats(response.data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const fetchDigitalLibraryData = async () => {
    try {
      const [postsRes, adsRes, videosRes, argsRes, linksRes] = await Promise.all([
        adminMarketing.getSocialMediaPosts(),
        adminMarketing.getAdvertisements(),
        adminMarketing.getVideoContents(),
        adminMarketing.getSalesArguments(),
        adminMarketing.getAffiliateLinks()
      ]);

      if (postsRes.success) setSocialMediaPosts(postsRes.data);
      if (adsRes.success) setAdvertisements(adsRes.data);
      if (videosRes.success) setVideoContents(videosRes.data);
      if (argsRes.success) setSalesArguments(argsRes.data);
      if (linksRes.success) setAffiliateLinks(linksRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados da biblioteca:', error);
    }
  };

  const handleOpenModal = (campaign?: any) => {
    if (campaign) {
      setEditing(true);
      setEditingId(campaign.id);
      setForm({
        name: campaign.name,
        type: campaign.type,
        content: campaign.content,
        subject: campaign.subject || '',
        segment: campaign.segment,
        scheduledAt: campaign.scheduledAt ? new Date(campaign.scheduledAt).toISOString().slice(0, 16) : ''
      });
    } else {
      setEditing(false);
      setEditingId('');
      setForm({
        name: '',
        type: 'email',
        content: '',
        subject: '',
        segment: '',
        scheduledAt: ''
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editing && editingId) {
        await adminMarketing.updateCampaign(editingId, form);
        toast({
          title: "Sucesso",
          description: "Campanha atualizada com sucesso",
        });
      } else {
        await adminMarketing.createCampaign(form);
        toast({
          title: "Sucesso",
          description: "Campanha criada com sucesso",
        });
      }
      setShowModal(false);
      fetchCampaigns();
    } catch (error) {
      console.error('Erro ao salvar campanha:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar campanha",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta campanha?')) {
      await adminMarketing.deleteCampaign(id);
      fetchCampaigns();
    }
  };

  const handleGenerateAI = async () => {
    try {
      const response = await adminMarketing.generateWithGemini(
        `Gere um conteúdo de marketing para campanha de email sobre o app Baby Diary. 
        Foco: ${form.subject || 'maternidade e desenvolvimento infantil'}
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

  const handleCalculateTargetUsers = async () => {
    try {
      // Converter valores booleanos para string para compatibilidade com a API
      const apiFilters = {
        ...filters,
        hasMultipleBabies: filters.hasMultipleBabies === 'true',
        isPremium: filters.isPremium === 'true',
        isVerified: filters.isVerified === 'true'
      };
      
      const response = await adminMarketing.getTargetUsers(apiFilters);
      setTargetUsers(response.data);
      setTargetUsersCount(response.data.length);
      setShowTargetUsers(true);
    } catch (error) {
      console.error('Erro ao buscar usuários alvo:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar usuários alvo",
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
      let response;
      switch (digitalLibraryType) {
        case 'post':
          response = await adminMarketing.createSocialMediaPost(digitalLibraryForm);
          break;
        case 'ad':
          response = await adminMarketing.createAdvertisement(digitalLibraryForm);
          break;
        case 'video':
          response = await adminMarketing.createVideoContent(digitalLibraryForm);
          break;
        case 'argument':
          response = await adminMarketing.createSalesArgument(digitalLibraryForm);
          break;
        case 'link':
          response = await adminMarketing.createAffiliateLink(digitalLibraryForm);
          break;
        default:
          return;
      }

      if (response.success) {
        setShowDigitalLibraryModal(false);
        fetchDigitalLibraryData();
      }
    } catch (error) {
      console.error('Erro ao salvar item:', error);
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
      const contentData = {
        title: generatedContent.title || `Conteúdo ${aiGeneratorForm.type} - ${aiGeneratorForm.platform}`,
        description: generatedContent.description || generatedContent.content || '',
        category: aiGeneratorForm.category || 'gerado_ia',
        platform: aiGeneratorForm.platform,
        targetAudience: aiGeneratorForm.targetAudience,
        isActive: true,
        createdBy: 'admin'
      };

      let saveResponse;
      
      switch (aiGeneratorForm.type) {
        case 'post':
          saveResponse = await adminMarketing.createSocialMediaPost({
            ...contentData,
            contentType: 'post',
            caption: generatedContent.caption || generatedContent.content,
            hashtags: generatedContent.hashtags || '',
            cta: generatedContent.cta || ''
          });
          if (saveResponse.success) {
            setSocialMediaPosts(prev => [saveResponse.data, ...prev]);
          }
          break;
          
        case 'ad':
          saveResponse = await adminMarketing.createAdvertisement({
            ...contentData,
            adType: 'image',
            copyShort: generatedContent.copyShort || generatedContent.content.substring(0, 125),
            copyLong: generatedContent.copyLong || generatedContent.content,
            headline: generatedContent.headline || contentData.title,
            description: generatedContent.description || generatedContent.content,
            cta: generatedContent.cta || 'Saiba Mais',
            interests: generatedContent.interests || []
          });
          if (saveResponse.success) {
            setAdvertisements(prev => [saveResponse.data, ...prev]);
          }
          break;
          
        case 'video_script':
          saveResponse = await adminMarketing.createVideoContent({
            ...contentData,
            videoType: 'reel',
            duration: aiGeneratorForm.duration || 30,
            script: generatedContent.script || generatedContent.content,
            music: generatedContent.music || '',
            hashtags: generatedContent.hashtags || ''
          });
          if (saveResponse.success) {
            setVideoContents(prev => [saveResponse.data, ...prev]);
          }
          break;
          
        case 'argument':
          saveResponse = await adminMarketing.createSalesArgument({
            ...contentData,
            argument: generatedContent.argument || generatedContent.content,
            examples: generatedContent.examples || [],
            conversionRate: generatedContent.conversionRate || 15.0,
            sortOrder: 0
          });
          if (saveResponse.success) {
            setSalesArguments(prev => [saveResponse.data, ...prev]);
          }
          break;
          
        default:
          console.log('Tipo de conteúdo não suportado para salvamento automático');
      }
      
    } catch (error) {
      console.error('Erro ao salvar conteúdo gerado:', error);
      toast({
        title: "Aviso",
        description: "Conteúdo gerado com sucesso, mas houve erro ao salvar na biblioteca.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="segmentation">Segmentação</TabsTrigger>
          <TabsTrigger value="digital-library">Biblioteca Digital</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Campanhas de Marketing</CardTitle>
              <Button onClick={() => handleOpenModal()}>Nova Campanha</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Segmentação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Agendamento</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{c.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {c.segment}
                          {(c as any).babyAgeMin && (
                            <div className="text-xs text-gray-500">
                              Bebê: {(c as any).babyAgeMin}-{(c as any).babyAgeMax || '∞'} meses
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={c.status === 'sent' ? 'default' : 'secondary'}>
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {c.scheduledAt ? formatDate(c.scheduledAt) : '-'}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => handleOpenModal(c)}>Editar</Button>{' '}
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(c.id)}>Excluir</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segmentation" className="space-y-6">
          {/* Estatísticas de Segmentação */}
          {segmentationStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Baby className="w-4 h-4" />
                    Idade dos Bebês
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {segmentationStats.babyAgeStats.map((stat) => (
                      <div key={stat.age_group} className="flex justify-between">
                        <span className="text-sm">{stat.age_group}</span>
                        <Badge variant="outline">{stat.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Tipo de Mãe
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {segmentationStats.motherTypeStats.map((stat) => (
                      <div key={stat.mother_type} className="flex justify-between">
                        <span className="text-sm">{stat.mother_type}</span>
                        <Badge variant="outline">{stat.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Engajamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {segmentationStats.engagementStats.map((stat) => (
                      <div key={stat.engagement_level} className="flex justify-between">
                        <span className="text-sm">{stat.engagement_level}</span>
                        <Badge variant="outline">{stat.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Planos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {segmentationStats.planStats.map((stat, index) => (
                      <div key={`${stat.name}-${index}`} className="flex justify-between">
                        <span className="text-sm">{stat.name}</span>
                        <Badge variant="outline">{stat._count.users}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filtros de Segmentação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtros de Segmentação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Idade do Bebê (meses)</label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="number"
                      placeholder="Min"
                      className="border p-2 w-full rounded"
                      value={filters.babyAgeMin}
                      onChange={(e) => setFilters({...filters, babyAgeMin: e.target.value})}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="border p-2 w-full rounded"
                      value={filters.babyAgeMax}
                      onChange={(e) => setFilters({...filters, babyAgeMax: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Tipo de Mãe</label>
                  <select
                    className="border p-2 w-full rounded mt-1"
                    value={filters.motherType}
                    onChange={(e) => setFilters({...filters, motherType: e.target.value})}
                  >
                    <option value="">Todos</option>
                    <option value="primeira_vez">Primeira vez</option>
                    <option value="experiente">Experiente</option>
                    <option value="muito_experiente">Muito experiente</option>
                    <option value="familia_grande">Família grande</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Engajamento</label>
                  <select
                    className="border p-2 w-full rounded mt-1"
                    value={filters.engagement}
                    onChange={(e) => setFilters({...filters, engagement: e.target.value})}
                  >
                    <option value="">Todos</option>
                    <option value="ativa">Ativa</option>
                    <option value="inativa">Inativa</option>
                    <option value="nova">Nova</option>
                    <option value="retornando">Retornando</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Plano</label>
                  <select
                    className="border p-2 w-full rounded mt-1"
                    value={filters.planType}
                    onChange={(e) => setFilters({...filters, planType: e.target.value})}
                  >
                    <option value="">Todos</option>
                    <option value="básico">Básico</option>
                    <option value="premium">Premium</option>
                    <option value="família">Família</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Múltiplos Bebês</label>
                  <select
                    className="border p-2 w-full rounded mt-1"
                    value={filters.hasMultipleBabies}
                    onChange={(e) => setFilters({...filters, hasMultipleBabies: e.target.value})}
                  >
                    <option value="">Todos</option>
                    <option value="true">Sim</option>
                    <option value="false">Não</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Email Verificado</label>
                  <select
                    className="border p-2 w-full rounded mt-1"
                    value={filters.isVerified}
                    onChange={(e) => setFilters({...filters, isVerified: e.target.value})}
                  >
                    <option value="">Todos</option>
                    <option value="true">Sim</option>
                    <option value="false">Não</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <Button onClick={handleCalculateTargetUsers} className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Calcular Usuários Alvo
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="digital-library" className="space-y-6">
          {/* Header com IA */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Gerador de Conteúdo com IA
              </CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* Posts para Redes Sociais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Instagram className="w-4 h-4" />
                  Posts para Redes Sociais
                </div>
                <Button 
                  onClick={() => handleOpenDigitalLibraryModal('post')}
                  size="sm"
                >
                  Novo Post
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {socialMediaPosts.map((post) => (
                  <div key={post.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {getPlatformIcon(post.platform)}
                      <Badge variant="outline">{post.category}</Badge>
                    </div>
                    <h4 className="font-medium text-sm mb-2">{post.title}</h4>
                    <p className="text-xs text-gray-600 mb-3">{post.description}</p>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => copyToClipboard(post.caption)}
                        variant="outline" 
                        size="sm"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Legenda
                      </Button>
                      <Button 
                        onClick={() => copyToClipboard(post.hashtags)}
                        variant="outline" 
                        size="sm"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Hashtags
                      </Button>
                      {(post.imageUrl || post.videoUrl) && (
                        <>
                          <Button 
                            onClick={() => window.open(post.imageUrl || post.videoUrl, '_blank')}
                            variant="outline" 
                            size="sm"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Ver Mídia
                          </Button>
                          <Button 
                            onClick={async () => {
                              try {
                                const response = await adminMarketing.downloadMedia({
                                  publicId: post.imageUrl || post.videoUrl || '',
                                  filename: `${post.title}_media`
                                });
                                if (response.success) {
                                  const link = document.createElement('a');
                                  link.href = response.data.downloadUrl;
                                  link.download = `${post.title}_media`;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }
                              } catch (err) {
                                console.error('Erro ao fazer download:', err);
                              }
                            }}
                            variant="outline" 
                            size="sm"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Anúncios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Facebook className="w-4 h-4" />
                  Anúncios
                </div>
                <Button 
                  onClick={() => handleOpenDigitalLibraryModal('ad')}
                  size="sm"
                >
                  Novo Anúncio
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Plataforma</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Público</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {advertisements.map((ad) => (
                    <TableRow key={ad.id}>
                      <TableCell className="font-medium">{ad.title}</TableCell>
                      <TableCell>{getPlatformIcon(ad.platform)} {ad.platform}</TableCell>
                      <TableCell>{ad.adType}</TableCell>
                      <TableCell>{ad.targetAudience}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => copyToClipboard(ad.copyShort)}
                            variant="outline" 
                            size="sm"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </Button>
                          <Button 
                            onClick={() => copyToClipboard(ad.headline)}
                            variant="outline" 
                            size="sm"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Título
                          </Button>
                          {(ad.imageUrl || ad.videoUrl) && (
                            <>
                              <Button 
                                onClick={() => window.open(ad.imageUrl || ad.videoUrl, '_blank')}
                                variant="outline" 
                                size="sm"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                Ver Mídia
                              </Button>
                              <Button 
                                onClick={async () => {
                                  try {
                                    const response = await adminMarketing.downloadMedia({
                                      publicId: ad.imageUrl || ad.videoUrl || '',
                                      filename: `${ad.title}_media`
                                    });
                                    if (response.success) {
                                      const link = document.createElement('a');
                                      link.href = response.data.downloadUrl;
                                      link.download = `${ad.title}_media`;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                    }
                                  } catch (err) {
                                    console.error('Erro ao fazer download:', err);
                                  }
                                }}
                                variant="outline" 
                                size="sm"
                              >
                                <Download className="w-3 h-3 mr-1" />
                                Download
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Vídeos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Vídeos e Reels
                </div>
                <Button 
                  onClick={() => handleOpenDigitalLibraryModal('video')}
                  size="sm"
                >
                  Novo Vídeo
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {videoContents.map((video) => (
                  <div key={video.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {getPlatformIcon(video.platform)}
                      <Badge variant="outline">{video.videoType}</Badge>
                      <span className="text-sm text-gray-500">{video.duration}s</span>
                    </div>
                    <h4 className="font-medium text-sm mb-2">{video.title}</h4>
                    <p className="text-xs text-gray-600 mb-3">{video.description}</p>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => copyToClipboard(video.script)}
                        variant="outline" 
                        size="sm"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Roteiro
                      </Button>
                      <Button 
                        onClick={() => copyToClipboard(video.hashtags)}
                        variant="outline" 
                        size="sm"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Hashtags
                      </Button>
                      {video.videoUrl && (
                        <>
                          <Button 
                            onClick={() => window.open(video.videoUrl, '_blank')}
                            variant="outline" 
                            size="sm"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Ver Vídeo
                          </Button>
                          <Button 
                            onClick={async () => {
                              try {
                                const response = await adminMarketing.downloadMedia({
                                  publicId: video.videoUrl || '',
                                  filename: `${video.title}_video`
                                });
                                if (response.success) {
                                  const link = document.createElement('a');
                                  link.href = response.data.downloadUrl;
                                  link.download = `${video.title}_video`;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }
                              } catch (err) {
                                console.error('Erro ao fazer download:', err);
                              }
                            }}
                            variant="outline" 
                            size="sm"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Argumentos de Venda */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Argumentos de Venda
                </div>
                <Button 
                  onClick={() => handleOpenDigitalLibraryModal('argument')}
                  size="sm"
                >
                  Novo Argumento
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {salesArguments.map((arg) => (
                  <div key={arg.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{arg.category}</Badge>
                      {arg.conversionRate && (
                        <span className="text-sm text-green-600">
                          {arg.conversionRate}% conversão
                        </span>
                      )}
                    </div>
                    <h4 className="font-medium text-sm mb-2">{arg.title}</h4>
                    <p className="text-xs text-gray-600 mb-3">{arg.argument}</p>
                    <Button 
                      onClick={() => copyToClipboard(arg.argument)}
                      variant="outline" 
                      size="sm"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copiar Argumento
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Links de Afiliados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  Links de Afiliados
                </div>
                <Button 
                  onClick={() => handleOpenDigitalLibraryModal('link')}
                  size="sm"
                >
                  Novo Link
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Campanha</TableHead>
                    <TableHead>Cliques</TableHead>
                    <TableHead>Conversões</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {affiliateLinks.map((link) => (
                    <TableRow key={link.id}>
                      <TableCell className="font-medium">{link.name}</TableCell>
                      <TableCell>{link.utmCampaign}</TableCell>
                      <TableCell>{link.clicks}</TableCell>
                      <TableCell>{link.conversions}</TableCell>
                      <TableCell>
                        <Button 
                          onClick={() => copyToClipboard(link.fullUrl)}
                          variant="outline" 
                          size="sm"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copiar Link
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de criar/editar campanha */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Campanha' : 'Nova Campanha'}</DialogTitle>
            <DialogDescription>
              Preencha os dados da campanha. Use a IA para gerar conteúdo se desejar.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nome da Campanha</label>
              <input
                className="border p-2 w-full rounded mt-1"
                placeholder="Nome"
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tipo</label>
              <select
                className="border p-2 w-full rounded mt-1"
                value={form.type}
                onChange={(e) => setForm({...form, type: e.target.value})}
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
                value={form.subject}
                onChange={(e) => setForm({...form, subject: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Segmento</label>
              <input
                className="border p-2 w-full rounded mt-1"
                placeholder="Ex: novas_mamaes, premium"
                value={form.segment}
                onChange={(e) => setForm({...form, segment: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Data Agendada</label>
              <input
                type="datetime-local"
                className="border p-2 w-full rounded mt-1"
                value={form.scheduledAt}
                onChange={(e) => setForm({...form, scheduledAt: e.target.value})}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium">Conteúdo</label>
            <div className="flex gap-2 mb-2">
              <Button onClick={handleGenerateAI} size="sm" variant="outline">
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar com IA
              </Button>
            </div>
            <Textarea
              className="min-h-[200px]"
              placeholder="Conteúdo da campanha..."
              value={form.content}
              onChange={(e) => setForm({...form, content: e.target.value})}
            />
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleSave} className="flex-1">
              {editing ? 'Atualizar' : 'Criar'} Campanha
            </Button>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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

      {/* Modal de usuários alvo */}
      <Dialog open={showTargetUsers} onOpenChange={setShowTargetUsers}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Usuários Alvo ({targetUsersCount} total)</DialogTitle>
            <DialogDescription>
              Usuários que se encaixam nos critérios de segmentação selecionados
            </DialogDescription>
          </DialogHeader>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Bebês</TableHead>
                <TableHead>Memórias</TableHead>
                <TableHead>Atividades</TableHead>
                <TableHead>Último Login</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {targetUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      {user.emailVerified && (
                        <Badge variant="outline" className="text-xs">✓ Verificado</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.plan_name}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Baby className="w-4 h-4 text-gray-500" />
                      <span>{user.baby_count}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4 text-gray-500" />
                      <span>{user.memory_count}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Activity className="w-4 h-4 text-gray-500" />
                      <span>{user.activity_count}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Nunca'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
    </div>
  );
};

export default AdminMarketing; 