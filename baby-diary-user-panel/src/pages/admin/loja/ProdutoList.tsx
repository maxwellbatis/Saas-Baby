import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { 
  Edit, 
  Trash2, 
  Eye, 
  Package, 
  Tag, 
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Produto as ProdutoBase } from './AdminProdutos';

interface Produto extends ProdutoBase {
  imageUrl?: string;
  sku?: string;
}

interface ProdutoListProps {
  produtos: Produto[];
  loading: boolean;
  onEdit: (produto: Produto) => void;
  onDelete: (id: string) => void;
}

const ProdutoList: React.FC<ProdutoListProps> = ({ produtos, loading, onEdit, onDelete }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price / 100);
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="flex items-center gap-1">
        <CheckCircle className="w-3 h-3" />
        Ativo
      </Badge>
    ) : (
      <Badge variant="secondary" className="flex items-center gap-1">
        <XCircle className="w-3 h-3" />
        Inativo
      </Badge>
    );
  };

  const getPromoBadge = (isPromo: boolean) => {
    return isPromo ? (
      <Badge variant="destructive" className="flex items-center gap-1">
        <TrendingUp className="w-3 h-3" />
        Promoção
      </Badge>
    ) : null;
  };

  const getStockBadge = (stock?: number) => {
    if (stock === undefined || stock === null) {
      return <Badge variant="outline">Sem controle</Badge>;
    }
    
    if (stock === 0) {
      return <Badge variant="destructive">Sem estoque</Badge>;
    }
    
    if (stock < 10) {
      return <Badge variant="secondary">Baixo estoque</Badge>;
    }
    
    return <Badge variant="default">{stock} unidades</Badge>;
  };

  const getTypeBadge = (type?: string) => {
    if (!type) {
      return <Badge variant="outline">Não definido</Badge>;
    }
    
    if (type === 'product') {
      return <Badge variant="default" className="bg-orange-100 text-orange-800">Físico</Badge>;
    }
    
    if (['theme', 'feature', 'bonus', 'cosmetic'].includes(type)) {
      return <Badge variant="default" className="bg-pink-100 text-pink-800">Gamificação</Badge>;
    }
    
    return <Badge variant="outline">{type}</Badge>;
  };

  const getProductImage = (produto: Produto) => {
    if (produto.mainImage) return produto.mainImage;
    if (produto.gallery && produto.gallery.length > 0) return produto.gallery[0];
    if (produto.imageUrl) return produto.imageUrl;
    return 'https://via.placeholder.com/300x300?text=Produto';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  if (!produtos.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
          <p className="text-gray-500 text-center">
            Comece criando seu primeiro produto para a loja
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Vista em Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {produtos.map((produto) => (
          <Card key={produto.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{produto.name}</CardTitle>
                  {produto.sku && (
                    <div className="text-xs text-gray-500 font-mono mt-1">SKU: {produto.sku}</div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {getStatusBadge(produto.isActive)}
                    {getPromoBadge(produto.isPromo || false)}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(produto)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(produto.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Imagem do Produto */}
              <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                <img 
                  src={getProductImage(produto)} 
                  alt={produto.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Informações do Produto */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Preço</span>
                  <span className="font-semibold text-lg">{formatPrice(produto.price)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Categoria</span>
                  <Badge variant="outline" className="text-xs">
                    {produto.categoryObj?.name || 'Sem categoria'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Tipo</span>
                  {getTypeBadge(produto.type)}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Estoque</span>
                  {getStockBadge(produto.stock)}
                </div>

                {/* Tags */}
                {produto.tags && produto.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {produto.tags.slice(0, 3).map((tagItem) => (
                      <Badge key={tagItem.tag.id} variant="secondary" className="text-xs">
                        {tagItem.tag.name}
                      </Badge>
                    ))}
                    {produto.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{produto.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Vista em Tabela (opcional) */}
      <details className="mt-8">
        <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-900">
          Ver em tabela
        </summary>
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagem</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {produtos.map((produto) => (
                <TableRow key={produto.id}>
                  <TableCell>
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={getProductImage(produto)} 
                        alt={produto.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{produto.name}</TableCell>
                  <TableCell>{produto.sku}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {produto.categoryObj?.name || 'Sem categoria'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">{formatPrice(produto.price)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {getStatusBadge(produto.isActive)}
                      {getPromoBadge(produto.isPromo || false)}
                    </div>
                  </TableCell>
                  <TableCell>{getStockBadge(produto.stock)}</TableCell>
                  <TableCell>{getTypeBadge(produto.type)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(produto)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDelete(produto.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </details>
    </div>
  );
};

export default ProdutoList; 