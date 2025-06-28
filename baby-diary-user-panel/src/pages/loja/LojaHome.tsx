import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  Star, 
  Heart, 
  ShoppingCart, 
  TrendingUp, 
  Sparkles, 
  Gift,
  Truck,
  Shield,
  Package,
  ArrowRight,
  Clock,
  Zap,
  CheckCircle,
  X
} from 'lucide-react';
import { apiFetch } from '../../config/api';

// Estilos CSS personalizados
const styles = `
  .loja-home {
    background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
  }
  
  .hero-banner {
    position: relative;
    overflow: hidden;
    min-height: 200px;
  }
  
  .hero-banner::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    pointer-events: none;
  }
  
  .category-card {
    transition: all 0.3s ease;
    background: linear-gradient(135deg, #ffffff 0%, #fdf2f8 100%);
  }
  
  .category-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(236, 72, 153, 0.15);
  }
  
  .product-card {
    transition: all 0.3s ease;
    background: linear-gradient(135deg, #ffffff 0%, #fdf2f8 100%);
  }
  
  .product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  }
  
  .promo-badge {
    animation: promoPulse 2s infinite;
  }
  
  @keyframes promoPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  .search-bar {
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.9);
  }
  
  .floating-cart {
    animation: float 3s ease-in-out infinite;
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  .feature-icon {
    transition: all 0.3s ease;
  }
  
  .feature-icon:hover {
    transform: scale(1.1) rotate(5deg);
  }
  
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .backdrop-blur-sm {
    backdrop-filter: blur(4px);
  }
  
  .backdrop-blur-md {
    backdrop-filter: blur(12px);
  }
  
  .backdrop-blur-lg {
    backdrop-filter: blur(16px);
  }
  
  .backdrop-blur-xl {
    backdrop-filter: blur(24px);
  }
  
  .backdrop-blur-2xl {
    backdrop-filter: blur(40px);
  }
  
  .backdrop-blur-3xl {
    backdrop-filter: blur(64px);
  }
  
  @media (max-width: 768px) {
    .product-card {
      margin-bottom: 1rem;
    }
    
    .category-card {
      margin-bottom: 1rem;
    }
  }
  
  @media (min-width: 768px) {
    .hero-banner {
      min-height: 300px;
    }
  }
  
  @media (min-width: 1024px) {
    .hero-banner {
      min-height: 350px;
    }
  }
  
  /* Scrollbar personalizada */
  .overflow-x-auto::-webkit-scrollbar {
    height: 6px;
  }
  
  .overflow-x-auto::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  .overflow-x-auto::-webkit-scrollbar-thumb {
    background: #ec4899;
    border-radius: 3px;
  }
  
  .overflow-x-auto::-webkit-scrollbar-thumb:hover {
    background: #db2777;
  }
  
  /* Animações de entrada */
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fade-in-up {
    animation: fadeInUp 0.6s ease-out;
  }
  
  /* Efeito de shimmer para loading */
  @keyframes shimmer {
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: calc(200px + 100%) 0;
    }
  }
  
  .shimmer {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200px 100%;
    animation: shimmer 1.5s infinite;
  }
`;

const banners = [
  {
    id: 1,
    title: 'Produtos Essenciais para Bebês',
    subtitle: 'Tudo que você precisa para o seu pequeno',
    description: 'Encontre produtos de qualidade selecionados especialmente para o desenvolvimento saudável do seu bebê.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    bg: 'from-pink-400 to-purple-500',
    cta: 'Ver produtos',
    badge: '🔥 Mais vendidos'
  },
  {
    id: 2,
    title: 'Ofertas Especiais da Semana',
    subtitle: 'Descontos imperdíveis',
    description: 'Aproveite nossas ofertas especiais com até 50% de desconto em produtos selecionados.',
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80',
    bg: 'from-orange-400 to-pink-500',
    cta: 'Ver ofertas',
    badge: '⚡ Oferta limitada'
  },
  {
    id: 3,
    title: 'Produtos Recomendados por Especialistas',
    subtitle: 'Selecionados com carinho',
    description: 'Produtos aprovados por pediatras e especialistas em desenvolvimento infantil.',
    image: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=800&q=80',
    bg: 'from-blue-400 to-purple-500',
    cta: 'Descobrir',
    badge: '👨‍⚕️ Aprovado por especialistas'
  }
];

// Interface para produtos da API
interface Produto {
  id: string;
  name: string;
  description?: string;
  price: number;
  promoPrice?: number;
  isPromo?: boolean;
  imageUrl?: string;
  mainImage?: string;
  categoryObj?: {
    id: string;
    name: string;
    description?: string;
  };
  stock?: number;
  rating?: number;
  reviews?: number;
}

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  imageUrl: string;
  bgGradient?: string;
  ctaText: string;
  ctaLink: string;
  badge?: string;
  isActive: boolean;
  sortOrder: number;
  startDate?: string;
  endDate?: string;
  targetUrl?: string;
  targetType?: string;
  targetId?: string;
}

function BreadcrumbsLoja() {
  const navigate = useNavigate();
  const location = useLocation();
  const { categoriaId, produtoId } = useParams();
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    apiFetch('/public/categories', { cache: 'no-store' })
      .then(data => setCategorias(data.data || []))
      .catch(err => {
        console.error('Erro ao buscar categorias:', err);
        setCategorias([]);
      });
  }, []);

  const crumbs = [
    { label: 'Home', path: '/' },
    { label: 'Loja', path: '/loja' },
  ];
  if (categoriaId) {
    const cat = categorias.find(c => c.id === categoriaId);
    crumbs.push({ label: cat ? cat.name : categoriaId, path: `/loja/categoria/${categoriaId}` });
  }
  if (produtoId) {
    crumbs.push({ label: `Produto ${produtoId}`, path: `/loja/produto/${produtoId}` });
  }
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
      {crumbs.map((crumb, idx) => (
        <span key={crumb.path} className="flex items-center">
          {idx > 0 && <span className="mx-1">/</span>}
          {idx < crumbs.length - 1 ? (
            <button onClick={() => navigate(crumb.path)} className="hover:underline text-pink-600">{crumb.label}</button>
          ) : (
            <span className="font-semibold text-gray-700">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

// Componente de notificação toast
const Toast: React.FC<{ message: string; isVisible: boolean; onClose: () => void }> = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in-up">
      <div className="bg-green-500 text-white px-6 py-4 rounded-2xl shadow-lg flex items-center gap-3 max-w-sm">
        <CheckCircle className="w-5 h-5 flex-shrink-0" />
        <span className="flex-1">{message}</span>
        <button onClick={onClose} className="flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Função utilitária para pegar a imagem principal do produto
const getProductImage = (produto) => {
  if (produto.mainImage) return produto.mainImage;
  if (produto.gallery && produto.gallery.length > 0) return produto.gallery[0];
  if (produto.imageUrl) return produto.imageUrl;
  return 'https://via.placeholder.com/300x300?text=Produto';
};

const LojaHome: React.FC = () => {
  const navigate = useNavigate();
  const [bannerIdx, setBannerIdx] = useState(0);
  const [categorias, setCategorias] = useState([]);
  const [produtosDestaque, setProdutosDestaque] = useState<Produto[]>([]);
  const [produtosPromocao, setProdutosPromocao] = useState<Produto[]>([]);
  const [produtosNovos, setProdutosNovos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);

  // Atualizar contador do carrinho
  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((total: number, item: any) => total + item.quantity, 0);
    setCartItemCount(count);
  };

  useEffect(() => {
    updateCartCount();
    // Escutar mudanças no localStorage
    const handleStorageChange = () => updateCartCount();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Buscar dados da loja
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Buscar banners ativos
        const bannersResponse = await apiFetch('/public/banners');
        if (bannersResponse.success) {
          console.log('🎯 Banners carregados:', bannersResponse.data);
          setBanners(bannersResponse.data);
          // Resetar para o primeiro banner quando novos banners são carregados
          setBannerIdx(0);
        } else {
          console.error('❌ Erro ao carregar banners:', bannersResponse);
        }
        
        // Buscar categorias
        const categoriasResponse = await apiFetch('/public/shop-categories');
        if (categoriasResponse.success) {
          setCategorias(categoriasResponse.data);
        }
        
        // Buscar produtos em destaque
        const destaqueResponse = await apiFetch('/public/shop-items?isPromo=true&limit=8');
        if (destaqueResponse.success) {
          setProdutosDestaque(destaqueResponse.data);
        }
        
        // Buscar produtos em promoção
        const promocaoResponse = await apiFetch('/public/shop-items?isPromo=true&limit=6');
        if (promocaoResponse.success) {
          setProdutosPromocao(promocaoResponse.data);
        }
        
        // Buscar produtos novos
        const novosResponse = await apiFetch('/public/shop-items?sort=createdAt&order=desc&limit=6');
        if (novosResponse.success) {
          setProdutosNovos(novosResponse.data);
        }
        
      } catch (error) {
        console.error('Erro ao carregar dados da loja:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Resetar bannerIdx quando banners mudam
  useEffect(() => {
    if (banners.length > 0) {
      setBannerIdx(0);
    }
  }, [banners.length]);

  // Log quando o banner muda
  useEffect(() => {
    if (banners.length > 0 && banners[bannerIdx]) {
      console.log('🎨 Banner atual:', {
        index: bannerIdx,
        title: banners[bannerIdx]?.title,
        bgGradient: banners[bannerIdx]?.bgGradient,
        className: `hero-banner relative overflow-hidden rounded-2xl mb-8 transition-all duration-500 max-w-4xl mx-auto ${banners[bannerIdx]?.bgGradient || 'bg-gradient-to-r from-pink-400 to-purple-500'}`
      });
    }
  }, [bannerIdx, banners]);

  // Auto-rotate banner
  useEffect(() => {
    console.log('🔄 Auto-rotate effect - banners.length:', banners.length, 'bannerIdx:', bannerIdx);
    if (banners.length <= 1) return; // Não fazer auto-rotate se só tem 1 banner
    
    const interval = setInterval(() => {
      console.log('⏰ Auto-rotate: mudando banner de', bannerIdx, 'para', (bannerIdx + 1) % banners.length);
      setBannerIdx((prev) => (prev + 1) % banners.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [banners.length, bannerIdx]); // Adicionar bannerIdx como dependência

  const nextBanner = () => {
    console.log('➡️ Next banner - atual:', bannerIdx, 'total:', banners.length);
    if (banners.length <= 1) return;
    setBannerIdx((prev) => (prev + 1) % banners.length);
  };
  
  const prevBanner = () => {
    console.log('⬅️ Prev banner - atual:', bannerIdx, 'total:', banners.length);
    if (banners.length <= 1) return;
    setBannerIdx((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToBanner = (index: number) => {
    console.log('🎯 Go to banner:', index, 'total:', banners.length);
    if (index >= 0 && index < banners.length) {
      setBannerIdx(index);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price / 100);
  };

  const getDiscountPercentage = (originalPrice: number, promoPrice: number) => {
    return Math.round(((originalPrice - promoPrice) / originalPrice) * 100);
  };

  const addToCart = (produto: Produto) => {
    const cartItem = {
      id: produto.id,
      name: produto.name,
      price: produto.isPromo && produto.promoPrice ? produto.promoPrice : produto.price,
      quantity: 1,
      image: produto.mainImage || produto.imageUrl
    };
    
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItemIndex = existingCart.findIndex((item: any) => item.id === cartItem.id);
    
    if (existingItemIndex >= 0) {
      existingCart[existingItemIndex].quantity += 1;
    } else {
      existingCart.push(cartItem);
    }
    
    localStorage.setItem('cart', JSON.stringify(existingCart));
    updateCartCount(); // Atualizar contador
    setToastMessage('Produto adicionado ao carrinho!');
    setToastVisible(true);
  };

  const filteredProducts = produtosDestaque.filter(produto => {
    const matchesSearch = produto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || produto.categoryObj?.id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="loja-home min-h-screen pb-8">
      <style>{styles}</style>
      
      {/* Header com busca */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <BreadcrumbsLoja />
          
          {/* Barra de busca */}
          <div className="search-bar rounded-2xl p-4 mb-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-pink-100 focus:border-pink-300 focus:outline-none transition"
                />
              </div>
              <button className="px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtros
              </button>
            </div>
            
            {/* Filtro por categoria */}
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  selectedCategory === 'all' 
                    ? 'bg-pink-500 text-white' 
                    : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                }`}
              >
                Todos
              </button>
              {categorias.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                    selectedCategory === cat.id 
                      ? 'bg-pink-500 text-white' 
                      : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Hero Banner */}
        {banners.length > 0 && banners[bannerIdx] && (
          <section 
            className={`hero-banner relative overflow-hidden rounded-2xl mb-8 transition-all duration-500 max-w-6xl mx-auto ${
              banners[bannerIdx]?.bgGradient || 'bg-gradient-to-r from-pink-400 to-purple-500'
            }`}
          >
            <div className="relative z-10 px-6 py-8 md:px-12 md:py-12 lg:px-16 lg:py-16">
              <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="text-white">
                    {banners[bannerIdx]?.badge && (
                      <div className="inline-block bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-4">
                        {banners[bannerIdx].badge}
                      </div>
                    )}
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                      {banners[bannerIdx]?.title || 'Bem-vindo à Loja'}
                    </h1>
                    {banners[bannerIdx]?.subtitle && (
                      <p className="text-lg md:text-xl mb-4 opacity-90">
                        {banners[bannerIdx].subtitle}
                      </p>
                    )}
                    <p className="text-base mb-6 opacity-80 max-w-lg">
                      {banners[bannerIdx]?.description || 'Descubra produtos incríveis para o seu bebê'}
                    </p>
                    <button 
                      onClick={() => navigate(banners[bannerIdx]?.ctaLink || '/loja')}
                      className="bg-white text-pink-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-lg"
                    >
                      {banners[bannerIdx]?.ctaText || 'Ver produtos'}
                    </button>
                  </div>
                  <div className="hidden md:block">
                    <img 
                      src={banners[bannerIdx]?.imageUrl || 'https://via.placeholder.com/400x300?text=Banner'} 
                      alt={banners[bannerIdx]?.title || 'Banner'}
                      className="w-full h-48 object-cover rounded-lg shadow-2xl"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Navegação do banner */}
            {banners.length > 1 && (
              <>
                <button 
                  onClick={prevBanner}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full transition-all z-20"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button 
                  onClick={nextBanner}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full transition-all z-20"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
                
                {/* Indicadores */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToBanner(idx)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        idx === bannerIdx ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="feature-icon bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="w-8 h-8 text-pink-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Entrega Grátis</h3>
            <p className="text-gray-600">Em pedidos acima de R$ 50</p>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="feature-icon bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Garantia de 30 dias</h3>
            <p className="text-gray-600">Devolução gratuita</p>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="feature-icon bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Produtos Originais</h3>
            <p className="text-gray-600">100% autênticos</p>
          </div>
        </div>

        {/* Categorias */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Categorias</h2>
            <button 
              onClick={() => navigate('/loja')}
              className="text-pink-600 hover:text-pink-700 font-medium flex items-center gap-2"
            >
              Ver todas <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categorias.map((cat) => (
                <div
                  key={cat.id}
                  className="category-card rounded-2xl p-6 flex flex-col items-center cursor-pointer border-2 border-transparent hover:border-pink-200"
                  onClick={() => navigate(`/loja/categoria/${cat.id}`)}
                >
                  <div className="text-4xl mb-3">
                    {cat.description?.match(/([\p{Emoji}\u2600-\u27BF])/gu)?.[0] || '🍼'}
                  </div>
                  <div className="text-gray-900 font-semibold text-center text-sm">{cat.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Produtos em Promoção */}
        {produtosPromocao.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-full">
                  <Zap className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Ofertas Especiais</h2>
              </div>
              <button 
                onClick={() => navigate('/loja?filter=promo')}
                className="text-pink-600 hover:text-pink-700 font-medium flex items-center gap-2"
              >
                Ver todas <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {produtosPromocao.map((prod) => (
                <div key={prod.id} className="product-card rounded-2xl p-6 relative group">
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold promo-badge">
                    -{getDiscountPercentage(prod.price, prod.promoPrice || 0)}%
                  </div>
                  <button className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition">
                    <Heart className="w-5 h-5 text-gray-600" />
                  </button>
                  <img 
                    src={getProductImage(prod)} 
                    alt={prod.name} 
                    className="w-full h-48 object-cover rounded-xl mb-4 group-hover:scale-105 transition" 
                  />
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{prod.name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">(4.8)</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-pink-600 font-bold text-xl">
                      {prod.isPromo && prod.promoPrice ? (
                        <div>
                          <span className="line-through text-gray-400 text-sm">{formatPrice(prod.price)}</span>
                          <br />
                          <span className="text-red-600">{formatPrice(prod.promoPrice)}</span>
                        </div>
                      ) : (
                        formatPrice(prod.price)
                      )}
                    </div>
                    <button
                      onClick={() => addToCart(prod)}
                      className="p-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition"
                    onClick={() => navigate(`/loja/produto/${prod.id}`)}
                  >
                    Ver detalhes
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Produtos em Destaque */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-pink-100 p-2 rounded-full">
                <TrendingUp className="w-6 h-6 text-pink-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Destaques</h2>
            </div>
            <button 
              onClick={() => navigate('/loja')}
              className="text-pink-600 hover:text-pink-700 font-medium flex items-center gap-2"
            >
              Ver todos <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.slice(0, 8).map((prod) => (
                <div key={prod.id} className="product-card rounded-2xl p-6 relative group">
                  <button className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition">
                    <Heart className="w-5 h-5 text-gray-600" />
                  </button>
                  <img 
                    src={getProductImage(prod)} 
                    alt={prod.name} 
                    className="w-full h-48 object-cover rounded-xl mb-4 group-hover:scale-105 transition" 
                  />
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{prod.name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">(4.8)</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-pink-600 font-bold text-xl">
                      {prod.isPromo && prod.promoPrice ? (
                        <div>
                          <span className="line-through text-gray-400 text-sm">{formatPrice(prod.price)}</span>
                          <br />
                          <span className="text-red-600">{formatPrice(prod.promoPrice)}</span>
                        </div>
                      ) : (
                        formatPrice(prod.price)
                      )}
                    </div>
                    <button
                      onClick={() => addToCart(prod)}
                      className="p-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition"
                    onClick={() => navigate(`/loja/produto/${prod.id}`)}
                  >
                    Ver detalhes
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Produtos Novos */}
        {produtosNovos.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Sparkles className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Novidades</h2>
              </div>
              <button 
                onClick={() => navigate('/loja?sort=newest')}
                className="text-pink-600 hover:text-pink-700 font-medium flex items-center gap-2"
              >
                Ver todas <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {produtosNovos.slice(0, 6).map((prod) => (
                <div key={prod.id} className="product-card rounded-2xl p-6 relative group">
                  <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    Novo
                  </div>
                  <button className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition">
                    <Heart className="w-5 h-5 text-gray-600" />
                  </button>
                  <img 
                    src={getProductImage(prod)} 
                    alt={prod.name} 
                    className="w-full h-48 object-cover rounded-xl mb-4 group-hover:scale-105 transition" 
                  />
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{prod.name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">(4.8)</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-pink-600 font-bold text-xl">
                      {prod.isPromo && prod.promoPrice ? (
                        <div>
                          <span className="line-through text-gray-400 text-sm">{formatPrice(prod.price)}</span>
                          <br />
                          <span className="text-red-600">{formatPrice(prod.promoPrice)}</span>
                        </div>
                      ) : (
                        formatPrice(prod.price)
                      )}
                    </div>
                    <button
                      onClick={() => addToCart(prod)}
                      className="p-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition"
                    onClick={() => navigate(`/loja/produto/${prod.id}`)}
                  >
                    Ver detalhes
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Final */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-3xl p-8 md:p-12 text-center text-white">
          <Gift className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Não encontrou o que procura?</h2>
          <p className="text-xl mb-8 opacity-90">Nossa equipe está sempre pronta para ajudar você a encontrar os melhores produtos para o seu bebê.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/loja')}
              className="bg-white text-pink-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition"
            >
              Explorar todos os produtos
            </button>
            <button
              onClick={() => navigate('/loja/carrinho')}
              className="border-2 border-white text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-pink-600 transition"
            >
              Ver carrinho
            </button>
          </div>
        </div>
      </div>

      {/* Carrinho flutuante */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => navigate('/loja/carrinho')}
          className="floating-cart bg-pink-500 text-white p-4 rounded-full shadow-lg hover:bg-pink-600 transition relative"
        >
          <ShoppingCart className="w-6 h-6" />
          {cartItemCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
              {cartItemCount > 99 ? '99+' : cartItemCount}
            </div>
          )}
        </button>
      </div>

      {/* Toast Notification */}
      {toastVisible && (
        <Toast message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
      )}
    </div>
  );
};

export default LojaHome; 