import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { apiFetch } from '../../config/api';

// Interface para produtos da API
interface Produto {
  id: number;
  slug: string;
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
}

// Interface para categoria
interface Categoria {
  id: string;
  name: string;
  description?: string;
}

function BreadcrumbsLoja() {
  const navigate = useNavigate();
  const { categoriaId } = useParams();
  const [categorias, setCategorias] = useState<Categoria[]>([]);

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
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2 md:mb-4">
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

const CategoriaLoja: React.FC = () => {
  const navigate = useNavigate();
  const { categoriaId } = useParams();
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');

  // Filtros
  const filtros = [
    { label: 'Todos', value: 'todos' },
    { label: 'Promoções', value: 'promocoes' },
    { label: 'Novidades', value: 'novidades' },
    { label: 'Mais vendidos', value: 'mais-vendidos' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Buscar categoria e produtos
        const [categoriasRes, produtosRes] = await Promise.all([
          apiFetch('/public/categories', { cache: 'no-store' }),
          apiFetch(`/public/shop-items?category=${categoriaId}&limit=50`, { cache: 'no-store' })
        ]);
        
        const categorias = categoriasRes.data || [];
        const categoriaAtual = categorias.find(c => c.id === categoriaId);
        setCategoria(categoriaAtual || null);
        setProdutos(produtosRes.data || []);
      } catch (err) {
        console.error('Erro ao buscar dados da categoria:', err);
        setCategoria(null);
        setProdutos([]);
      } finally {
        setLoading(false);
      }
    };

    if (categoriaId) {
      fetchData();
    }
  }, [categoriaId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price / 100);
  };

  // Filtrar produtos baseado no filtro selecionado
  const produtosFiltrados = produtos.filter(produto => {
    switch (filtro) {
      case 'promocoes':
        return produto.isPromo;
      case 'novidades':
        // Produtos criados nos últimos 30 dias
        return true; // Por enquanto, mostrar todos
      case 'mais-vendidos':
        return true; // Por enquanto, mostrar todos
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="categoria-loja min-h-screen bg-pink-50 pb-8 px-2">
        <BreadcrumbsLoja />
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!categoria) {
    return (
      <div className="categoria-loja min-h-screen bg-pink-50 pb-8 px-2">
        <BreadcrumbsLoja />
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-pink-700 mb-4">Categoria não encontrada</h1>
          <button
            onClick={() => navigate('/loja')}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-full"
          >
            Voltar para a loja
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="categoria-loja min-h-screen bg-pink-50 pb-8 px-2">
      <BreadcrumbsLoja />
      {/* Título da categoria */}
      <div className="flex items-center gap-3 mb-4 mt-4">
        <span className="text-3xl md:text-4xl">
          {categoria.description?.match(/([\p{Emoji}\u2600-\u27BF])/gu)?.[0] || '🍼'}
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-pink-700">{categoria.name}</h1>
      </div>
      
      {/* Filtros estilizados */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {filtros.map(f => (
          <button
            key={f.value}
            className={`px-4 py-2 rounded-full font-semibold border-2 transition text-sm whitespace-nowrap ${filtro === f.value ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-pink-700 border-pink-200 hover:bg-pink-100'}`}
            onClick={() => setFiltro(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>
      
      {/* Grid de produtos */}
      {produtosFiltrados.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">Nenhum produto encontrado nesta categoria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {produtosFiltrados.map((prod) => (
            <div key={prod.id} className="bg-white rounded-2xl shadow-xl p-4 flex flex-col items-center text-center border-2 border-pink-100 hover:shadow-2xl transition">
              <img 
                src={prod.mainImage || prod.imageUrl || 'https://via.placeholder.com/200x200?text=Produto'} 
                alt={prod.name} 
                className="w-28 h-28 object-cover rounded-xl mb-2 border-2 border-pink-200" 
              />
              <div className="font-bold text-base text-gray-800 mb-1">{prod.name}</div>
              <div className="text-pink-600 font-bold text-lg mb-2">
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
                className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-full font-semibold shadow-md text-sm w-full"
                onClick={() => navigate(`/loja/produto/${prod.slug}`)}
              >
                Ver mais
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriaLoja; 