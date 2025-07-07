import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Baby, 
  Image, 
  User, 
  FileImage, 
  Play, 
  Pause,
  ListChecks, 
  Sparkles, 
  Heart, 
  Shield, 
  Clock, 
  Star,
  CheckCircle,
  ArrowRight,
  MessageCircle,
  Zap,
  Award,
  TrendingUp,
  Users,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Quote
} from 'lucide-react';
import Header from '@/components/Header';
import { apiFetch } from '@/config/api';
import { useFacebookPixel } from '@/hooks/useFacebookPixel';
import AdminAutomation from './admin/AdminAutomation';

interface LandingPageContent {
  id: number;
  heroTitle: string;
  heroSubtitle: string;
  heroImage?: string;
  heroVideo?: string;
  heroMediaType?: string;
  heroMediaUrl?: string;
  features: any[];
  testimonials: any[];
  faq: any[];
  stats: any[];
  ctaText?: string;
  ctaButtonText?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [landingContent, setLandingContent] = useState<LandingPageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);

  useFacebookPixel();

  // Carregar conteúdo da landing page
  useEffect(() => {
    const fetchLandingContent = async () => {
      try {
        setLoading(true);
        const response = await apiFetch('/public/landing-page');
        if (response.success) {
          setLandingContent(response.data);
        }
      } catch (error) {
        console.error('Erro ao carregar conteúdo da landing page:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLandingContent();
  }, []);

  // Features padrão caso não tenha conteúdo dinâmico
  const defaultFeatures = [
    {
      icon: Image,
      title: "Memórias Especiais",
      description: "Capture e preserve os momentos mais preciosos do seu bebê com fotos e descrições detalhadas"
    },
    {
      icon: Baby,
      title: "Marcos do Desenvolvimento",
      description: "Acompanhe e registre cada conquista importante no crescimento do seu pequeno"
    },
    {
      icon: User,
      title: "Rotina Diária",
      description: "Registre atividades como sono, alimentação, brincadeiras e muito mais"
    },
    {
      icon: FileImage,
      title: "Linha do Tempo",
      description: "Visualize o crescimento do seu bebê em uma linha do tempo interativa e organizada"
    }
  ];

  // Conteúdo padrão caso não tenha conteúdo dinâmico
  const defaultContent = {
    heroTitle: "Baby Diary",
    heroSubtitle: "O aplicativo completo para acompanhar o desenvolvimento do seu bebê. Capture memórias, registre marcos e organize a rotina de forma simples e carinhosa.",
    ctaText: "Começar Gratuitamente",
    ctaButtonText: "Já tenho conta",
    heroImage: undefined,
    heroVideo: undefined,
    heroMediaType: undefined,
    heroMediaUrl: undefined,
  };

  const content = landingContent || defaultContent;
  const features = landingContent?.features?.length > 0 ? landingContent.features : defaultFeatures;
  const testimonials = landingContent?.testimonials || [];

  // Função para renderizar o hero media (imagem ou vídeo)
  const renderHeroMedia = () => {
    const mediaUrl = content.heroMediaUrl || content.heroImage || content.heroVideo;
    const mediaType = content.heroMediaType || (content.heroVideo ? 'video' : content.heroImage ? 'image' : null);

    if (!mediaUrl) return null;

    if (mediaType === 'video') {
      return (
        <div className="relative w-full max-w-2xl mx-auto mb-8">
          {/* Texto para as mamães */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-4 py-2 rounded-full text-sm font-medium">
              <span className="text-lg">👶</span>
              <span>Veja como outras mamães estão usando o Baby Diary</span>
            </div>
          </div>
          
          {/* Container do vídeo */}
          <div className="relative group">
            <video
              className="w-full h-64 md:h-80 object-cover rounded-2xl shadow-2xl transition-transform duration-300 group-hover:scale-105"
              controls
              loop
              playsInline
              poster={mediaUrl + '?w=800&h=400&fit=crop&c=thumb'}
              onPlay={() => setIsVideoPlaying(true)}
              onPause={() => setIsVideoPlaying(false)}
              onLoadedData={() => setIsVideoPlaying(false)} // Inicia pausado
            >
              <source src={mediaUrl} type="video/mp4" />
              <source src={mediaUrl} type="video/webm" />
              Seu navegador não suporta vídeos.
            </video>
            
            {/* Badge de vídeo */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
              {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              Vídeo
            </div>
            
            {/* Indicador de status do vídeo */}
            <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-medium">
              {isVideoPlaying ? 'Reproduzindo' : 'Pausado'}
            </div>
          </div>
          
          {/* Texto explicativo */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600 max-w-lg mx-auto">
              Descubra como o Baby Diary está ajudando milhares de famílias a documentar e celebrar cada momento especial do desenvolvimento dos seus bebês.
            </p>
            <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                Controles nativos
              </span>
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-blue-500" />
                Reprodução segura
              </span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full max-w-2xl mx-auto mb-8">
        <img
          src={mediaUrl}
          alt="Baby Diary"
          className="w-full h-64 md:h-80 object-cover rounded-2xl shadow-2xl"
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-baby-pink via-baby-blue to-baby-lavender flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-baby-pink via-baby-blue to-baby-lavender">
      <Header showAuth={true} />
      
      <div className="container max-w-6xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="w-24 h-24 mx-auto mb-8 baby-gradient-pink rounded-full flex items-center justify-center animate-bounce-gentle">
            <Baby className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            {content.heroTitle}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            {content.heroSubtitle}
          </p>
          
          {/* Hero Media (Imagem ou Vídeo) */}
          {renderHeroMedia()}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="baby-gradient-pink text-white text-lg px-8 py-4 hover:shadow-xl transition-all duration-300 border-0"
              onClick={() => navigate('/register')}
            >
              {content.ctaText}
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="text-lg px-8 py-4 hover:shadow-lg transition-all duration-300"
              onClick={() => navigate('/login')}
            >
              {content.ctaButtonText}
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => {
            // Se for feature dinâmica, usar ícone padrão baseado no título
            const getIcon = (title: string) => {
              if (title.toLowerCase().includes('memória')) return Image;
              if (title.toLowerCase().includes('marco')) return Baby;
              if (title.toLowerCase().includes('rotina')) return User;
              if (title.toLowerCase().includes('linha')) return FileImage;
              return Image; // ícone padrão
            };
            
            const Icon = feature.icon ? feature.icon : getIcon(feature.title);
            
            return (
              <Card 
                key={feature.title}
                className="glass-card border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 baby-gradient-blue rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-800">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Detailed Features Section */}
        <div className="py-16 space-y-16">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Uma assistente completa para sua jornada
            </h2>
            <p className="text-xl text-muted-foreground mt-4 max-w-3xl mx-auto">
              Veja como o Baby Diary transforma a maneira como você acompanha e celebra cada momento.
            </p>
          </div>

          <div className="space-y-12">
            {/* Feature 1: Acompanhamento */}
            <Card className="glass-card border-0 shadow-xl hover:shadow-2xl transition-all duration-300 animate-fade-in">
              <CardContent className="p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 baby-gradient-blue rounded-xl flex items-center justify-center">
                    <ListChecks className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Acompanhamento Completo e Descomplicado</h3>
                  <p className="text-lg text-muted-foreground">
                    Registre crescimento, saúde, vacinas, alimentação e sono. Tenha tudo organizado para as consultas com o pediatra e entenda os padrões do seu bebê com facilidade.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Feature 2: IA */}
            <Card className="glass-card border-0 shadow-xl hover:shadow-2xl transition-all duration-300 animate-fade-in" style={{ animationDelay: '150ms' }}>
              <CardContent className="p-8 md:p-10 flex flex-col md:flex-row-reverse items-center gap-8">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 baby-gradient-pink rounded-xl flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="md:text-right">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Inteligência Artificial como sua Aliada</h3>
                  <p className="text-lg text-muted-foreground">
                    Receba conselhos personalizados, tire dúvidas 24/7 com nosso chat, e receba sugestões de atividades para estimular o desenvolvimento do seu filho.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Feature 3: Memórias */}
            <Card className="glass-card border-0 shadow-xl hover:shadow-2xl transition-all duration-300 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <CardContent className="p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 baby-gradient-lavender rounded-xl flex items-center justify-center">
                    <Heart className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Memórias Preciosas Guardadas para Sempre</h3>
                  <p className="text-lg text-muted-foreground">
                    Crie um diário digital com fotos e anotações. Uma linha do tempo interativa para reviver cada sorriso, cada passo, cada momento inesquecível.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="py-16">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              O que as mamães estão dizendo
            </h2>
            <p className="text-xl text-muted-foreground mt-4 max-w-3xl mx-auto">
              A confiança de quem usa e ama o Baby Diary no dia a dia.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.length > 0 ? (
              testimonials.map((testimonial, index) => (
                <Card key={index} className="glass-card border-0 shadow-lg animate-fade-in" style={{ animationDelay: `${index * 150}ms` }}>
                  <CardContent className="p-8 text-center">
                    <Quote className="w-8 h-8 mx-auto text-pink-300 mb-4" />
                    <p className="text-lg text-gray-700 italic mb-6">
                      "{testimonial.text}"
                    </p>
                    <p className="font-bold text-gray-800">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.rating ? `${testimonial.rating}/5` : ''}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <Card className="glass-card border-0 shadow-lg animate-fade-in">
                  <CardContent className="p-8 text-center">
                    <Quote className="w-8 h-8 mx-auto text-pink-300 mb-4" />
                    <p className="text-lg text-gray-700 italic mb-6">
                      "O Baby Diary mudou tudo! Consigo ver os padrões de sono do meu filho e o chat com IA me salvou em várias madrugadas. É como ter uma especialista no bolso."
                    </p>
                    <p className="font-bold text-gray-800">Juliana R.</p>
                    <p className="text-sm text-muted-foreground">Mãe do Theo, 4 meses</p>
                  </CardContent>
                </Card>
                <Card className="glass-card border-0 shadow-lg animate-fade-in" style={{ animationDelay: '150ms' }}>
                  <CardContent className="p-8 text-center">
                    <Quote className="w-8 h-8 mx-auto text-blue-300 mb-4" />
                    <p className="text-lg text-gray-700 italic mb-6">
                      "A linha do tempo é a minha parte favorita. É tão emocionante ver o quanto minha filha cresceu e rever todas as memórias que criamos. Indispensável!"
                    </p>
                    <p className="font-bold text-gray-800">Carla M.</p>
                    <p className="text-sm text-muted-foreground">Mãe da Sofia, 1 ano</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* How it works Section */}
        <div className="py-16 text-center">
          <div className="mb-12 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Simples como um abraço
            </h2>
            <p className="text-xl text-muted-foreground mt-4 max-w-3xl mx-auto">
              Comece em apenas 3 passos simples e rápidos.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="animate-fade-in" style={{ animationDelay: '0ms' }}>
              <div className="w-20 h-20 mx-auto baby-gradient-pink rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">1</div>
              <h3 className="text-2xl font-semibold mb-2">Crie sua Conta</h3>
              <p className="text-muted-foreground">É grátis e leva menos de um minuto. Seus dados estão seguros conosco.</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '150ms' }}>
              <div className="w-20 h-20 mx-auto baby-gradient-blue rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">2</div>
              <h3 className="text-2xl font-semibold mb-2">Adicione seu Bebê</h3>
              <p className="text-muted-foreground">Insira as informações básicas para começar a personalizar sua experiência.</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
              <div className="w-20 h-20 mx-auto baby-gradient-lavender rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">3</div>
              <h3 className="text-2xl font-semibold mb-2">Comece a Registrar</h3>
              <p className="text-muted-foreground">Capture memórias, acompanhe o desenvolvimento e aproveite a jornada.</p>
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="text-center animate-fade-in">
          <Card className="glass-card border-0 shadow-2xl max-w-4xl mx-auto">
            <CardContent className="p-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Comece a documentar hoje mesmo
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Crie sua conta gratuita e adicione seu primeiro bebê. 
                Você pode começar imediatamente a capturar esses momentos únicos que passam tão rápido.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  className="baby-gradient-lavender text-white text-lg px-8 py-4 hover:shadow-xl transition-all duration-300 border-0"
                  onClick={() => navigate('/register')}
                >
                  Criar Conta Grátis
                </Button>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>✨ 1 bebê grátis</span>
                  <span>•</span>
                  <span>📱 Memórias ilimitadas</span>
                  <span>•</span>
                  <span>🎯 Marcos importantes</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center mt-8">
          <Link to="/business">
            <Button className="text-lg px-8 py-4 bg-green-600 hover:bg-green-700">Quero vender o Baby Diary</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
