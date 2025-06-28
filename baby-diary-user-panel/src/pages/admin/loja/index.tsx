import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { 
  ShoppingBag, 
  Tag, 
  FolderOpen, 
  Package,
  TrendingUp,
  DollarSign,
  Users,
  BarChart3
} from 'lucide-react';
import AdminProdutos from './AdminProdutos';
import CategoriaLoja from './CategoriaLoja';
import TagLoja from './TagLoja';
import { BannersLoja } from './BannersLoja';

const AdminLoja: React.FC = () => {
  const [activeTab, setActiveTab] = useState('produtos');

  // Dados simulados para dashboard
  const stats = {
    totalProdutos: 24,
    produtosAtivos: 20,
    categorias: 8,
    tags: 15,
    vendasMes: 156,
    receitaMes: 12500
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Administração da Loja</h1>
        <p className="text-gray-600 mt-2">
          Gerencie produtos, categorias e banners da loja
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProdutos}</div>
            <p className="text-xs text-muted-foreground">
              {stats.produtosAtivos} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.categorias}</div>
            <p className="text-xs text-muted-foreground">
              Organizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tags</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tags}</div>
            <p className="text-xs text-muted-foreground">
              Para organização
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas do Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.vendasMes}</div>
            <p className="text-xs text-muted-foreground">
              R$ {stats.receitaMes.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Gerenciamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Gerenciamento da Loja
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="produtos" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Produtos
              </TabsTrigger>
              <TabsTrigger value="categorias" className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Categorias
              </TabsTrigger>
              <TabsTrigger value="banners" className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Banners
              </TabsTrigger>
            </TabsList>

            <TabsContent value="produtos" className="mt-6">
              <AdminProdutos />
            </TabsContent>

            <TabsContent value="categorias" className="mt-6">
              <CategoriaLoja />
            </TabsContent>

            <TabsContent value="banners" className="mt-6">
              <BannersLoja />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoja; 