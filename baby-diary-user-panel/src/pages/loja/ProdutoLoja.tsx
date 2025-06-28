import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../../config/api';
import { ChevronLeft, ChevronRight, Heart, Share2, Star, ShoppingCart, Package, Truck, Shield, ArrowLeft, X, ZoomIn } from 'lucide-react';

// Estilos CSS personalizados
const styles = `
  .produto-loja {
    background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
  }
  
  .produto-loja .image-gallery {
    transition: all 0.3s ease;
  }
  
  .produto-loja .image-gallery:hover {
    transform: scale(1.02);
  }
  
  .produto-loja .price-animation {
    animation: pricePulse 2s infinite;
  }
  
  @keyframes pricePulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  .produto-loja .favorite-button {
    transition: all 0.3s ease;
  }
  
  .produto-loja .favorite-button:hover {
    transform: scale(1.1);
  }
  
  .produto-loja .share-button {
    transition: all 0.3s ease;
  }
  
  .produto-loja .share-button:hover {
    transform: scale(1.1);
  }
  
  .produto-loja .quantity-button {
    transition: all 0.2s ease;
  }
  
  .produto-loja .quantity-button:hover {
    transform: scale(1.1);
  }
  
  .produto-loja .add-to-cart-button {
    background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
    transition: all 0.3s ease;
  }
  
  .produto-loja .add-to-cart-button:hover {
    background: linear-gradient(135deg, #db2777 0%, #be185d 100%);
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(236, 72, 153, 0.3);
  }
  
  .produto-loja .discount-badge {
    animation: discountShine 2s infinite;
  }
  
  @keyframes discountShine {
    0%, 100% { box-shadow: 0 0 5px rgba(239, 68, 68, 0.5); }
    50% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.8); }
  }
  
  .produto-loja .related-product {
    transition: all 0.3s ease;
  }
  
  .produto-loja .related-product:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  }
  
  .produto-loja .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

// Interface para produto da API
interface Produto {
  id: string;
  name: string;
  description?: string;
  price: number;
  promoPrice?: number;
  isPromo?: boolean;
  imageUrl?: string;
  mainImage?: string;
  gallery?: string[];
  categoryObj?: {
    id: string;
    name: string;
    description?: string;
  };
  tags?: Array<{
    tag: {
      id: string;
      name: string;
    };
  }>;
  stock?: number;
  type?: string;
  sku?: string;
  variations?: Array<{
    type: string;
    required: boolean;
    options: string[];
  }>;
}

function BreadcrumbsLoja() {
  const navigate = useNavigate();
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
    <nav className="text-sm text-gray-500 mb-4 flex gap-1 items-center">
      {crumbs.map((crumb, i) => (
        <span key={crumb.path} className="flex items-center">
          <button
            className="hover:underline text-pink-600 disabled:text-gray-400"
            onClick={() => navigate(crumb.path)}
            disabled={i === crumbs.length - 1}
          >
            {crumb.label}
          </button>
          {i < crumbs.length - 1 && <span className="mx-1">/</span>}
        </span>
      ))}
    </nav>
  );
}

// Função utilitária para pegar a imagem principal do produto
const getProductImage = (produto: Produto | null) => {
  if (!produto) return 'https://via.placeholder.com/300x300?text=Produto';
  if (produto.mainImage) return produto.mainImage;
  if (produto.gallery && produto.gallery.length > 0) return produto.gallery[0];
  if (produto.imageUrl) return produto.imageUrl;
  return 'https://via.placeholder.com/300x300?text=Produto';
};

const ProdutoLoja: React.FC = () => {
  const navigate = useNavigate();
  const { produtoId } = useParams();
  const [produto, setProduto] = useState<Produto | null>(null);
  const [produtosRelacionados, setProdutosRelacionados] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
  const [variationError, setVariationError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduto = async () => {
      if (!produtoId) return;
      
      try {
        setLoading(true);
        const [produtoRes, relacionadosRes] = await Promise.all([
          apiFetch(`/public/shop-items/${produtoId}`, { cache: 'no-store' }),
          apiFetch('/public/shop-items?limit=6', { cache: 'no-store' })
        ]);
        
        setProduto(produtoRes.data);
        setProdutosRelacionados(relacionadosRes.data || []);
        setCurrentImageIndex(0);
      } catch (err) {
        console.error('Erro ao buscar produto:', err);
        setProduto(null);
        setProdutosRelacionados([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProduto();
  }, [produtoId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price / 100);
  };

  const getImages = () => {
    if (!produto) return [];
    const images = [];
    if (produto.mainImage || produto.imageUrl) {
      images.push(produto.mainImage || produto.imageUrl);
    }
    if (produto.gallery && produto.gallery.length > 0) {
      images.push(...produto.gallery);
    }
    return images.length > 0 ? images : ['https://via.placeholder.com/400x400?text=Produto'];
  };

  const nextImage = () => {
    const images = getImages();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    const images = getImages();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getFinalPrice = () => {
    if (!produto) return 0;
    let base = produto.isPromo && produto.promoPrice ? produto.promoPrice : produto.price;
    let fixedPrice = null;
    if (produto.variations && produto.variations.length > 0) {
      for (const v of produto.variations) {
        const options = v.options.map((o: any) => typeof o === 'string' ? { label: o } : o);
        const opt = options.find((o: any) => o.label === selectedVariations[v.type]);
        if (opt && (opt.isFixedPrice === true || opt.isFixedPrice === 'true') && typeof opt.price === 'number') {
          fixedPrice = opt.price;
        } else if (opt && typeof opt.price === 'number') {
          base += opt.price;
        }
      }
    }
    return fixedPrice !== null ? fixedPrice : base;
  };

  const addToCart = () => {
    if (!produto) return;
    
    if (produto.variations && produto.variations.length > 0) {
      // Checar se todas as variações obrigatórias foram selecionadas
      for (const v of produto.variations) {
        if (v.required && !selectedVariations[v.type]) {
          setVariationError(`Selecione uma opção para "${v.type}"`);
          return;
        }
      }
      setVariationError(null);
    }

    const cartItem = {
      id: produto.id,
      name: produto.name,
      price: getFinalPrice(),
      quantity,
      image: produto.mainImage || produto.imageUrl,
      variations: selectedVariations
    };
    
    // Salvar no localStorage
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItemIndex = existingCart.findIndex((item: any) => item.id === cartItem.id);
    
    if (existingItemIndex >= 0) {
      // Se o produto já existe, apenas aumenta a quantidade
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      // Se é um produto novo, adiciona ao carrinho
      existingCart.push(cartItem);
    }
    
    localStorage.setItem('cart', JSON.stringify(existingCart));
    
    // Mostrar feedback melhorado
    const message = existingItemIndex >= 0 
      ? `Quantidade atualizada! Total: ${existingCart[existingItemIndex].quantity}`
      : 'Produto adicionado ao carrinho!';
    
    // Criar toast personalizado
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Animar entrada
    setTimeout(() => {
      toast.classList.remove('translate-x-full');
    }, 100);
    
    // Remover após 3 segundos
    setTimeout(() => {
      toast.classList.add('translate-x-full');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  };

  const shareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: produto?.name,
        text: produto?.description,
        url: window.location.href,
      });
    } else {
      setShowShareModal(true);
    }
  };

  const openImageModal = () => {
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  const nextImageModal = () => {
    const images = getImages();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImageModal = () => {
    const images = getImages();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showImageModal) {
        closeImageModal();
      }
    };

    if (showImageModal) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showImageModal]);

  // Função para renderizar selects de variações
  const renderVariations = () => {
    if (!produto || !produto.variations || produto.variations.length === 0) return null;
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Variações</label>
        {produto.variations.map((variation: any, idx: number) => (
          <div key={idx} className="flex flex-col gap-1 mb-2">
            <span className="font-medium text-gray-600">{variation.type}{variation.required ? ' *' : ''}</span>
            <select
              className="border rounded px-3 py-2 focus:outline-pink-500"
              value={selectedVariations[variation.type] || ''}
              onChange={e => setSelectedVariations(v => ({ ...v, [variation.type]: e.target.value }))}
            >
              <option value="">Selecione...</option>
              {variation.options.map((opt: any, i: number) => (
                <option key={i} value={opt.label}>
                  {opt.label}{opt.price ? ` (+R$${(opt.price/100).toFixed(2)})` : ''}
                </option>
              ))}
            </select>
          </div>
        ))}
        {variationError && <div className="text-red-500 text-xs mt-1">{variationError}</div>}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="produto-loja min-h-screen bg-pink-50 pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          <BreadcrumbsLoja />
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="produto-loja min-h-screen bg-pink-50 pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          <BreadcrumbsLoja />
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-pink-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-pink-700 mb-4">Produto não encontrado</h1>
            <button
              onClick={() => navigate('/loja')}
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-full transition"
            >
              Voltar para a loja
            </button>
          </div>
        </div>
      </div>
    );
  }

  const images = getImages();
  const currentImage = images[currentImageIndex];
  const discountPercentage = produto.isPromo && produto.promoPrice 
    ? Math.round(((produto.price - produto.promoPrice) / produto.price) * 100) 
    : 0;

  return (
    <div className="produto-loja min-h-screen bg-pink-50 pb-24 px-4">
      <style>{styles}</style>
      <div className="max-w-6xl mx-auto">
        <BreadcrumbsLoja />
        
        {/* Botão voltar */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-pink-600 hover:text-pink-700 mb-4 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Galeria de Imagens */}
          <div className="space-y-4">
            {/* Imagem Principal */}
            <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden image-gallery">
              <div className="relative cursor-pointer" onClick={openImageModal}>
                <img 
                  src={currentImage} 
                  alt={produto?.name} 
                  className="w-full h-96 object-cover rounded-xl shadow-2xl transition-transform hover:scale-105" 
                />
                {/* Overlay com ícone de zoom */}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                  <ZoomIn className="w-8 h-8 text-white opacity-0 hover:opacity-100 transition-opacity" />
                </div>
              </div>
              
              {/* Controles da galeria */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition"
                  >
                    <ChevronLeft className="w-6 h-6 text-pink-600" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition"
                  >
                    <ChevronRight className="w-6 h-6 text-pink-600" />
                  </button>
                  
                  {/* Indicadores */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full transition ${
                          index === currentImageIndex ? 'bg-pink-500' : 'bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Badge de desconto */}
              {produto.isPromo && discountPercentage > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm discount-badge">
                  -{discountPercentage}%
                </div>
              )}

              {/* Botões de ação */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`p-2 rounded-full shadow-lg transition favorite-button ${
                    isFavorite ? 'bg-red-500 text-white' : 'bg-white/80 hover:bg-white text-gray-600'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={shareProduct}
                  className="p-2 rounded-full shadow-lg transition share-button bg-white/80 hover:bg-white text-gray-600"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Miniaturas */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                      index === currentImageIndex ? 'border-pink-500' : 'border-gray-200'
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={`${produto?.name} - Imagem ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informações do Produto */}
          <div className="space-y-6">
            {/* Categoria */}
            {produto.categoryObj && (
              <div className="inline-block bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm font-medium">
                {produto.categoryObj.name}
              </div>
            )}

            {/* Nome */}
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              {produto.name}
            </h1>

            {/* SKU */}
            {produto.sku && (
              <div className="text-sm text-gray-500 font-mono mb-2">Código: {produto.sku}</div>
            )}

            {/* Avaliações */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-gray-600">(4.8 • 127 avaliações)</span>
            </div>

            {/* Preço */}
            <div className="space-y-2">
              {produto.isPromo && produto.promoPrice ? (
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-red-600 price-animation">
                    {formatPrice(getFinalPrice())}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl text-gray-400 line-through">
                      {formatPrice(produto.price)}
                    </span>
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-sm font-bold">
                      -{discountPercentage}%
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-3xl font-bold text-pink-600">
                  {formatPrice(getFinalPrice())}
                </div>
              )}
            </div>

            {/* Estoque */}
            {produto.stock !== undefined && (
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${
                  produto.stock > 10 ? 'bg-green-500' : 
                  produto.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="text-gray-600">
                  {produto.stock > 10 ? 'Em estoque' : 
                   produto.stock > 0 ? `Apenas ${produto.stock} unidades` : 'Fora de estoque'}
                </span>
              </div>
            )}

            {/* Quantidade */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Quantidade</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full border-2 border-pink-200 hover:border-pink-300 flex items-center justify-center transition quantity-button"
                >
                  -
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full border-2 border-pink-200 hover:border-pink-300 flex items-center justify-center transition quantity-button"
                >
                  +
                </button>
              </div>
            </div>

            {/* Variações */}
            {renderVariations()}

            {/* Botões de ação */}
            <div className="space-y-3">
              <button
                onClick={addToCart}
                disabled={produto.stock === 0}
                className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 add-to-cart-button"
              >
                <ShoppingCart className="w-5 h-5" />
                {produto.stock === 0 ? 'Fora de estoque' : 'Adicionar ao carrinho'}
              </button>
              
              <button
                onClick={() => navigate('/loja/carrinho')}
                className="w-full bg-white border-2 border-pink-500 text-pink-500 hover:bg-pink-50 font-bold py-4 rounded-2xl transition"
              >
                Ver carrinho
              </button>
            </div>

            {/* Benefícios */}
            <div className="bg-white rounded-2xl p-6 space-y-4">
              <h3 className="font-semibold text-gray-900">Benefícios</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">Entrega grátis em pedidos acima de R$ 50</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-gray-600">Garantia de 30 dias</span>
                </div>
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-purple-500" />
                  <span className="text-sm text-gray-600">Produto original</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Descrição */}
        {produto.description && (
          <div className="bg-white rounded-3xl shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Descrição</h2>
            <p className="text-gray-700 leading-relaxed">{produto.description}</p>
          </div>
        )}

        {/* Tags */}
        {produto.tags && produto.tags.length > 0 && (
          <div className="bg-white rounded-3xl shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tags</h2>
            <div className="flex flex-wrap gap-3">
              {produto.tags.map((tagItem) => (
                <span
                  key={tagItem.tag.id}
                  className="bg-pink-100 text-pink-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-pink-200 transition cursor-pointer"
                >
                  {tagItem.tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Produtos relacionados */}
        {produtosRelacionados.length > 0 && (
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Você também pode gostar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {produtosRelacionados
                .filter(p => p.id !== produto.id)
                .slice(0, 6)
                .map((prod) => (
                  <div key={prod.id} className="bg-pink-50 rounded-2xl p-4 hover:shadow-lg transition cursor-pointer border-2 border-transparent hover:border-pink-200 related-product">
                    <img 
                      src={getProductImage(prod)} 
                      alt={prod.name} 
                      className="w-full h-48 object-cover rounded-xl mb-4" 
                    />
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{prod.name}</h3>
                    <div className="text-pink-600 font-bold text-lg mb-3">
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
                      className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-xl font-semibold transition"
                      onClick={() => navigate(`/loja/produto/${prod.id}`)}
                    >
                      Ver produto
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de compartilhamento */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Compartilhar produto</h3>
            <div className="space-y-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copiado!');
                  setShowShareModal(false);
                }}
                className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold"
              >
                Copiar link
              </button>
              <button
                onClick={() => {
                  window.open(`https://wa.me/?text=${encodeURIComponent(`Confira este produto: ${produto.name} - ${window.location.href}`)}`);
                  setShowShareModal(false);
                }}
                className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold"
              >
                Compartilhar no WhatsApp
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Imagem */}
      {showImageModal && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeImageModal}
        >
          <div 
            className="relative max-w-4xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botão fechar */}
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Imagem */}
            <img 
              src={currentImage} 
              alt={produto?.name} 
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />

            {/* Controles de navegação */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImageModal}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={nextImageModal}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>

                {/* Indicadores */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-4 h-4 rounded-full transition ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/40'
                      }`}
                    />
                  ))}
                </div>

                {/* Contador */}
                <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProdutoLoja; 