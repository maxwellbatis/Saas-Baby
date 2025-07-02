import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Separator } from '../../components/ui/separator';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { 
  Settings, 
  User, 
  Shield, 
  Database, 
  HardDrive, 
  Zap, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Save,
  RefreshCw,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Globe,
  Image,
  Video,
  Upload
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { adminAuth, adminSettings } from '../../lib/adminApi';
import { useAdminAuth } from '../../contexts/admin/AdminAuthContext';
import { getApiUrl } from '@/config/api';
import { apiFetch } from '@/config/api';

interface SystemSettings {
  maxFileSize: string;
  allowedFileTypes: string;
  maxBabiesPerUser: number;
  maxMemoriesPerMonth: number;
  enableAI: boolean;
  enablePushNotifications: boolean;
  enableEmailNotifications: boolean;
  maintenanceMode: boolean;
  version: string;
  lastBackup: string | null;
  cacheStatus: string;
}

interface LandingPageSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string | null;
  heroVideo: string | null;
  heroMediaType: string | null;
  heroMediaUrl: string | null;
  features: any[];
  testimonials: any[];
  faq: any[];
  stats: any[];
  ctaText: string | null;
  ctaButtonText: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
}

interface IntegrationTest {
  stripe: { status: string; message: string };
  cloudinary: { status: string; message: string };
  groq: { status: string; message: string };
  database: { status: string; message: string };
}

export const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [landingPageSettings, setLandingPageSettings] = useState<LandingPageSettings>({
    heroTitle: '',
    heroSubtitle: '',
    heroImage: null,
    heroVideo: null,
    heroMediaType: null,
    heroMediaUrl: null,
    features: [],
    testimonials: [],
    faq: [],
    stats: [],
    ctaText: null,
    ctaButtonText: null,
    seoTitle: null,
    seoDescription: null,
    seoKeywords: null,
  });
  const [businessPageSettings, setBusinessPageSettings] = useState<LandingPageSettings>({
    heroTitle: '',
    heroSubtitle: '',
    heroImage: null,
    heroVideo: null,
    heroMediaType: null,
    heroMediaUrl: null,
    features: [],
    testimonials: [],
    faq: [],
    stats: [],
    ctaText: null,
    ctaButtonText: null,
    seoTitle: null,
    seoDescription: null,
    seoKeywords: null,
  });
  const [integrationTests, setIntegrationTests] = useState<IntegrationTest | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [mediaUploadLoading, setMediaUploadLoading] = useState(false);
  const [selectedMediaType, setSelectedMediaType] = useState<'image' | 'video'>('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const { admin, getAdminProfile } = useAdminAuth();
  const { toast } = useToast();
  const [freepikKey, setFreepikKey] = useState('');
  const [freepikStatus, setFreepikStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [freepikMessage, setFreepikMessage] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [geminiStatus, setGeminiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [geminiMessage, setGeminiMessage] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [groqStatus, setGroqStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [groqMessage, setGroqMessage] = useState('');
  const [cloudinaryName, setCloudinaryName] = useState('');
  const [cloudinaryKey, setCloudinaryKey] = useState('');
  const [cloudinarySecret, setCloudinarySecret] = useState('');
  const [cloudinaryStatus, setCloudinaryStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [cloudinaryMessage, setCloudinaryMessage] = useState('');
  const [integrationTestResults, setIntegrationTestResults] = useState<any[]>([]);
  const [integrationTestLoading, setIntegrationTestLoading] = useState(false);
  const [integrationTestError, setIntegrationTestError] = useState('');

  useEffect(() => {
    loadSettings();
    loadProfile();
    fetchFreepikKey();
    fetchGeminiKey();
    fetchGroqKey();
    fetchCloudinary();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Usar o token de admin
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        toast({
          title: 'Erro',
          description: 'Token de admin não encontrado',
          variant: 'destructive',
        });
        return;
      }

      const [landingResponse, businessResponse] = await Promise.all([
        fetch(`${getApiUrl()}/admin/landing-page-content`, {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        }).then(res => res.json()),
        fetch(`${getApiUrl()}/admin/business-page-content`, {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        }).then(res => res.json())
      ]);

      if (landingResponse.success) {
        setLandingPageSettings(landingResponse.data);
      }

      if (businessResponse.success) {
        setBusinessPageSettings(businessResponse.data);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as configurações.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      await getAdminProfile();
      if (admin) {
        setProfileForm({
          name: admin.name || '',
          email: admin.email || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      
      // Validar senhas se estiver alterando
      if (profileForm.newPassword) {
        if (profileForm.newPassword !== profileForm.confirmPassword) {
          toast({
            title: 'Erro',
            description: 'As senhas não coincidem',
            variant: 'destructive'
          });
          return;
        }
        
        if (!profileForm.currentPassword) {
          toast({
            title: 'Erro',
            description: 'Senha atual é obrigatória para alterar a senha',
            variant: 'destructive'
          });
          return;
        }
      }

      const updateData: any = {
        name: profileForm.name,
        email: profileForm.email
      };

      if (profileForm.newPassword) {
        updateData.currentPassword = profileForm.currentPassword;
        updateData.newPassword = profileForm.newPassword;
      }

      const response = await adminAuth.updateProfile(updateData);
      
      if (response.success) {
        toast({
          title: 'Sucesso',
          description: 'Perfil atualizado com sucesso'
        });
        
        // Limpar campos de senha
        setProfileForm(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        
        // Recarregar perfil
        await getAdminProfile();
      } else {
        toast({
          title: 'Erro',
          description: response.error || 'Erro ao atualizar perfil',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: 'Erro',
        description: error.response?.data?.error || 'Erro de conexão',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    try {
      setLoading(true);
      const response = await adminSettings.backup();
      
      if (response.success) {
        toast({
          title: 'Sucesso',
          description: 'Backup realizado com sucesso'
        });
        await loadSettings(); // Recarregar para atualizar lastBackup
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao realizar backup',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Erro ao realizar backup:', error);
      toast({
        title: 'Erro',
        description: 'Erro de conexão',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    if (!confirm('Tem certeza que deseja limpar o cache? Isso pode afetar temporariamente o desempenho.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await adminSettings.clearCache();
      
      if (response.success) {
        toast({
          title: 'Sucesso',
          description: 'Cache limpo com sucesso'
        });
        await loadSettings();
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao limpar cache',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      toast({
        title: 'Erro',
        description: 'Erro de conexão',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestIntegrations = async () => {
    setIntegrationTestLoading(true);
    setIntegrationTestError('');
    setIntegrationTestResults([]);
    try {
      const adminToken = localStorage.getItem('adminToken');
      const res = await fetch(`${getApiUrl()}/admin/integrations/test`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (!res.ok) throw new Error('Erro ao testar integrações');
      const data = await res.json();
      setIntegrationTestResults(data);
    } catch (err: any) {
      setIntegrationTestError(err.message || 'Erro ao testar integrações');
    } finally {
      setIntegrationTestLoading(false);
    }
  };

  const handleMediaUpload = async (page: 'landing' | 'business' = 'landing') => {
    if (!mediaFile) {
      toast({
        title: 'Erro',
        description: 'Selecione um arquivo para enviar',
        variant: 'destructive'
      });
      return;
    }

    try {
      setMediaUploadLoading(true);
      
      const formData = new FormData();
      formData.append('mediaFile', mediaFile);
      formData.append('mediaType', selectedMediaType);

      // Usar o token de admin
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        toast({
          title: 'Erro',
          description: 'Token de admin não encontrado',
          variant: 'destructive'
        });
        return;
      }

      const response = await fetch(`${getApiUrl()}/admin/${page === 'business' ? 'business-page-media' : 'landing-page-media'}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Sucesso',
          description: 'Mídia enviada com sucesso!'
        });
        
        // Atualizar o estado correspondente
        if (page === 'business') {
          setBusinessPageSettings({
            ...businessPageSettings,
            heroMediaUrl: data.data.mediaUrl,
            heroMediaType: selectedMediaType,
            heroImage: selectedMediaType === 'image' ? data.data.mediaUrl : null,
            heroVideo: selectedMediaType === 'video' ? data.data.mediaUrl : null
          });
        } else {
          setLandingPageSettings({
            ...landingPageSettings,
            heroMediaUrl: data.data.mediaUrl,
            heroMediaType: selectedMediaType,
            heroImage: selectedMediaType === 'image' ? data.data.mediaUrl : null,
            heroVideo: selectedMediaType === 'video' ? data.data.mediaUrl : null
          });
        }
        
        setMediaFile(null);
        setMediaUrl('');
      } else {
        throw new Error(data.error || 'Erro ao enviar mídia');
      }
    } catch (error) {
      console.error('Erro ao enviar mídia:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a mídia',
        variant: 'destructive'
      });
    } finally {
      setMediaUploadLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setMediaUrl(''); // Limpar URL se arquivo foi selecionado
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const handleLandingPageUpdate = async () => {
    try {
      setLoading(true);
      
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        toast({
          title: 'Erro',
          description: 'Token de admin não encontrado',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch(`${getApiUrl()}/admin/landing-page-content`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(landingPageSettings),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Sucesso',
          description: 'Landing page atualizada com sucesso!',
        });
      } else {
        throw new Error(data.error || 'Erro ao atualizar landing page');
      }
    } catch (error) {
      console.error('Erro ao atualizar landing page:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a landing page.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessPageUpdate = async () => {
    try {
      setLoading(true);
      
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        toast({
          title: 'Erro',
          description: 'Token de admin não encontrado',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch(`${getApiUrl()}/admin/business-page-content`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(businessPageSettings),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Sucesso',
          description: 'Página Business atualizada com sucesso!',
        });
      } else {
        throw new Error(data.error || 'Erro ao atualizar página Business');
      }
    } catch (error) {
      console.error('Erro ao atualizar página Business:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a página Business.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFreepikKey = async () => {
    try {
      setFreepikStatus('loading');
      const adminToken = localStorage.getItem('adminToken');
      const res = await fetch(`${getApiUrl()}/admin/integrations/config?key=FREEPIK_API_KEY`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFreepikKey(data.value);
        setFreepikStatus('success');
      } else {
        setFreepikKey('');
        setFreepikStatus('idle');
      }
    } catch {
      setFreepikStatus('error');
    }
  };

  const handleSaveFreepikKey = async () => {
    try {
      setFreepikStatus('loading');
      setFreepikMessage('');
      const adminToken = localStorage.getItem('adminToken');
      const res = await fetch(`${getApiUrl()}/admin/integrations/config`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ key: 'FREEPIK_API_KEY', value: freepikKey })
      });
      if (res.ok) {
        setFreepikStatus('success');
        setFreepikMessage('Chave salva com sucesso!');
        toast({ title: 'Chave Freepik atualizada!', variant: 'default' });
      } else {
        setFreepikStatus('error');
        setFreepikMessage('Erro ao salvar chave.');
        toast({ title: 'Erro ao salvar chave Freepik', variant: 'destructive' });
      }
    } catch {
      setFreepikStatus('error');
      setFreepikMessage('Erro ao salvar chave.');
      toast({ title: 'Erro ao salvar chave Freepik', variant: 'destructive' });
    }
  };

  const fetchGeminiKey = async () => {
    try {
      setGeminiStatus('loading');
      const adminToken = localStorage.getItem('adminToken');
      const res = await fetch(`${getApiUrl()}/admin/integrations/config?key=GEMINI_API_KEY`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGeminiKey(data.value);
        setGeminiStatus('success');
      } else {
        setGeminiKey('');
        setGeminiStatus('idle');
      }
    } catch {
      setGeminiStatus('error');
    }
  };

  const handleSaveGeminiKey = async () => {
    try {
      setGeminiStatus('loading');
      setGeminiMessage('');
      const adminToken = localStorage.getItem('adminToken');
      const res = await fetch(`${getApiUrl()}/admin/integrations/config`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ key: 'GEMINI_API_KEY', value: geminiKey })
      });
      if (res.ok) {
        setGeminiStatus('success');
        setGeminiMessage('Chave salva com sucesso!');
        toast({ title: 'Chave Gemini atualizada!', variant: 'default' });
      } else {
        setGeminiStatus('error');
        setGeminiMessage('Erro ao salvar chave.');
        toast({ title: 'Erro ao salvar chave Gemini', variant: 'destructive' });
      }
    } catch {
      setGeminiStatus('error');
      setGeminiMessage('Erro ao salvar chave.');
      toast({ title: 'Erro ao salvar chave Gemini', variant: 'destructive' });
    }
  };

  const fetchGroqKey = async () => {
    try {
      setGroqStatus('loading');
      const adminToken = localStorage.getItem('adminToken');
      const res = await fetch(`${getApiUrl()}/admin/integrations/config?key=GROQ_API_KEY`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGroqKey(data.value);
        setGroqStatus('success');
      } else {
        setGroqKey('');
        setGroqStatus('idle');
      }
    } catch {
      setGroqStatus('error');
    }
  };

  const handleSaveGroqKey = async () => {
    try {
      setGroqStatus('loading');
      setGroqMessage('');
      const adminToken = localStorage.getItem('adminToken');
      const res = await fetch(`${getApiUrl()}/admin/integrations/config`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ key: 'GROQ_API_KEY', value: groqKey })
      });
      if (res.ok) {
        setGroqStatus('success');
        setGroqMessage('Chave salva com sucesso!');
        toast({ title: 'Chave Groq atualizada!', variant: 'default' });
      } else {
        setGroqStatus('error');
        setGroqMessage('Erro ao salvar chave.');
        toast({ title: 'Erro ao salvar chave Groq', variant: 'destructive' });
      }
    } catch {
      setGroqStatus('error');
      setGroqMessage('Erro ao salvar chave.');
      toast({ title: 'Erro ao salvar chave Groq', variant: 'destructive' });
    }
  };

  const fetchCloudinary = async () => {
    try {
      setCloudinaryStatus('loading');
      const adminToken = localStorage.getItem('adminToken');
      const [nameRes, keyRes, secretRes] = await Promise.all([
        fetch(`${getApiUrl()}/admin/integrations/config?key=CLOUDINARY_CLOUD_NAME`, { headers: { 'Authorization': `Bearer ${adminToken}` } }),
        fetch(`${getApiUrl()}/admin/integrations/config?key=CLOUDINARY_API_KEY`, { headers: { 'Authorization': `Bearer ${adminToken}` } }),
        fetch(`${getApiUrl()}/admin/integrations/config?key=CLOUDINARY_API_SECRET`, { headers: { 'Authorization': `Bearer ${adminToken}` } })
      ]);
      setCloudinaryName(nameRes.ok ? (await nameRes.json()).value : '');
      setCloudinaryKey(keyRes.ok ? (await keyRes.json()).value : '');
      setCloudinarySecret(secretRes.ok ? (await secretRes.json()).value : '');
      setCloudinaryStatus('success');
    } catch {
      setCloudinaryStatus('error');
    }
  };

  const handleSaveCloudinary = async () => {
    try {
      setCloudinaryStatus('loading');
      setCloudinaryMessage('');
      const adminToken = localStorage.getItem('adminToken');
      const results = await Promise.all([
        fetch(`${getApiUrl()}/admin/integrations/config`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'CLOUDINARY_CLOUD_NAME', value: cloudinaryName })
        }),
        fetch(`${getApiUrl()}/admin/integrations/config`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'CLOUDINARY_API_KEY', value: cloudinaryKey })
        }),
        fetch(`${getApiUrl()}/admin/integrations/config`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'CLOUDINARY_API_SECRET', value: cloudinarySecret })
        })
      ]);
      if (results.every(r => r.ok)) {
        setCloudinaryStatus('success');
        setCloudinaryMessage('Chaves salvas com sucesso!');
        toast({ title: 'Chaves Cloudinary atualizadas!', variant: 'default' });
      } else {
        setCloudinaryStatus('error');
        setCloudinaryMessage('Erro ao salvar chaves.');
        toast({ title: 'Erro ao salvar chaves Cloudinary', variant: 'destructive' });
      }
    } catch {
      setCloudinaryStatus('error');
      setCloudinaryMessage('Erro ao salvar chaves.');
      toast({ title: 'Erro ao salvar chaves Cloudinary', variant: 'destructive' });
    }
  };

  if (loading && !systemSettings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações do Sistema</h1>
        <p className="text-gray-600 mt-2">
          Gerencie configurações globais, perfil do administrador e manutenção do sistema
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Sistema
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Manutenção
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Integrações
          </TabsTrigger>
          <TabsTrigger value="landing-page" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Landing Page
          </TabsTrigger>
          <TabsTrigger value="business-page" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Página Business
          </TabsTrigger>
        </TabsList>

        {/* Perfil do Administrador */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Perfil do Administrador
              </CardTitle>
              <CardDescription>
                Atualize suas informações pessoais e credenciais de acesso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                    placeholder="Seu nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium">Alterar Senha</Label>
                <p className="text-sm text-gray-500 mb-4">
                  Deixe em branco se não quiser alterar a senha
                </p>
                
                <div className="space-y-4">
                  <div className="relative">
                    <Label htmlFor="currentPassword">Senha Atual</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={profileForm.currentPassword}
                        onChange={(e) => setProfileForm({...profileForm, currentPassword: e.target.value})}
                        placeholder="••••••••"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Label htmlFor="newPassword">Nova Senha</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          value={profileForm.newPassword}
                          onChange={(e) => setProfileForm({...profileForm, newPassword: e.target.value})}
                          placeholder="••••••••"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={profileForm.confirmPassword}
                        onChange={(e) => setProfileForm({...profileForm, confirmPassword: e.target.value})}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleProfileUpdate} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações do Sistema */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurações do Sistema
              </CardTitle>
              <CardDescription>
                Configurações globais da aplicação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {systemSettings && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="maxFileSize">Tamanho Máximo de Arquivo (bytes)</Label>
                      <Input
                        id="maxFileSize"
                        value={systemSettings.maxFileSize}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Configurado via variável de ambiente
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="allowedFileTypes">Tipos de Arquivo Permitidos</Label>
                      <Input
                        id="allowedFileTypes"
                        value={systemSettings.allowedFileTypes}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Configurado via variável de ambiente
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="maxBabiesPerUser">Máximo de Bebês por Usuário</Label>
                      <Input
                        id="maxBabiesPerUser"
                        type="number"
                        value={systemSettings.maxBabiesPerUser}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxMemoriesPerMonth">Máximo de Memórias por Mês</Label>
                      <Input
                        id="maxMemoriesPerMonth"
                        type="number"
                        value={systemSettings.maxMemoriesPerMonth}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Inteligência Artificial (Groq)</Label>
                        <p className="text-sm text-gray-500">Habilitar funcionalidades de IA</p>
                      </div>
                      <Switch checked={systemSettings.enableAI} disabled />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Notificações Push</Label>
                        <p className="text-sm text-gray-500">Enviar notificações push para usuários</p>
                      </div>
                      <Switch checked={systemSettings.enablePushNotifications} disabled />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Notificações por Email</Label>
                        <p className="text-sm text-gray-500">Enviar emails para usuários</p>
                      </div>
                      <Switch checked={systemSettings.enableEmailNotifications} disabled />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Modo de Manutenção</Label>
                        <p className="text-sm text-gray-500">Desabilitar acesso de usuários</p>
                      </div>
                      <Switch checked={systemSettings.maintenanceMode} disabled />
                    </div>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Estas configurações são definidas via variáveis de ambiente e não podem ser alteradas através da interface.
                      Para modificar, edite o arquivo .env e reinicie o servidor.
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manutenção */}
        <TabsContent value="maintenance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  Backup do Sistema
                </CardTitle>
                <CardDescription>
                  Crie um backup completo do banco de dados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {systemSettings?.lastBackup && (
                  <div className="text-sm">
                    <span className="font-medium">Último backup:</span>
                    <p className="text-gray-500">
                      {new Date(systemSettings.lastBackup).toLocaleString('pt-BR')}
                    </p>
                  </div>
                )}
                <Button onClick={handleBackup} disabled={loading} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  {loading ? 'Criando Backup...' : 'Criar Backup'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Limpeza de Cache
                </CardTitle>
                <CardDescription>
                  Limpe o cache do sistema para liberar memória
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm">
                  <span className="font-medium">Status do cache:</span>
                  <Badge variant="outline" className="ml-2">
                    {systemSettings?.cacheStatus || 'Desconhecido'}
                  </Badge>
                </div>
                <Button onClick={handleClearCache} disabled={loading} variant="outline" className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {loading ? 'Limpando...' : 'Limpar Cache'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Integrações */}
        <TabsContent value="integrations" className="space-y-6">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Integrações de API</CardTitle>
              <CardDescription>Configure as chaves de API das integrações externas.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label htmlFor="freepik-key">Chave da API Freepik
                  <a href="https://developers.freepik.com/" target="_blank" rel="noopener noreferrer" className="ml-2 text-xs text-blue-600 underline">Como obter?</a>
                </Label>
                <Input
                  id="freepik-key"
                  type="text"
                  value={freepikKey}
                  onChange={e => setFreepikKey(e.target.value)}
                  placeholder="Cole sua chave da Freepik aqui"
                  className="mt-1"
                />
                <Button onClick={handleSaveFreepikKey} className="mt-2">Salvar Chave</Button>
                {freepikStatus === 'loading' && <span className="ml-2 text-xs text-blue-600">Salvando...</span>}
                {freepikStatus === 'success' && <span className="ml-2 text-xs text-green-600">Chave salva!</span>}
                {freepikStatus === 'error' && <span className="ml-2 text-xs text-red-600">{freepikMessage || 'Erro ao salvar.'}</span>}
              </div>
              <div className="mb-4">
                <Label htmlFor="gemini-key">Chave da API Gemini
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="ml-2 text-xs text-blue-600 underline">Como obter?</a>
                </Label>
                <Input
                  id="gemini-key"
                  type="text"
                  value={geminiKey}
                  onChange={e => setGeminiKey(e.target.value)}
                  placeholder="Cole sua chave da Gemini aqui"
                  className="mt-1"
                />
                <Button onClick={handleSaveGeminiKey} className="mt-2">Salvar Chave</Button>
                {geminiStatus === 'loading' && <span className="ml-2 text-xs text-blue-600">Salvando...</span>}
                {geminiStatus === 'success' && <span className="ml-2 text-xs text-green-600">Chave salva!</span>}
                {geminiStatus === 'error' && <span className="ml-2 text-xs text-red-600">{geminiMessage || 'Erro ao salvar.'}</span>}
              </div>
              <div className="mb-4">
                <Label htmlFor="groq-key">Chave da API Groq
                  <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="ml-2 text-xs text-blue-600 underline">Como obter?</a>
                </Label>
                <Input
                  id="groq-key"
                  type="text"
                  value={groqKey}
                  onChange={e => setGroqKey(e.target.value)}
                  placeholder="Cole sua chave da Groq aqui"
                  className="mt-1"
                />
                <Button onClick={handleSaveGroqKey} className="mt-2">Salvar Chave</Button>
                {groqStatus === 'loading' && <span className="ml-2 text-xs text-blue-600">Salvando...</span>}
                {groqStatus === 'success' && <span className="ml-2 text-xs text-green-600">Chave salva!</span>}
                {groqStatus === 'error' && <span className="ml-2 text-xs text-red-600">{groqMessage || 'Erro ao salvar.'}</span>}
              </div>
              <div className="mb-4">
                <Label htmlFor="cloudinary-name">Cloudinary Cloud Name
                  <a href="https://cloudinary.com/console" target="_blank" rel="noopener noreferrer" className="ml-2 text-xs text-blue-600 underline">Como obter?</a>
                </Label>
                <Input
                  id="cloudinary-name"
                  type="text"
                  value={cloudinaryName}
                  onChange={e => setCloudinaryName(e.target.value)}
                  placeholder="Seu cloud name do Cloudinary"
                  className="mt-1"
                />
                <Label htmlFor="cloudinary-key" className="mt-2">Cloudinary API Key
                  <a href="https://cloudinary.com/console" target="_blank" rel="noopener noreferrer" className="ml-2 text-xs text-blue-600 underline">Como obter?</a>
                </Label>
                <Input
                  id="cloudinary-key"
                  type="text"
                  value={cloudinaryKey}
                  onChange={e => setCloudinaryKey(e.target.value)}
                  placeholder="Sua API Key do Cloudinary"
                  className="mt-1"
                />
                <Label htmlFor="cloudinary-secret" className="mt-2">Cloudinary API Secret
                  <a href="https://cloudinary.com/console" target="_blank" rel="noopener noreferrer" className="ml-2 text-xs text-blue-600 underline">Como obter?</a>
                </Label>
                <Input
                  id="cloudinary-secret"
                  type="text"
                  value={cloudinarySecret}
                  onChange={e => setCloudinarySecret(e.target.value)}
                  placeholder="Sua API Secret do Cloudinary"
                  className="mt-1"
                />
                <Button onClick={handleSaveCloudinary} className="mt-2">Salvar Chaves</Button>
                {cloudinaryStatus === 'loading' && <span className="ml-2 text-xs text-blue-600">Salvando...</span>}
                {cloudinaryStatus === 'success' && <span className="ml-2 text-xs text-green-600">Chaves salvas!</span>}
                {cloudinaryStatus === 'error' && <span className="ml-2 text-xs text-red-600">{cloudinaryMessage || 'Erro ao salvar.'}</span>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Landing Page */}
        <TabsContent value="landing-page" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Landing Page
              </CardTitle>
              <CardDescription>
                Configure as configurações da página de destino
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {landingPageSettings && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="heroTitle">Título do Herói</Label>
                      <Input
                        id="heroTitle"
                        value={landingPageSettings.heroTitle}
                        onChange={(e) => setLandingPageSettings({...landingPageSettings, heroTitle: e.target.value})}
                        placeholder="Título do Herói"
                      />
                    </div>
                    <div>
                      <Label htmlFor="heroSubtitle">Subtítulo do Herói</Label>
                      <Input
                        id="heroSubtitle"
                        value={landingPageSettings.heroSubtitle}
                        onChange={(e) => setLandingPageSettings({...landingPageSettings, heroSubtitle: e.target.value})}
                        placeholder="Subtítulo do Herói"
                      />
                    </div>
                  </div>

                  <Separator />
                  
                  {/* Upload de Mídia */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-lg font-semibold">Mídia do Herói</Label>
                      <p className="text-sm text-gray-500 mb-4">
                        Escolha entre imagem ou vídeo para a seção hero da landing page
                      </p>
                    </div>

                    {/* Seleção do tipo de mídia */}
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant={selectedMediaType === 'image' ? 'default' : 'outline'}
                        onClick={() => setSelectedMediaType('image')}
                        className="flex items-center gap-2"
                      >
                        <Image className="w-4 h-4" />
                        Imagem
                      </Button>
                      <Button
                        type="button"
                        variant={selectedMediaType === 'video' ? 'default' : 'outline'}
                        onClick={() => setSelectedMediaType('video')}
                        className="flex items-center gap-2"
                      >
                        <Video className="w-4 h-4" />
                        Vídeo
                      </Button>
                    </div>

                    {/* Upload por URL */}
                    <div>
                      <Label htmlFor="mediaUrl">URL da {selectedMediaType === 'image' ? 'Imagem' : 'Vídeo'}</Label>
                      <Input
                        id="mediaUrl"
                        type="url"
                        value={mediaUrl}
                        onChange={(e) => setMediaUrl(e.target.value)}
                        placeholder={`URL da ${selectedMediaType === 'image' ? 'imagem' : 'vídeo'} (opcional)`}
                        className="mb-2"
                      />
                      <p className="text-sm text-gray-500">
                        Cole aqui a URL da {selectedMediaType === 'image' ? 'imagem' : 'vídeo'} (YouTube, Vimeo, etc.)
                      </p>
                    </div>

                    {/* Upload por arquivo */}
                    <div>
                      <Label htmlFor="mediaFile">Ou faça upload de um arquivo</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="mediaFile"
                          type="file"
                          accept={selectedMediaType === 'image' ? 'image/*' : 'video/*'}
                          onChange={handleFileChange}
                          className="flex-1"
                        />
                        {mediaFile && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setMediaFile(null)}
                          >
                            Limpar
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Formatos aceitos: {selectedMediaType === 'image' ? 'JPG, PNG, GIF, WebP' : 'MP4, WebM, MOV'}
                      </p>
                    </div>

                    {/* Botão de upload */}
                    <Button
                      onClick={() => handleMediaUpload()}
                      disabled={mediaUploadLoading || (!mediaUrl && !mediaFile)}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {mediaUploadLoading ? 'Fazendo Upload...' : `Atualizar ${selectedMediaType === 'image' ? 'Imagem' : 'Vídeo'}`}
                    </Button>

                    {/* Preview da mídia atual */}
                    {landingPageSettings?.heroMediaUrl && (
                      <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                        <Label className="text-sm font-medium mb-2">Mídia Atual:</Label>
                        <div className="flex items-center gap-2">
                          {landingPageSettings.heroMediaType === 'image' ? (
                            <Image className="w-4 h-4" />
                          ) : (
                            <Video className="w-4 h-4" />
                          )}
                          <span className="text-sm text-gray-600">
                            {landingPageSettings.heroMediaType === 'image' ? 'Imagem' : 'Vídeo'} ativa
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {landingPageSettings.heroMediaUrl}
                        </p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Features</Label>
                        <p className="text-sm text-gray-500">Adicione funcionalidades da página</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Image className="w-4 h-4 mr-2" />
                        Adicionar Feature
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Testimonials</Label>
                        <p className="text-sm text-gray-500">Adicione depoimentos da página</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Image className="w-4 h-4 mr-2" />
                        Adicionar Testimonial
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>FAQ</Label>
                        <p className="text-sm text-gray-500">Adicione perguntas frequentes</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Image className="w-4 h-4 mr-2" />
                        Adicionar Pergunta
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Stats</Label>
                        <p className="text-sm text-gray-500">Adicione estatísticas da página</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Image className="w-4 h-4 mr-2" />
                        Adicionar Estatística
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>CTA Text</Label>
                        <p className="text-sm text-gray-500">Texto do CTA da página</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Image className="w-4 h-4 mr-2" />
                        Editar Texto do CTA
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>CTA Button Text</Label>
                        <p className="text-sm text-gray-500">Texto do Botão CTA da página</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Image className="w-4 h-4 mr-2" />
                        Editar Texto do Botão CTA
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>SEO Title</Label>
                        <p className="text-sm text-gray-500">Título para o SEO da página</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Image className="w-4 h-4 mr-2" />
                        Editar Título SEO
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>SEO Description</Label>
                        <p className="text-sm text-gray-500">Descrição para o SEO da página</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Image className="w-4 h-4 mr-2" />
                        Editar Descrição SEO
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>SEO Keywords</Label>
                        <p className="text-sm text-gray-500">Palavras-chave para o SEO da página</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Image className="w-4 h-4 mr-2" />
                        Editar Palavras-chave SEO
                      </Button>
                    </div>
                  </div>

                  {/* Botão para salvar configurações */}
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleLandingPageUpdate} disabled={loading}>
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? 'Salvando...' : 'Salvar Configurações'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Página Business */}
        <TabsContent value="business-page" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Página Business
              </CardTitle>
              <CardDescription>
                Configure o conteúdo da página Business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {businessPageSettings && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="businessHeroTitle">Título do Herói</Label>
                      <Input
                        id="businessHeroTitle"
                        value={businessPageSettings.heroTitle}
                        onChange={(e) => setBusinessPageSettings({...businessPageSettings, heroTitle: e.target.value})}
                        placeholder="Título do Herói"
                      />
                    </div>
                    <div>
                      <Label htmlFor="businessHeroSubtitle">Subtítulo do Herói</Label>
                      <Input
                        id="businessHeroSubtitle"
                        value={businessPageSettings.heroSubtitle}
                        onChange={(e) => setBusinessPageSettings({...businessPageSettings, heroSubtitle: e.target.value})}
                        placeholder="Subtítulo do Herói"
                      />
                    </div>
                  </div>

                  <Separator />
                  
                  {/* Upload de Mídia para Business */}
                  <div className="space-y-4">
                    <div>
                      <Label>Mídia do Herói (Business)</Label>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id="businessImage"
                            name="businessMediaType"
                            value="image"
                            checked={selectedMediaType === 'image'}
                            onChange={(e) => setSelectedMediaType(e.target.value as 'image' | 'video')}
                          />
                          <Label htmlFor="businessImage" className="flex items-center gap-2">
                            <Image className="w-4 h-4" />
                            Imagem
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id="businessVideo"
                            name="businessMediaType"
                            value="video"
                            checked={selectedMediaType === 'video'}
                            onChange={(e) => setSelectedMediaType(e.target.value as 'image' | 'video')}
                          />
                          <Label htmlFor="businessVideo" className="flex items-center gap-2">
                            <Video className="w-4 h-4" />
                            Vídeo
                          </Label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="businessMediaFile">Arquivo de Mídia</Label>
                      <Input
                        id="businessMediaFile"
                        type="file"
                        accept={selectedMediaType === 'video' ? 'video/*' : 'image/*'}
                        onChange={handleFileChange}
                        className="mt-2"
                      />
                    </div>

                    {mediaFile && (
                      <div className="flex items-center gap-4">
                        <Button
                          onClick={() => handleMediaUpload('business')}
                          disabled={mediaUploadLoading}
                          className="flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          {mediaUploadLoading ? 'Enviando...' : 'Enviar Mídia'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setMediaFile(null)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Cancelar
                        </Button>
                      </div>
                    )}

                    {businessPageSettings.heroMediaUrl && (
                      <div className="mt-4">
                        <Label>Mídia Atual</Label>
                        <div className="mt-2 p-4 border rounded-lg">
                          {businessPageSettings.heroMediaType === 'video' ? (
                            <video
                              src={businessPageSettings.heroMediaUrl}
                              controls
                              className="w-full max-w-md rounded"
                            />
                          ) : (
                            <img
                              src={businessPageSettings.heroMediaUrl}
                              alt="Mídia atual"
                              className="w-full max-w-md rounded"
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="businessCtaText">Texto do CTA</Label>
                      <Input
                        id="businessCtaText"
                        value={businessPageSettings.ctaText || ''}
                        onChange={(e) => setBusinessPageSettings({...businessPageSettings, ctaText: e.target.value})}
                        placeholder="Texto do botão principal"
                      />
                    </div>
                    <div>
                      <Label htmlFor="businessCtaButtonText">Texto do Botão CTA</Label>
                      <Input
                        id="businessCtaButtonText"
                        value={businessPageSettings.ctaButtonText || ''}
                        onChange={(e) => setBusinessPageSettings({...businessPageSettings, ctaButtonText: e.target.value})}
                        placeholder="Texto do botão secundário"
                      />
                    </div>
                  </div>

                  {/* Botão para salvar configurações */}
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleBusinessPageUpdate} disabled={loading}>
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? 'Salvando...' : 'Salvar Configurações'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 