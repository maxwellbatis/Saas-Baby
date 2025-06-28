import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  BarChart3,
  Eye,
  Edit,
  Trash2,
  Package,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import ProdutoList from './ProdutoList';
import ProdutoFormModal from './ProdutoFormModal';
import { adminApi } from '../../../lib/adminApi';
import CategoriaLoja from './CategoriaLoja';
import { Categoria } from './CategoriaLoja';
import { Tag } from './TagLoja';
import { useToast } from '../../../hooks/use-toast';

// Tipo base do produto (expandido para incluir gallery)
export interface Produto {
  id: string;
  name: string;
  description?: string;
  price: number;
  isActive: boolean;
  isPromo?: boolean;
  mainImage?: string;
  categoryObj?: { id: string; name: string };
  tags?: { tag: { id: string; name: string } }[];
  stock?: number;
  gallery?: string[];
  type?: string;
  sku?: string;
}

const AdminProdutos: React.FC = () => {
  const { toast } = useToast();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('all');
  const [tagFiltro, setTagFiltro] = useState('all');
  const [statusFiltro, setStatusFiltro] = useState('all');
  const [precoFiltro, setPrecoFiltro] = useState('all');
  const [tipoFiltro, setTipoFiltro] = useState('all');
  const [todasCategorias, setTodasCategorias] = useState<Categoria[]>([]);
  const [todasTags, setTodasTags] = useState<Tag[]>([]);

  // Buscar produtos da API
  const fetchProdutos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.get('/admin/shop-items');
      const produtosData = Array.isArray(res.data?.data) ? res.data.data : [];
      setProdutos(produtosData);
    } catch (err: any) {
      setError('Erro ao buscar produtos.');
      toast({
        title: 'Erro',
        description: 'Erro ao carregar produtos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  // Buscar categorias e tags para os selects
  useEffect(() => {
    adminApi.get('/admin/categories').then(res => setTodasCategorias(Array.isArray(res.data?.data) ? res.data.data : []));
    adminApi.get('/admin/tags').then(res => setTodasTags(Array.isArray(res.data?.data) ? res.data.data : []));
  }, []);

  const handleNovoProduto = () => {
    setEditingProduto(null);
    setShowModal(true);
  };

  const handleEditarProduto = (produto: Produto) => {
    setEditingProduto(produto);
    setShowModal(true);
  };

  const handleSalvarProduto = async (produto: Produto) => {
    setLoading(true);
    setError(null);
    try {
      if (produto.id) {
        // Editar
        await adminApi.put(`/admin/shop-items/${produto.id}`, produto);
        toast({
          title: 'Sucesso',
          description: 'Produto atualizado com sucesso'
        });
      } else {
        // Criar
        await adminApi.post('/admin/shop-items', produto);
        toast({
          title: 'Sucesso',
          description: 'Produto criado com sucesso'
        });
      }
      setShowModal(false);
      fetchProdutos();
    } catch (err: any) {
      setError('Erro ao salvar produto.');
      toast({
        title: 'Erro',
        description: 'Erro ao salvar produto',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletarProduto = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este produto?')) return;
    setLoading(true);
    setError(null);
    try {
      await adminApi.delete(`/admin/shop-items/${id}`);
      toast({
        title: 'Sucesso',
        description: 'Produto excluído com sucesso'
      });
      fetchProdutos();
    } catch (err: any) {
      setError('Erro ao deletar produto.');
      toast({
        title: 'Erro',
        description: 'Erro ao excluir produto',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtro dos produtos
  const produtosFiltrados = produtos.filter(produto => {
    const nomeOk = produto.name.toLowerCase().includes(busca.toLowerCase());
    const skuOk = !busca || !produto.sku || produto.sku.toLowerCase().includes(busca.toLowerCase());
    const categoriaOk = !categoriaFiltro || categoriaFiltro === 'all' || produto.categoryObj?.id === categoriaFiltro;
    const tagOk = !tagFiltro || tagFiltro === 'all' || (produto.tags && produto.tags.some(t => t.tag.id === tagFiltro));
    const statusOk = !statusFiltro || statusFiltro === 'all' ||
      (statusFiltro === 'ativo' && produto.isActive) ||
      (statusFiltro === 'inativo' && !produto.isActive) ||
      (statusFiltro === 'promocao' && produto.isPromo);
    
    const precoOk = !precoFiltro || precoFiltro === 'all' ||
      (precoFiltro === 'baixo' && produto.price <= 5000) ||
      (precoFiltro === 'medio' && produto.price > 5000 && produto.price <= 20000) ||
      (precoFiltro === 'alto' && produto.price > 20000);
    
    // Filtro por tipo de produto
    const tipoOk = !tipoFiltro || tipoFiltro === 'all' ||
      (tipoFiltro === 'gamificacao' && ['theme', 'feature', 'bonus', 'cosmetic'].includes(produto.type || '')) ||
      (tipoFiltro === 'fisico' && produto.type === 'product');
    
    return (nomeOk || skuOk) && categoriaOk && tagOk && statusOk && precoOk && tipoOk;
  });

  // Estatísticas
  const stats = {
    total: produtosFiltrados.length,
    ativos: produtosFiltrados.filter(p => p.isActive).length,
    promocao: produtosFiltrados.filter(p => p.isPromo).length,
    semEstoque: produtosFiltrados.filter(p => !p.stock || p.stock === 0).length,
    valorTotal: produtosFiltrados.reduce((sum, p) => sum + p.price, 0)
  };

  console.log('Estatísticas calculadas:', stats);
  console.log('Produtos para análise de estoque:', produtosFiltrados.map(p => ({ name: p.name, stock: p.stock, stockType: typeof p.stock })));

  const exportarProdutos = () => {
    const dados = produtosFiltrados.map(p => ({
      Nome: p.name,
      SKU: p.sku || 'Não informado',
      Categoria: p.categoryObj?.name || 'Sem categoria',
      Preço: `R$ ${(p.price / 100).toFixed(2)}`,
      Status: p.isActive ? 'Ativo' : 'Inativo',
      Promoção: p.isPromo ? 'Sim' : 'Não',
      Estoque: p.stock || 'Sem controle',
      Tags: p.tags?.map(t => t.tag.name).join(', ') || ''
    }));

    const csv = [
      Object.keys(dados[0]).join(','),
      ...dados.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `produtos-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Exportado',
      description: 'Lista de produtos exportada com sucesso'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Produtos</h2>
          <p className="text-gray-600 mt-1">
            Gerencie todos os produtos da sua loja
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportarProdutos} variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
          <Button onClick={handleNovoProduto} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Ativos</p>
                <p className="text-2xl font-bold">{stats.ativos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Promoções</p>
                <p className="text-2xl font-bold">{stats.promocao}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold">
                  R$ {(stats.valorTotal / 100).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Produtos Físicos</p>
                <p className="text-2xl font-bold">
                  {produtos.filter(p => p.type === 'product').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-pink-600" />
              <div>
                <p className="text-sm text-gray-600">Gamificação</p>
                <p className="text-2xl font-bold">
                  {produtos.filter(p => ['theme', 'feature', 'bonus', 'cosmetic'].includes(p.type || '')).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            <div>
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Nome ou SKU do produto..."
                  value={busca}
                  onChange={e => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Categoria</label>
              <Select value={categoriaFiltro || 'all'} onValueChange={setCategoriaFiltro}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {todasCategorias.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Tag</label>
              <Select value={tagFiltro || 'all'} onValueChange={setTagFiltro}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Todas as tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as tags</SelectItem>
                  {todasTags.map(tag => (
                    <SelectItem key={tag.id} value={tag.id}>{tag.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFiltro || 'all'} onValueChange={setStatusFiltro}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="promocao">Em Promoção</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Faixa de Preço</label>
              <Select value={precoFiltro || 'all'} onValueChange={setPrecoFiltro}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Todas as faixas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as faixas</SelectItem>
                  <SelectItem value="baixo">Até R$ 50,00</SelectItem>
                  <SelectItem value="medio">R$ 50,00 - R$ 200,00</SelectItem>
                  <SelectItem value="alto">Acima de R$ 200,00</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Tipo de Produto</label>
              <Select value={tipoFiltro || 'all'} onValueChange={setTipoFiltro}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="fisico">Produtos Físicos</SelectItem>
                  <SelectItem value="gamificacao">Produtos de Gamificação</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setBusca('');
                  setCategoriaFiltro('all');
                  setTagFiltro('all');
                  setStatusFiltro('all');
                  setPrecoFiltro('all');
                  setTipoFiltro('all');
                }}
                className="w-full"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {produtosFiltrados.length} de {produtos.length} produtos
          </span>
          {produtosFiltrados.length !== produtos.length && (
            <Badge variant="secondary">
              Filtrado
            </Badge>
          )}
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}

      <ProdutoList 
        produtos={produtosFiltrados} 
        loading={loading} 
        onEdit={handleEditarProduto} 
        onDelete={handleDeletarProduto} 
      />

      <ProdutoFormModal 
        open={showModal} 
        onClose={() => setShowModal(false)} 
        onSave={handleSalvarProduto} 
        produto={editingProduto} 
      />
    </div>
  );
};

export default AdminProdutos; 