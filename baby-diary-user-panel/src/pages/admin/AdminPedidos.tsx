import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { adminPedidos } from '../../lib/adminApi';
import { useToast } from '../../hooks/use-toast';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface Pedido {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  status: string;
  pagarmeOrderId?: string;
  amount: number;
  items: any[];
  createdAt: string;
  updatedAt: string;
}

interface PedidosFilters {
  status?: string;
  userId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export const AdminPedidos: React.FC = () => {
  const { toast } = useToast();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<PedidosFilters>({
    page: 1,
    limit: 20
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [editForm, setEditForm] = useState({
    status: 'pending',
    pagarmeOrderId: ''
  });

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const response = await adminPedidos.getAll(filters);
      
      if (response.success) {
        setPedidos(response.data.pedidos || []);
        setTotalPedidos(response.data.total || 0);
      } else {
        toast({
          title: 'Erro',
          description: response.error || 'Erro ao carregar pedidos',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Erro ao buscar pedidos:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar pedidos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset para primeira página ao filtrar
    }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setFilters(prev => ({ ...prev, page }));
  };

  const handleViewDetails = (pedido: Pedido) => {
    setSelectedPedido(pedido);
    setShowDetailsModal(true);
  };

  const handleEdit = (pedido: Pedido) => {
    setSelectedPedido(pedido);
    setEditForm({
      status: pedido.status || 'pending',
      pagarmeOrderId: pedido.pagarmeOrderId || ''
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedPedido) return;

    try {
      const response = await adminPedidos.update(selectedPedido.id, editForm);
      
      if (response.success) {
        toast({
          title: 'Sucesso',
          description: 'Pedido atualizado com sucesso'
        });
        setShowEditModal(false);
        fetchPedidos(); // Recarregar lista
      } else {
        toast({
          title: 'Erro',
          description: response.error || 'Erro ao atualizar pedido',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Erro ao atualizar pedido:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar pedido',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este pedido?')) return;

    try {
      const response = await adminPedidos.delete(id);
      
      if (response.success) {
        toast({
          title: 'Sucesso',
          description: 'Pedido excluído com sucesso'
        });
        fetchPedidos(); // Recarregar lista
      } else {
        toast({
          title: 'Erro',
          description: response.error || 'Erro ao excluir pedido',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Erro ao excluir pedido:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir pedido',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', variant: 'secondary' as const, icon: Clock },
      paid: { label: 'Pago', variant: 'default' as const, icon: CheckCircle },
      failed: { label: 'Falhou', variant: 'destructive' as const, icon: XCircle },
      canceled: { label: 'Cancelado', variant: 'outline' as const, icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount / 100); // amount está em centavos
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalPages = Math.ceil(totalPedidos / (filters.limit || 20));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
        <p className="text-gray-600 mt-2">
          Gerencie todos os pedidos da loja
        </p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="failed">Falhou</SelectItem>
                  <SelectItem value="canceled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Data de</label>
              <Input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Data até</label>
              <Input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="ID do pedido ou usuário..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pedidos */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos ({totalPedidos})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Carregando pedidos...</p>
              </div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedidos.map((pedido) => (
                    <TableRow key={pedido.id}>
                      <TableCell className="font-mono text-sm">
                        {pedido.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{pedido.user.name}</div>
                          <div className="text-sm text-gray-500">{pedido.user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(pedido.status)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(pedido.amount)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(pedido.createdAt)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(pedido)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(pedido)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(pedido.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Mostrando {((currentPage - 1) * (filters.limit || 20)) + 1} a {Math.min(currentPage * (filters.limit || 20), totalPedidos)} de {totalPedidos} pedidos
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      Anterior
                    </Button>
                    <span className="flex items-center px-3 py-2 text-sm">
                      Página {currentPage} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido</DialogTitle>
            <DialogDescription>
              Informações completas do pedido
            </DialogDescription>
          </DialogHeader>
          
          {selectedPedido && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">ID do Pedido</label>
                  <p className="text-sm font-mono">{selectedPedido.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedPedido.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Cliente</label>
                  <p className="text-sm">{selectedPedido.user.name}</p>
                  <p className="text-sm text-gray-500">{selectedPedido.user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Valor Total</label>
                  <p className="text-lg font-bold">{formatCurrency(selectedPedido.amount)}</p>
                </div>
                {selectedPedido.pagarmeOrderId && (
                  <div>
                    <label className="text-sm font-medium">ID Pagar.Me</label>
                    <p className="text-sm font-mono">{selectedPedido.pagarmeOrderId}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium">Data de Criação</label>
                  <p className="text-sm">{formatDate(selectedPedido.createdAt)}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Itens do Pedido</label>
                <div className="mt-2 space-y-2">
                  {Array.isArray(selectedPedido.items) && selectedPedido.items.map((item: any, index: number) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{item.name || 'Produto'}</p>
                          <p className="text-sm text-gray-500">
                            Quantidade: {item.quantity || 1}
                          </p>
                        </div>
                        <p className="font-medium">
                          {formatCurrency((item.price || 0) * (item.quantity || 1))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Pedido</DialogTitle>
            <DialogDescription>
              Atualize as informações do pedido
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={editForm.status || 'pending'} onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="failed">Falhou</SelectItem>
                  <SelectItem value="canceled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">ID Pagar.Me (opcional)</label>
              <Input
                value={editForm.pagarmeOrderId}
                onChange={(e) => setEditForm(prev => ({ ...prev, pagarmeOrderId: e.target.value }))}
                placeholder="ID do pedido no Pagar.Me"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit}>
                Salvar Alterações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPedidos;
