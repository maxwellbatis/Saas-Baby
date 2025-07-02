import React, { useState } from 'react';
import { Sparkles, MessageSquare, Send, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '../../../hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import { Button } from '../../../components/ui/button';
import { apiFetch } from '../../../config/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';

interface DigitalLibraryTabProps {
  posts: any[];
  ads: any[];
  videos: any[];
  arguments: any[];
  links: any[];
  onCreate: (type: string) => void;
  onEdit: (type: string, item: any) => void;
  onDelete?: (type: string, id: string) => void;
  onSave: (type: string, item: any) => void;
  form: any;
  setForm: (form: any) => void;
  showModal: boolean;
  setShowModal: (open: boolean) => void;
  onGenerateAIPost: () => void;
  onGenerateAIAd: () => void;
  onChatMessage: (type: string, message: string) => Promise<{ success: boolean; content: string }>;
  setDigitalLibraryType: (type: string) => void;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  actions?: Array<{
    label: string;
    action: string;
    data: string;
  }>;
}

export const DigitalLibraryTab: React.FC<DigitalLibraryTabProps> = ({
  posts,
  ads,
  videos,
  arguments: salesArguments,
  links,
  onCreate,
  onEdit,
  onDelete,
  onSave,
  form,
  setForm,
  showModal,
  setShowModal,
  onGenerateAIPost,
  onGenerateAIAd,
  onChatMessage,
  setDigitalLibraryType
}) => {
  const { toast } = useToast();
  const [expandedChat, setExpandedChat] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({
    posts: [],
    ads: [],
    videos: [],
    arguments: [],
    links: []
  });
  const [chatInput, setChatInput] = useState<Record<string, string>>({
    posts: '',
    ads: '',
    videos: '',
    arguments: '',
    links: ''
  });
  const [iaModalOpen, setIaModalOpen] = useState(false);
  const [iaType, setIaType] = useState<'image' | 'video' | 'text'>('image');
  const [iaPrompt, setIaPrompt] = useState('');
  const [iaResult, setIaResult] = useState<any>(null);
  const [iaLoading, setIaLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [iaPromptMode, setIaPromptMode] = useState<'text' | 'prompt-image' | 'prompt-video'>('text');
  const [suggestedPrompt, setSuggestedPrompt] = useState<string | null>(null);
  const [targetAudience, setTargetAudience] = useState('gestante');
  const [feature, setFeature] = useState('memorias');
  const [visualStyle, setVisualStyle] = useState('realista');
  const [videoFormat, setVideoFormat] = useState('quadrado');
  const [videoDuration, setVideoDuration] = useState('10');
  const [mainColor, setMainColor] = useState('tons pastéis');
  const [scene, setScene] = useState('casa');
  const quickThemes = [
    { label: 'Dica de amamentação', value: 'dica_amamentacao' },
    { label: 'Rotina do sono', value: 'rotina_sono' },
    { label: 'Registrar consultas', value: 'consultas' },
    { label: 'Promoção na loja', value: 'promocao_loja' },
    { label: 'Registrar vacinas', value: 'vacinas' },
    { label: 'Acompanhamento de marcos', value: 'marcos' },
    { label: 'Registrar memórias', value: 'memorias' },
    { label: 'Dica de saúde', value: 'dica_saude' },
  ];
  const featuresList = [
    { label: 'Memórias', value: 'memorias' },
    { label: 'Marcos', value: 'marcos' },
    { label: 'Consultas', value: 'consultas' },
    { label: 'Loja', value: 'loja' },
    { label: 'Vacinas', value: 'vacinas' },
    { label: 'Dicas de saúde', value: 'dica_saude' },
  ];
  const audienceList = [
    { label: 'Gestante', value: 'gestante' },
    { label: 'Mãe de bebê', value: 'mae_bebe' },
    { label: 'Mãe de criança', value: 'mae_crianca' },
  ];
  const visualStyles = [
    'realista', 'cartoon', 'flat', 'aquarela', 'minimalista', '3D', 'colagem', 'infográfico'
  ];
  const videoFormats = [
    { label: 'Quadrado (1:1)', value: 'quadrado' },
    { label: 'Vertical (9:16)', value: 'vertical' },
    { label: 'Horizontal (16:9)', value: 'horizontal' },
    { label: 'Stories', value: 'stories' },
    { label: 'Reels', value: 'reels' },
  ];
  const durations = ['5', '10', '15', '30', '60'];
  const mainColors = [
    'tons pastéis', 'vibrantes', 'azul', 'rosa', 'verde', 'amarelo', 'colorido', 'neutro'
  ];
  const scenes = [
    'casa', 'parque', 'consultório', 'quarto do bebê', 'cozinha', 'ar livre', 'sala de estar', 'escola'
  ];

  const handleSendMessage = async (type: string) => {
    const message = chatInput[type];
    if (!message.trim()) return;

    // Adicionar mensagem do usuário
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setChatMessages(prev => ({
      ...prev,
      [type]: [...(prev[type] || []), userMessage]
    }));

    // Limpar input
    setChatInput(prev => ({ ...prev, [type]: '' }));

    // Adicionar mensagem de carregamento
    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: '🤖 Processando...',
      timestamp: new Date()
    };

    setChatMessages(prev => ({
      ...prev,
      [type]: [...(prev[type] || []), loadingMessage]
    }));

    try {
      // Enviar para IA
      const response = await onChatMessage(type, message);
      
      // Remover mensagem de carregamento e adicionar resposta
      setChatMessages(prev => {
        const currentMessages = prev[type] || [];
        const filteredMessages = currentMessages.filter(msg => msg.id !== loadingMessage.id);
        
        const aiMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'ai',
          content: response.success ? response.content : '❌ Erro: ' + response.content,
          timestamp: new Date(),
          // Adicionar opções de ação se a resposta for bem-sucedida
          actions: response.success ? [
            { label: '💾 Salvar como Post', action: 'save_post', data: response.content },
            { label: '📢 Salvar como Anúncio', action: 'save_ad', data: response.content },
            { label: '📝 Salvar como Argumento', action: 'save_argument', data: response.content },
            { label: '📋 Copiar Texto', action: 'copy', data: response.content }
          ] : undefined
        };

        return {
          ...prev,
          [type]: [...filteredMessages, aiMessage]
        };
      });
    } catch (error) {
      // Remover mensagem de carregamento e adicionar erro
      setChatMessages(prev => {
        const currentMessages = prev[type] || [];
        const filteredMessages = currentMessages.filter(msg => msg.id !== loadingMessage.id);
        
        const errorMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'ai',
          content: '❌ Erro ao processar mensagem. Tente novamente.',
          timestamp: new Date()
        };

        return {
          ...prev,
          [type]: [...filteredMessages, errorMessage]
        };
      });
    }
  };

  const handleAction = async (action: string, data: string, type: string) => {
    switch (action) {
      case 'save_post':
        setDigitalLibraryType('post');
        setForm({
          title: `Post gerado por IA - ${new Date().toLocaleDateString()}`,
          description: data,
          category: type === 'posts' ? 'funcionalidade' : 'beneficio',
          platform: 'instagram',
          targetAudience: 'maes_bebes',
          contentType: 'post',
          caption: data.substring(0, 200) + '...',
          hashtags: '#babydiary #maternidade #desenvolvimento #bebe'
        });
        setShowModal(true);
        break;
      case 'save_ad':
        setDigitalLibraryType('ad');
        setForm({
          title: `Anúncio gerado por IA - ${new Date().toLocaleDateString()}`,
          description: data,
          platform: 'facebook',
          adType: 'image',
          copyShort: data.substring(0, 125),
          copyLong: data.substring(0, 500),
          headline: 'Baby Diary - Organize a vida do seu bebê',
          cta: 'Baixar Agora',
          targetAudience: 'maes_bebes',
          interests: ['maternidade', 'desenvolvimento infantil', 'bebês']
        });
        setShowModal(true);
        break;
      case 'save_argument':
        setDigitalLibraryType('argument');
        setForm({
          title: `Argumento gerado por IA - ${new Date().toLocaleDateString()}`,
          description: data,
          category: 'emocional',
          argument: data,
          examples: [data.substring(0, 100), data.substring(100, 200), data.substring(200, 300)],
          targetAudience: 'maes_bebes'
        });
        setShowModal(true);
        break;
      case 'copy':
        navigator.clipboard.writeText(data);
        toast({ title: 'Copiado!', description: 'Texto copiado para a área de transferência.' });
        break;
      default:
        break;
    }
  };

  const handleQuickSuggestion = (type: string, suggestion: string) => {
    setChatInput(prev => ({ ...prev, [type]: suggestion }));
  };

  const toggleChat = (type: string) => {
    setExpandedChat(expandedChat === type ? null : type);
  };

  // Gerar imagem com IA (Freepik)
  const handleGenerateImage = async () => {
    setIaType('image');
    setIaPrompt('');
    setIaResult(null);
    setIaModalOpen(true);
  };
  const handleConfirmGenerateImage = async () => {
    setIaLoading(true);
    try {
      const res = await apiFetch('admin/marketing/generate-image', {
        method: 'POST',
        body: JSON.stringify({ prompt: iaPrompt }),
      });
      setIaResult({ type: 'image', url: res.imageUrl });
    } catch (err) {
      toast({ title: 'Erro ao gerar imagem', variant: 'destructive' });
    } finally {
      setIaLoading(false);
    }
  };

  // Upload de imagem para animar
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Aqui você pode integrar com Cloudinary ou backend, por enquanto só preview local
    const url = URL.createObjectURL(file);
    setUploadedImage(url);
    setIaResult({ type: 'image', url });
  };

  // Gerar vídeo com IA (Freepik)
  const handleGenerateVideo = async () => {
    setIaType('video');
    setIaPrompt('');
    setIaResult(null);
    setIaModalOpen(true);
  };
  const handleConfirmGenerateVideo = async () => {
    setIaLoading(true);
    try {
      const res = await apiFetch('admin/marketing/generate-video', {
        method: 'POST',
        body: JSON.stringify({ prompt: iaPrompt, duration: '5' }),
      });
      setIaResult({ type: 'video', url: res.videoUrl });
    } catch (err) {
      toast({ title: 'Erro ao gerar vídeo', variant: 'destructive' });
    } finally {
      setIaLoading(false);
    }
  };

  // Animar imagem (gerar vídeo a partir de imagem)
  const handleAnimateImage = async () => {
    if (!iaResult?.url && !uploadedImage) return;
    setIaLoading(true);
    try {
      const res = await apiFetch('admin/marketing/generate-video', {
        method: 'POST',
        body: JSON.stringify({ image: iaResult?.url || uploadedImage, duration: '5' }),
      });
      setIaResult({ type: 'video', url: res.videoUrl });
    } catch (err) {
      toast({ title: 'Erro ao animar imagem', variant: 'destructive' });
    } finally {
      setIaLoading(false);
    }
  };

  // Gerar texto/copy com IA (Gemini)
  const handleGenerateText = async () => {
    setIaType('text');
    setIaPrompt('');
    setIaResult(null);
    setIaModalOpen(true);
  };
  const handleConfirmGenerateText = async () => {
    setIaLoading(true);
    try {
      const res = await apiFetch('admin/marketing/generate-gemini', {
        method: 'POST',
        body: JSON.stringify({ prompt: iaPrompt }),
      });
      setIaResult({ type: 'text', text: res.content });
    } catch (err) {
      toast({ title: 'Erro ao gerar texto', variant: 'destructive' });
    } finally {
      setIaLoading(false);
    }
  };

  // Gerar prompt para imagem com Gemini
  const handleGeneratePromptImage = async () => {
    setIaPromptMode('prompt-image');
    setIaPrompt('');
    setSuggestedPrompt(null);
    setIaModalOpen(true);
  };
  const handleConfirmGeneratePromptImage = async () => {
    setIaLoading(true);
    try {
      const res = await apiFetch('admin/marketing/generate-gemini', {
        method: 'POST',
        body: JSON.stringify({ prompt: iaPrompt, mode: 'prompt-image' }),
      });
      setSuggestedPrompt(res.prompt);
    } catch (err) {
      toast({ title: 'Erro ao gerar prompt para imagem', variant: 'destructive' });
    } finally {
      setIaLoading(false);
    }
  };

  // Gerar prompt para vídeo com Gemini
  const handleGeneratePromptVideo = async () => {
    setIaPromptMode('prompt-video');
    setIaPrompt('');
    setSuggestedPrompt(null);
    setIaModalOpen(true);
  };
  const handleConfirmGeneratePromptVideo = async () => {
    setIaLoading(true);
    try {
      const res = await apiFetch('admin/marketing/generate-gemini', {
        method: 'POST',
        body: JSON.stringify({ prompt: iaPrompt, mode: 'prompt-video' }),
      });
      setSuggestedPrompt(res.prompt);
    } catch (err) {
      toast({ title: 'Erro ao gerar prompt para vídeo', variant: 'destructive' });
    } finally {
      setIaLoading(false);
    }
  };

  // Usar prompt sugerido para gerar imagem/vídeo
  const handleUseSuggestedPrompt = async () => {
    if (iaPromptMode === 'prompt-image' && suggestedPrompt) {
      setIaType('image');
      setIaPrompt(suggestedPrompt);
      setIaResult(null);
      setIaModalOpen(false);
      // Gera imagem automaticamente
      setIaLoading(true);
      try {
        const res = await apiFetch('admin/marketing/generate-image', {
          method: 'POST',
          body: JSON.stringify({ prompt: suggestedPrompt }),
        });
        setIaResult({ type: 'image', url: res.imageUrl });
      } catch (err) {
        toast({ title: 'Erro ao gerar imagem', variant: 'destructive' });
      } finally {
        setIaLoading(false);
      }
    } else if (iaPromptMode === 'prompt-video' && suggestedPrompt) {
      setIaType('video');
      setIaPrompt(suggestedPrompt);
      setIaResult(null);
      setIaModalOpen(false);
      // Gera vídeo automaticamente
      setIaLoading(true);
      try {
        const res = await apiFetch('admin/marketing/generate-video', {
          method: 'POST',
          body: JSON.stringify({ prompt: suggestedPrompt, duration: '5' }),
        });
        setIaResult({ type: 'video', url: res.videoUrl });
      } catch (err) {
        toast({ title: 'Erro ao gerar vídeo', variant: 'destructive' });
      } finally {
        setIaLoading(false);
      }
    }
  };

  // Salvar na biblioteca (exemplo para post)
  const handleSaveToLibrary = (type: string) => {
    if (iaResult?.type === 'image') {
      setForm({ ...form, imageUrl: iaResult.url });
      setDigitalLibraryType(type);
      setShowModal(true);
    } else if (iaResult?.type === 'video') {
      setForm({ ...form, videoUrl: iaResult.url });
      setDigitalLibraryType(type);
      setShowModal(true);
    } else if (iaResult?.type === 'text') {
      setForm({ ...form, description: iaResult.text });
      setDigitalLibraryType(type);
      setShowModal(true);
    }
    setIaModalOpen(false);
  };

  // Função para montar prompt personalizado com automações
  const buildPrompt = (base: string) => {
    let audienceText = '';
    if (targetAudience === 'gestante') audienceText = 'para gestantes';
    else if (targetAudience === 'mae_bebe') audienceText = 'para mães de bebês';
    else if (targetAudience === 'mae_crianca') audienceText = 'para mães de crianças pequenas';
    let featureText = '';
    const featureObj = featuresList.find(f => f.value === feature);
    if (featureObj) featureText = `, destacando a funcionalidade de ${featureObj.label.toLowerCase()} do aplicativo Baby Diary`;
    let styleText = visualStyle ? `, estilo ${visualStyle}` : '';
    let colorText = mainColor ? `, cores predominantes: ${mainColor}` : '';
    let sceneText = scene ? `, cenário: ${scene}` : '';
    let formatText = '';
    let durationText = '';
    if (base.toLowerCase().includes('vídeo')) {
      formatText = videoFormat ? `, formato ${videoFormat}` : '';
      durationText = videoDuration ? `, duração de ${videoDuration} segundos` : '';
    } else if (base.toLowerCase().includes('imagem')) {
      formatText = videoFormat ? `, formato ${videoFormat}` : '';
    }
    return `${base} ${audienceText}${featureText}${styleText}${colorText}${sceneText}${formatText}${durationText}`;
  };

  // Sugestão rápida preenche prompt e IA
  const handleQuickTheme = (themeValue: string) => {
    let themeText = '';
    switch (themeValue) {
      case 'dica_amamentacao': themeText = 'Dica de amamentação'; break;
      case 'rotina_sono': themeText = 'Rotina do sono do bebê'; break;
      case 'consultas': themeText = 'Como registrar consultas médicas no app'; break;
      case 'promocao_loja': themeText = 'Promoção especial na loja do app'; break;
      case 'vacinas': themeText = 'Como registrar vacinas no app'; break;
      case 'marcos': themeText = 'Acompanhamento de marcos do desenvolvimento'; break;
      case 'memorias': themeText = 'Como registrar memórias no app'; break;
      case 'dica_saude': themeText = 'Dica de saúde para mamães'; break;
      default: themeText = '';
    }
    setIaPrompt(buildPrompt(`Crie um post para Instagram sobre: ${themeText}`));
    setIaType('text');
    setIaPromptMode('text');
    setIaModalOpen(true);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Biblioteca Digital</h2>
      
      {/* Bloco Criação de Conteúdo com IA */}
      <div className="mb-8 p-4 border rounded-lg bg-blue-50">
        <h3 className="font-bold text-lg mb-2 text-blue-700">Criação de Conteúdo com IA</h3>
        {/* Novo fluxo: seleção de público-alvo e funcionalidade */}
        <div className="flex flex-wrap gap-4 mb-2 items-center">
          <div>
            <span className="text-sm font-medium mr-2">Público-alvo:</span>
            {audienceList.map(aud => (
              <button
                key={aud.value}
                className={`px-2 py-1 rounded text-xs mr-1 ${targetAudience === aud.value ? 'bg-blue-600 text-white' : 'bg-white border'}`}
                onClick={() => setTargetAudience(aud.value)}
              >
                {aud.label}
              </button>
            ))}
          </div>
          <div>
            <span className="text-sm font-medium mr-2">Funcionalidade:</span>
            <select
              className="border rounded px-2 py-1 text-xs"
              value={feature}
              onChange={e => setFeature(e.target.value)}
            >
              {featuresList.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
          {/* Estilo visual */}
          <div>
            <span className="text-sm font-medium mr-2">Estilo visual:</span>
            <select
              className="border rounded px-2 py-1 text-xs"
              value={visualStyle}
              onChange={e => setVisualStyle(e.target.value)}
            >
              {visualStyles.map(style => (
                <option key={style} value={style}>{style.charAt(0).toUpperCase() + style.slice(1)}</option>
              ))}
            </select>
          </div>
          {/* Formato de vídeo/imagem */}
          <div>
            <span className="text-sm font-medium mr-2">Formato:</span>
            <select
              className="border rounded px-2 py-1 text-xs"
              value={videoFormat}
              onChange={e => setVideoFormat(e.target.value)}
            >
              {videoFormats.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
          {/* Duração (só para vídeo) */}
          <div>
            <span className="text-sm font-medium mr-2">Duração (s):</span>
            <select
              className="border rounded px-2 py-1 text-xs"
              value={videoDuration}
              onChange={e => setVideoDuration(e.target.value)}
            >
              {durations.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          {/* Cor predominante */}
          <div>
            <span className="text-sm font-medium mr-2">Cor:</span>
            <select
              className="border rounded px-2 py-1 text-xs"
              value={mainColor}
              onChange={e => setMainColor(e.target.value)}
            >
              {mainColors.map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          {/* Cenário/ambiente */}
          <div>
            <span className="text-sm font-medium mr-2">Cenário:</span>
            <select
              className="border rounded px-2 py-1 text-xs"
              value={scene}
              onChange={e => setScene(e.target.value)}
            >
              {scenes.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
        {/* Sugestões rápidas de temas */}
        <div className="mb-2 flex flex-wrap gap-2">
          <span className="text-xs text-gray-500 mr-2">Sugestões rápidas:</span>
          {quickThemes.map(theme => (
            <button
              key={theme.value}
              className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs hover:bg-purple-200"
              onClick={() => handleQuickTheme(theme.value)}
            >
              {theme.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          <Button onClick={() => {
            setIaType('image');
            setIaPrompt(buildPrompt('Crie uma imagem para Instagram'));
            setIaPromptMode('text');
            setIaModalOpen(true);
          }}>Gerar Imagem com IA</Button>
          <Button onClick={() => {
            setIaType('video');
            setIaPrompt(buildPrompt('Crie um vídeo para Instagram'));
            setIaPromptMode('text');
            setIaModalOpen(true);
          }}>Gerar Vídeo com IA</Button>
          <Button onClick={() => { setIaType('text'); setIaPrompt(''); setIaPromptMode('text'); setIaModalOpen(true); }}>Gerar Texto/Copy com IA (Gemini)</Button>
          <Button onClick={handleGeneratePromptImage} variant="secondary">Gerar prompt para imagem (Gemini)</Button>
          <Button onClick={handleGeneratePromptVideo} variant="secondary">Gerar prompt para vídeo (Gemini)</Button>
          <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
            Upload Imagem
            <input type="file" accept="image/*" hidden onChange={handleUploadImage} />
          </label>
          <Button onClick={handleAnimateImage} disabled={!iaResult?.url && !uploadedImage}>
            Animar Imagem (Vídeo IA)
          </Button>
        </div>
        {/* Preview IA */}
        {iaResult && (
          <div className="mt-4">
            {iaResult.type === 'image' && (
              <img src={iaResult.url} alt="Preview IA" className="w-full max-w-xs rounded shadow mb-2" />
            )}
            {iaResult.type === 'video' && (
              <video src={iaResult.url} controls className="w-full max-w-xs rounded shadow mb-2" />
            )}
            {iaResult.type === 'text' && (
              <div className="bg-white p-3 rounded shadow mb-2 whitespace-pre-line">{iaResult.text}</div>
            )}
            <div className="flex gap-2">
              <Button onClick={() => handleSaveToLibrary('post')}>Salvar como Post</Button>
              <Button onClick={() => handleSaveToLibrary('video')}>Salvar como Vídeo</Button>
              <Button onClick={() => handleSaveToLibrary('ad')}>Salvar como Anúncio</Button>
              <Button onClick={() => handleSaveToLibrary('creative')}>Salvar como Criativo</Button>
            </div>
          </div>
        )}
      </div>
      {/* Modal para prompt IA */}
      <Dialog open={iaModalOpen} onOpenChange={setIaModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {iaPromptMode === 'prompt-image' && 'Gerar prompt para imagem (Gemini)'}
              {iaPromptMode === 'prompt-video' && 'Gerar prompt para vídeo (Gemini)'}
              {iaType === 'image' && iaPromptMode === 'text' && 'Gerar Imagem com IA'}
              {iaType === 'video' && iaPromptMode === 'text' && 'Gerar Vídeo com IA'}
              {iaType === 'text' && iaPromptMode === 'text' && 'Gerar Texto/Copy com IA (Gemini)'}
            </DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">{iaPromptMode === 'prompt-image' ? 'Descreva a ideia da imagem' : iaPromptMode === 'prompt-video' ? 'Descreva a ideia do vídeo' : 'Prompt'}</label>
            <input
              className="w-full border rounded p-2"
              value={iaPrompt}
              onChange={e => setIaPrompt(e.target.value)}
              placeholder={iaPromptMode === 'prompt-image' ? 'Ex: Post sobre alimentação saudável para bebês' : iaPromptMode === 'prompt-video' ? 'Ex: Vídeo sobre rotina do sono do bebê' : 'Descreva o que deseja gerar...'}
              disabled={iaLoading}
            />
          </div>
          {/* Exibir prompt sugerido se houver */}
          {suggestedPrompt && (
            <div className="mb-4 bg-gray-100 p-3 rounded">
              <div className="text-xs text-gray-500 mb-1">Prompt sugerido:</div>
              <div className="font-mono text-sm mb-2">{suggestedPrompt}</div>
              <Button onClick={handleUseSuggestedPrompt} className="mb-2">Usar este prompt para gerar {iaPromptMode === 'prompt-image' ? 'imagem' : 'vídeo'}</Button>
            </div>
          )}
          <div className="flex gap-2">
            {iaPromptMode === 'prompt-image' ? (
              <Button onClick={handleConfirmGeneratePromptImage} disabled={iaLoading || !iaPrompt}>Gerar Prompt</Button>
            ) : iaPromptMode === 'prompt-video' ? (
              <Button onClick={handleConfirmGeneratePromptVideo} disabled={iaLoading || !iaPrompt}>Gerar Prompt</Button>
            ) : (
              <Button onClick={
                iaType === 'image' ? handleConfirmGenerateImage :
                iaType === 'video' ? handleConfirmGenerateVideo :
                handleConfirmGenerateText
              } disabled={iaLoading || !iaPrompt}>
                Gerar
              </Button>
            )}
            <Button variant="outline" onClick={() => { setIaModalOpen(false); setSuggestedPrompt(null); }} disabled={iaLoading}>Cancelar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Seção de Posts */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Posts para Redes Sociais</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => toggleChat('posts')}
              className="px-3 py-2 bg-purple-600 text-white rounded flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              {expandedChat === 'posts' ? 'Fechar Chat' : 'Chat IA'}
            </button>
            <button onClick={() => onCreate('post')} className="px-4 py-2 bg-blue-500 text-white rounded">
              Novo Post
            </button>
          </div>
        </div>

        {/* Chat de Posts */}
        {expandedChat === 'posts' && (
          <div className="mb-4 border rounded-lg bg-gray-50">
            <div className="p-4 border-b bg-white">
              <h4 className="font-medium text-purple-600">🤖 Assistente de Marketing - Posts</h4>
              <p className="text-sm text-gray-600">Pergunte sobre estratégias, ideias, funil de vendas, etc.</p>
            </div>
            
            {/* Sugestões Rápidas */}
            <div className="p-4 border-b bg-white">
              <p className="text-sm font-medium mb-2">💡 Sugestões rápidas:</p>
              <div className="flex flex-wrap gap-2">
                {quickThemes.map((theme, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickSuggestion('posts', theme.value)}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs hover:bg-purple-200"
                  >
                    {theme.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mensagens do Chat */}
            <div className="p-4 max-h-64 overflow-y-auto">
              {chatMessages.posts.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                  <p>Faça uma pergunta ou escolha uma sugestão para começar!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {chatMessages.posts.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-3 py-2 rounded-lg ${
                        msg.type === 'user' 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-white border'
                      }`}>
                        <ReactMarkdown
                          components={{
                            p: ({node, ...props}) => <p className="prose prose-sm max-w-none" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc ml-5" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal ml-5" {...props} />,
                            h1: ({node, ...props}) => <h1 className="text-lg font-bold mt-2 mb-1" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-base font-bold mt-2 mb-1" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-base font-semibold mt-2 mb-1" {...props} />,
                            li: ({node, ...props}) => <li className="mb-1" {...props} />,
                          }}
                        >
                          {typeof msg.content === 'string' ? msg.content : ''}
                        </ReactMarkdown>
                        <p className="text-xs opacity-70 mt-1">
                          {msg.timestamp.toLocaleTimeString()}
                        </p>
                        
                        {/* Botões de ação para mensagens da IA */}
                        {msg.type === 'ai' && msg.actions && (
                          <div className="mt-3 space-y-1">
                            {msg.actions.map((action, index) => (
                              <button
                                key={index}
                                onClick={() => handleAction(action.action, action.data, 'posts')}
                                className="w-full text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Input do Chat */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput.posts}
                  onChange={(e) => setChatInput(prev => ({ ...prev, posts: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage('posts')}
                  placeholder="Digite sua pergunta sobre posts..."
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={() => handleSendMessage('posts')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Posts */}
        <div className="space-y-2">
          {posts.map((post) => (
            <div key={post.id} className="flex items-center justify-between border rounded-lg p-3 bg-white">
              <div>
                <h4 className="font-medium">{post.title}</h4>
                <p className="text-sm text-gray-600">{post.platform} • {post.category}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onEdit('post', post)} className="text-blue-600 hover:underline">
                  Editar
                </button>
                <button onClick={() => onDelete && onDelete('post', post.id)} className="text-red-600 hover:underline">
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seção de Anúncios */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Anúncios</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => toggleChat('ads')}
              className="px-3 py-2 bg-purple-600 text-white rounded flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              {expandedChat === 'ads' ? 'Fechar Chat' : 'Chat IA'}
            </button>
            <button onClick={() => onCreate('ad')} className="px-4 py-2 bg-blue-500 text-white rounded">
              Novo Anúncio
            </button>
          </div>
        </div>

        {/* Chat de Anúncios */}
        {expandedChat === 'ads' && (
          <div className="mb-4 border rounded-lg bg-gray-50">
            <div className="p-4 border-b bg-white">
              <h4 className="font-medium text-purple-600">🤖 Assistente de Marketing - Anúncios</h4>
              <p className="text-sm text-gray-600">Pergunte sobre segmentação, orçamento, otimização, etc.</p>
            </div>
            
            {/* Sugestões Rápidas */}
            <div className="p-4 border-b bg-white">
              <p className="text-sm font-medium mb-2">💡 Sugestões rápidas:</p>
              <div className="flex flex-wrap gap-2">
                {quickThemes.map((theme, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickSuggestion('ads', theme.value)}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs hover:bg-purple-200"
                  >
                    {theme.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mensagens do Chat */}
            <div className="p-4 max-h-64 overflow-y-auto">
              {chatMessages.ads.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                  <p>Faça uma pergunta ou escolha uma sugestão para começar!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {chatMessages.ads.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-3 py-2 rounded-lg ${
                        msg.type === 'user' 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-white border'
                      }`}>
                        <ReactMarkdown
                          components={{
                            p: ({node, ...props}) => <p className="prose prose-sm max-w-none" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc ml-5" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal ml-5" {...props} />,
                            h1: ({node, ...props}) => <h1 className="text-lg font-bold mt-2 mb-1" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-base font-bold mt-2 mb-1" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-base font-semibold mt-2 mb-1" {...props} />,
                            li: ({node, ...props}) => <li className="mb-1" {...props} />,
                          }}
                        >
                          {typeof msg.content === 'string' ? msg.content : ''}
                        </ReactMarkdown>
                        <p className="text-xs opacity-70 mt-1">
                          {msg.timestamp.toLocaleTimeString()}
                        </p>
                        
                        {/* Botões de ação para mensagens da IA */}
                        {msg.type === 'ai' && msg.actions && (
                          <div className="mt-3 space-y-1">
                            {msg.actions.map((action, index) => (
                              <button
                                key={index}
                                onClick={() => handleAction(action.action, action.data, 'ads')}
                                className="w-full text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Input do Chat */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput.ads}
                  onChange={(e) => setChatInput(prev => ({ ...prev, ads: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage('ads')}
                  placeholder="Digite sua pergunta sobre anúncios..."
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={() => handleSendMessage('ads')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Anúncios */}
        <div className="space-y-2">
          {ads.map((ad) => (
            <div key={ad.id} className="flex items-center justify-between border rounded-lg p-3 bg-white">
              <div>
                <h4 className="font-medium">{ad.title}</h4>
                <p className="text-sm text-gray-600">{ad.platform} • {ad.adType}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onEdit('ad', ad)} className="text-blue-600 hover:underline">
                  Editar
                </button>
                <button onClick={() => onDelete && onDelete('ad', ad.id)} className="text-red-600 hover:underline">
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Outras seções (videos, arguments, links) */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Vídeos</h3>
        <button onClick={() => onCreate('video')} className="mb-2 px-4 py-2 bg-blue-500 text-white rounded">Novo Vídeo</button>
        <ul>
          {videos.map((video) => (
            <li key={video.id} className="flex items-center justify-between border-b py-2">
              <span>{video.title}</span>
              <div className="flex gap-2">
                <button onClick={() => onEdit('video', video)} className="text-blue-600">Editar</button>
                <button onClick={() => onDelete && onDelete('video', video.id)} className="text-red-600">Excluir</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Argumentos de Venda</h3>
        <button onClick={() => onCreate('argument')} className="mb-2 px-4 py-2 bg-blue-500 text-white rounded">Novo Argumento</button>
        <ul>
          {salesArguments.map((arg) => (
            <li key={arg.id} className="flex items-center justify-between border-b py-2">
              <span>{arg.title}</span>
              <div className="flex gap-2">
                <button onClick={() => onEdit('argument', arg)} className="text-blue-600">Editar</button>
                <button onClick={() => onDelete && onDelete('argument', arg.id)} className="text-red-600">Excluir</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Links de Afiliado</h3>
        <button onClick={() => onCreate('link')} className="mb-2 px-4 py-2 bg-blue-500 text-white rounded">Novo Link</button>
        <ul>
          {links.map((link) => (
            <li key={link.id} className="flex items-center justify-between border-b py-2">
              <span>{link.name}</span>
              <div className="flex gap-2">
                <button onClick={() => onEdit('link', link)} className="text-blue-600">Editar</button>
                <button onClick={() => onDelete && onDelete('link', link.id)} className="text-red-600">Excluir</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}; 