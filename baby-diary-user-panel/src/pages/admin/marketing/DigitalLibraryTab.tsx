import React, { useState } from 'react';
import { Sparkles, MessageSquare, Send, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '../../../hooks/use-toast';
import ReactMarkdown from 'react-markdown';

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

  const quickSuggestions = {
    posts: [
      "💡 Ideias de posts para engajar mães",
      "📈 Estratégia de conteúdo para vendas",
      "🎯 Funil de vendas para posts",
      "📱 Posts para Instagram/Facebook",
      "🔥 Posts virais para mães",
      "💰 Posts para converter em vendas"
    ],
    ads: [
      "🎯 Segmentação para anúncios",
      "💰 Estratégia de orçamento",
      "📊 Otimização de campanhas",
      "🎨 Ideias de criativos",
      "📈 Funil de conversão",
      "🔥 Anúncios de alta performance"
    ]
  };

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

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Biblioteca Digital</h2>
      
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
                {quickSuggestions.posts.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickSuggestion('posts', suggestion)}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs hover:bg-purple-200"
                  >
                    {suggestion}
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
                {quickSuggestions.ads.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickSuggestion('ads', suggestion)}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs hover:bg-purple-200"
                  >
                    {suggestion}
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