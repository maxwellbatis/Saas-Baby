import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Play, Pause, CheckCircle, Shield } from 'lucide-react';
import { apiFetch } from '../config/api';

interface BusinessPageContent {
  id: number;
  heroTitle: string;
  heroSubtitle: string;
  heroImage?: string;
  heroVideo?: string;
  heroMediaType?: string;
  heroMediaUrl?: string;
  benefits: any[];
  businessAdvantages: any[];
  featuresMoms: string[];
  featuresAdmin: string[];
  marketData: string[];
  differentials: any[];
  finalArguments: any[];
  futureFeatures: any[];
  ctaText?: string;
  ctaButtonText?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

// Dados padrão caso a API não retorne nada
const defaultBenefits = [
  {
    icon: '📸',
    title: 'Memórias Eternas',
    items: [
      'Captura cada momento especial - do primeiro sorriso ao primeiro passo',
      'Fotos organizadas por marcos',
      'Compartilhamento com família em tempo real',
      'Histórico completo mês a mês',
      'Exportação de memórias em PDF',
      'Diário de emoções e sentimentos',
    ],
  },
  {
    icon: '🧠',
    title: 'Tranquilidade Mental',
    items: [
      'Acompanhamento médico completo',
      'Alertas inteligentes para consultas e vacinas',
      'Padrões de sono e alimentação',
      'Dicas personalizadas',
      'Relatórios de desenvolvimento',
      'Lembretes automáticos integrados ao calendário',
    ],
  },
  {
    icon: '🎮',
    title: 'Gamificação que Motiva',
    items: [
      'Sistema de recompensas',
      'Desafios semanais',
      'Badges e conquistas',
      'Ranking com outras mães',
      'Missões diárias para engajamento',
    ],
  },
  {
    icon: '🔗',
    title: 'Integração e Compartilhamento',
    items: [
      'Integração com WhatsApp e redes sociais',
      'Convide familiares para colaborar',
      'Álbum digital compartilhável',
    ],
  },
];

const defaultBusinessAdvantages = [
  {
    icon: '✅',
    title: 'Produto 100% Pronto',
    items: [
      'Zero desenvolvimento: comece a vender hoje',
      'Tecnologia moderna: React, TypeScript, IA',
      'Infraestrutura escalável para milhares de usuários',
      'Monetização ativa via Stripe',
      'Suporte técnico e documentação completa',
    ],
  },
  {
    icon: '💰',
    title: 'Monetização Garantida',
    items: [
      '3 planos de assinatura: Básico, Premium e Família',
      'Receita recorrente mensal e anual',
      'Taxa de conversão alta em nicho emocional',
      'Upselling automático e cross-sell integrado',
      'Gestão de assinaturas fácil e transparente',
    ],
  },
  {
    icon: '📈',
    title: 'Escalabilidade e Crescimento',
    items: [
      'Margem alta: custos fixos, receita crescente',
      'Automação total: funciona 24/7',
      'Crescimento orgânico: mães compartilham naturalmente',
      'Retenção alta: produto viciante e emocional',
      'Analytics detalhado para decisões estratégicas',
    ],
  },
  {
    icon: '🚀',
    title: 'Diferenciais Competitivos',
    items: [
      'Único com IA integrada para análise e previsões',
      'Gamificação avançada para engajamento',
      'Painel admin completo e intuitivo',
      'Marketing automatizado e segmentado',
      'Comunidade integrada e suporte ao cliente',
    ],
  },
];

const defaultFeaturesMoms = [
  'Diário digital: memórias, fotos e vídeos',
  'Marcos de desenvolvimento e conquistas',
  'Atividades e rotinas personalizadas',
  'Saúde e vacinas: calendário médico completo',
  'IA personalizada: dicas e análises inteligentes',
  'Compartilhamento familiar: convide e conecte toda a família',
  'Gamificação: pontos, badges, desafios e missões',
  'Exportação de memórias em PDF',
  'Relatórios de desenvolvimento do bebê',
  'Lembretes automáticos e integração com calendário',
  'Diário de emoções e sentimentos',
  'Álbum digital compartilhável',
  'Integração com WhatsApp e redes sociais',
];

const defaultFeaturesAdmin = [
  'Dashboard completo com métricas em tempo real',
  'Gestão de usuários e assinaturas',
  'Sistema de planos flexível',
  'Marketing avançado: campanhas automáticas e segmentação',
  'Biblioteca de conteúdo: posts, anúncios e argumentos de venda',
  'IA para marketing: geração automática de conteúdo',
  'Analytics detalhado: comportamento e conversões',
  'Suporte técnico e documentação',
];

const defaultMarketData = [
  'Mercado materno: 2.5 milhões de bebês/ano no Brasil',
  'Poder aquisitivo: mães investem em produtos para filhos',
  'Tempo no celular: 4+ horas/dia',
  'Compartilhamento natural: mães são influenciadoras',
];

const defaultDifferentials = [
  {
    icon: '🤖',
    title: 'IA Integrada e Personalizada',
    desc: 'O único app do nicho com inteligência artificial que entende padrões, sugere dicas e antecipa necessidades das mães e do bebê.'
  },
  {
    icon: '🎮',
    title: 'Gamificação Avançada',
    desc: 'Sistema de pontos, badges, desafios e ranking que mantém o engajamento das mães por anos, tornando o registro de memórias divertido e motivador.'
  },
  {
    icon: '🛠️',
    title: 'Painel Admin Completo',
    desc: 'Gestão total do negócio: usuários, planos, marketing, conteúdo e analytics em um painel intuitivo e poderoso.'
  },
  {
    icon: '📣',
    title: 'Marketing Integrado',
    desc: 'Ferramentas automáticas de campanhas, segmentação e geração de conteúdo com IA para escalar vendas sem esforço manual.'
  },
  {
    icon: '🤝',
    title: 'Comunidade Ativa e Suporte Dedicado',
    desc: 'Rede social exclusiva para mães, suporte humanizado e comunidade que gera retenção e viralização orgânica.'
  },
];

const defaultFinalArguments = [
  {
    icon: '🚀',
    title: 'Produto Pronto, Zero Risco',
    desc: 'Comece a vender hoje mesmo. Sem custos de desenvolvimento, sem dor de cabeça técnica.'
  },
  {
    icon: '💸',
    title: 'Receita Recorrente e Alta Retenção',
    desc: 'Assinaturas mensais e anuais garantem previsibilidade e crescimento constante.'
  },
  {
    icon: '🌍',
    title: 'Escalabilidade Infinita',
    desc: 'Infraestrutura robusta e automação total: cada novo usuário aumenta sua receita sem aumentar seu trabalho.'
  },
  {
    icon: '📈',
    title: 'Margem Alta',
    desc: 'Modelo SaaS com custos fixos baixos e potencial de lucro exponencial.'
  },
  {
    icon: '✨',
    title: 'Diferencial Tecnológico e Emocional',
    desc: 'Tecnologia de ponta aliada ao apelo emocional: mães investem em memórias e tranquilidade, não apenas em apps.'
  },
];

const defaultFutureFeatures = [
  {
    icon: '🛒',
    title: 'Marketplace Integrado',
    desc: 'Em breve, mães poderão comprar e vender produtos e serviços diretamente pelo app, criando uma economia colaborativa e facilitando o acesso a itens essenciais para o universo materno.'
  },
  {
    icon: '🤝',
    title: 'Programa de Afiliados',
    desc: 'Qualquer pessoa poderá indicar o Baby Diary e ganhar comissão por cada nova mãe assinante, potencializando o crescimento e criando uma rede de promotores do app.'
  },
];

export default function Business() {
  const [content, setContent] = useState<BusinessPageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const response = await apiFetch('/public/business-page-content');
        if (response.success) {
          setContent(response.data);
        } else {
          console.error('Erro ao carregar conteúdo da página business:', response.error);
        }
      } catch (error) {
        console.error('Erro ao buscar conteúdo:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  // Função para renderizar o hero media (imagem ou vídeo)
  const renderHeroMedia = () => {
    const mediaUrl = content?.heroMediaUrl || content?.heroImage || content?.heroVideo;
    const mediaType = content?.heroMediaType || (content?.heroVideo ? 'video' : content?.heroImage ? 'image' : null);

    if (!mediaUrl) return null;

    if (mediaType === 'video') {
      return (
        <div className="relative w-full max-w-2xl mx-auto mb-8">
          {/* Texto para parceiros */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
              <span className="text-lg">💼</span>
              <span>Veja o potencial do Baby Diary para seu negócio</span>
            </div>
          </div>
          
          {/* Container do vídeo */}
          <div className="relative group">
            <video
              className="w-full h-64 md:h-80 object-cover rounded-2xl shadow-2xl transition-transform duration-300 group-hover:scale-105"
              controls
              muted
              loop
              playsInline
              poster={mediaUrl + '?w=800&h=400&fit=crop&c=thumb'}
              onPlay={() => setIsVideoPlaying(true)}
              onPause={() => setIsVideoPlaying(false)}
              onLoadedData={() => setIsVideoPlaying(false)}
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
              Descubra como o Baby Diary pode transformar seu negócio e conectar você com milhares de mães que buscam uma solução completa para documentar o desenvolvimento dos seus bebês.
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
          alt="Baby Diary Business"
          className="w-full h-64 md:h-80 object-cover rounded-2xl shadow-2xl"
        />
      </div>
    );
  };

  // Usar dados do backend ou fallback para dados padrão
  const benefits = content?.benefits?.length > 0 ? content.benefits : defaultBenefits;
  const businessAdvantages = content?.businessAdvantages?.length > 0 ? content.businessAdvantages : defaultBusinessAdvantages;
  const featuresMoms = content?.featuresMoms?.length > 0 ? content.featuresMoms : defaultFeaturesMoms;
  const featuresAdmin = content?.featuresAdmin?.length > 0 ? content.featuresAdmin : defaultFeaturesAdmin;
  const marketData = content?.marketData?.length > 0 ? content.marketData : defaultMarketData;
  const differentials = content?.differentials?.length > 0 ? content.differentials : defaultDifferentials;
  const finalArguments = content?.finalArguments?.length > 0 ? content.finalArguments : defaultFinalArguments;
  const futureFeatures = content?.futureFeatures?.length > 0 ? content.futureFeatures : defaultFutureFeatures;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-100 pb-20">
      {/* Hero Section */}
      <section className="text-center py-16 px-4 bg-gradient-to-r from-pink-200 via-blue-100 to-purple-200 shadow-lg relative">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-blue-600 to-purple-600 drop-shadow-lg">
          {content?.heroTitle || '🍼 BABY DIARY'}
        </h1>
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
          {content?.heroSubtitle || 'O APP DEFINITIVO PARA MÃES QUE QUEREM DOCUMENTAR CADA MOMENTO ESPECIAL'}
        </h2>
        <p className="text-xl md:text-2xl mb-8 text-gray-700 max-w-2xl mx-auto">
          SaaS completo, pronto para vender, que conecta emoção, tecnologia e negócios. Veja ao vivo ou acesse o painel admin para conhecer o potencial!
        </p>
        
        {/* Hero Media (Imagem ou Vídeo) */}
        {renderHeroMedia()}
        
        <div className="flex flex-col md:flex-row justify-center gap-4 mb-4">
          <a href="https://babydiary.shop/" target="_blank" rel="noopener noreferrer">
            <Button className="text-lg px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-xl hover:scale-105 transition">
              {content?.ctaText || 'Ver o App ao Vivo'}
            </Button>
          </a>
          <a href="https://babydiary.shop/admin/login" target="_blank" rel="noopener noreferrer">
            <Button className="text-lg px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-xl hover:scale-105 transition">
              Acessar Painel Admin
            </Button>
          </a>
        </div>
        <div className="mt-6">
          <a href="https://w.app/babydiary" target="_blank" rel="noopener noreferrer">
            <Button className="text-lg px-8 py-4 bg-green-600 hover:bg-green-700 shadow-lg">
              {content?.ctaButtonText || 'Quero ser parceiro'}
            </Button>
          </a>
        </div>
      </section>

      {/* Bloco para Influenciadoras Maternas */}
      <section className="mb-12 py-10 bg-gradient-to-r from-pink-100 to-yellow-50 border-y-2 border-pink-200">
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center">
          <div className="text-5xl mb-3">🤳</div>
          <h3 className="text-2xl md:text-3xl font-bold mb-2 text-pink-700">PARA INFLUENCIADORAS DIGITAIS DO NICHO MATERNO</h3>
          <ul className="list-disc text-lg text-gray-800 text-left mb-4 pl-6">
            <li>Ganhe acesso vitalício ao app completo para mostrar no seu perfil</li>
            <li>Indique outras mães e receba comissão recorrente com cada assinatura</li>
            <li>Crie sua própria versão do app com seu nome e estilo <span className="font-semibold">(white-label)</span></li>
            <li>Transforme sua audiência em uma fonte de renda recorrente com valor real</li>
          </ul>
          <div className="bg-yellow-100 rounded-lg p-4 mt-2 mb-2 shadow">
            <span className="text-lg font-semibold text-pink-700">🎁 Oferta exclusiva para influenciadoras:</span> acesso VIP + bônus de lançamento.<br/>
            <span className="text-gray-700">Entre em contato e receba sua versão personalizada em minutos.</span>
          </div>
          <a href="https://w.app/babydiary" target="_blank" rel="noopener noreferrer">
            <Button className="mt-4 text-lg px-8 py-4 bg-gradient-to-r from-pink-500 to-yellow-400 text-white shadow-xl hover:scale-105 transition">Quero ser influenciadora parceira</Button>
          </a>
        </div>
      </section>

      {/* Benefícios Emocionais */}
      <section className="mb-12 py-12 bg-white/80">
        <h3 className="text-3xl font-bold mb-8 text-center text-pink-700">💖 Benefícios Emocionais para as Mães</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {benefits.map((b, index) => (
            <Card key={index} className="p-8 flex flex-col items-center shadow-md hover:shadow-xl transition h-full">
              <div className="text-5xl mb-3">{b.icon}</div>
              <h4 className="font-semibold text-xl mb-3 text-blue-700">{b.title}</h4>
              <ul className="text-left list-disc pl-4 text-gray-700">
                {b.items.map((item, i) => (
                  <li key={i} className="mb-1">{item}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      {/* Funcionalidades para as Mães */}
      <section className="mb-12 py-12 bg-gradient-to-r from-blue-50 to-purple-100">
        <h3 className="text-3xl font-bold mb-8 text-center text-purple-700">✨ Funcionalidades Exclusivas para as Mães</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {featuresMoms.map((f, i) => (
            <Card key={i} className="p-6 flex items-center gap-4 shadow hover:shadow-lg transition">
              <span className="text-2xl">✔️</span>
              <span className="text-lg text-gray-800">{f}</span>
            </Card>
          ))}
        </div>
      </section>

      {/* Vantagens de Negócio */}
      <section className="mb-12 py-12 bg-white/80">
        <h3 className="text-3xl font-bold mb-8 text-center text-blue-700">🚀 Benefícios de Negócio para Infoprodutores</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {businessAdvantages.map((b, index) => (
            <Card key={index} className="p-8 flex flex-col items-center shadow-md hover:shadow-xl transition h-full">
              <div className="text-5xl mb-3">{b.icon}</div>
              <h4 className="font-semibold text-xl mb-3 text-pink-700">{b.title}</h4>
              <ul className="text-left list-disc pl-4 text-gray-700">
                {b.items.map((item, i) => (
                  <li key={i} className="mb-1">{item}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      {/* Funcionalidades para o Admin */}
      <section className="mb-12 py-12 bg-gradient-to-r from-pink-50 to-blue-100">
        <h3 className="text-3xl font-bold mb-8 text-center text-pink-700">⚙️ Funcionalidades do Painel Admin</h3>
        <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          {featuresAdmin.map((f, i) => (
            <Card key={i} className="p-6 flex items-center gap-4 shadow hover:shadow-lg transition">
              <span className="text-2xl">🛠️</span>
              <span className="text-lg text-gray-800">{f}</span>
            </Card>
          ))}
        </div>
      </section>

      {/* Oportunidade de Mercado */}
      <section className="mb-12 py-12 bg-white/80">
        <h3 className="text-3xl font-bold mb-8 text-center text-blue-700">🎯 Oportunidade de Mercado</h3>
        <ul className="list-disc pl-8 text-lg max-w-3xl mx-auto text-gray-700">
          {marketData.map((d, i) => <li key={i} className="mb-2">{d}</li>)}
        </ul>
      </section>

      {/* Diferenciais Competitivos */}
      <section className="mb-12 py-12 bg-gradient-to-r from-blue-50 to-purple-100">
        <h3 className="text-3xl font-bold mb-8 text-center text-purple-700">💎 Diferenciais Competitivos</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {differentials.map((d, i) => (
            <Card key={i} className="p-8 flex flex-col items-center shadow-md hover:shadow-xl transition h-full text-center">
              <div className="text-4xl mb-3">{d.icon}</div>
              <h4 className="font-semibold text-xl mb-2 text-blue-700">{d.title}</h4>
              <p className="text-gray-700 text-base">{d.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Argumento Final */}
      <section className="mb-12 py-12 bg-white/80">
        <h3 className="text-3xl font-bold mb-8 text-center text-pink-700">🔥 Por que investir agora?</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {finalArguments.map((a, i) => (
            <Card key={i} className="p-8 flex flex-col items-center shadow-md hover:shadow-xl transition h-full text-center">
              <div className="text-4xl mb-3">{a.icon}</div>
              <h4 className="font-semibold text-xl mb-2 text-pink-700">{a.title}</h4>
              <p className="text-gray-700 text-base">{a.desc}</p>
            </Card>
          ))}
        </div>
        <p className="text-2xl text-center font-semibold my-8 text-pink-700 max-w-2xl mx-auto">O Baby Diary não vende um app. Vende a promessa de que nenhum momento especial será perdido. E essa promessa é irresistível para qualquer mãe.</p>
        <div className="flex flex-col items-center gap-4">
          <a href="https://w.app/babydiary" target="_blank" rel="noopener noreferrer">
            <Button className="text-lg px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-xl hover:scale-105 transition">Quero ser parceiro ou influenciadora</Button>
          </a>
          <a href="https://w.app/babydiary" target="_blank" rel="noopener noreferrer" className="text-gray-700 text-base underline hover:text-pink-700 transition">
            Entre em contato e descubra como podemos crescer juntos!
          </a>
        </div>
      </section>

      {/* Funcionalidades Futuras */}
      <section className="mb-12 py-12 bg-gradient-to-r from-yellow-50 to-pink-100">
        <h3 className="text-3xl font-bold mb-8 text-center text-yellow-700">🌟 Funcionalidades Futuras</h3>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {futureFeatures.map((f, i) => (
            <Card key={i} className="p-8 flex flex-col items-center shadow-md hover:shadow-xl transition h-full text-center">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h4 className="font-semibold text-xl mb-2 text-pink-700">{f.title}</h4>
              <p className="text-gray-700 text-base">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
} 