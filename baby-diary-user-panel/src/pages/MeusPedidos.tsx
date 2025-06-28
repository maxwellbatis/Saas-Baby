import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../config/api';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Eye, 
  ArrowLeft,
  Calendar,
  DollarSign,
  ShoppingCart,
  Truck,
  CreditCard
} from 'lucide-react';

interface Pedido {
  id: string;
  status: string;
  totalAmount: number;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  createdAt: string;
  updatedAt: string;
  paymentId?: string;
  paymentMethod?: string;
  shippingAddress?: any;
}

const MeusPedidos: React.FC = () => {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/user/pedidos');
      setPedidos(response.data || []);
    } catch (err: any) {
      console.error('Erro ao buscar pedidos:', err);
      setError(err.message || 'Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'canceled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Aguardando Pagamento';
      case 'paid':
        return 'Pago';
      case 'canceled':
        return 'Cancelado';
      case 'failed':
        return 'Falhou';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
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

  const handleViewOrder = (pedido: Pedido) => {
    // Aqui você pode implementar a navegação para uma página de detalhes do pedido
    console.log('Ver pedido:', pedido);
  };

  const handleCancelOrder = async (pedidoId: string) => {
    if (!window.confirm('Tem certeza que deseja cancelar este pedido?')) {
      return;
    }

    try {
      await apiFetch(`/user/pedidos/${pedidoId}`, {
        method: 'DELETE'
      });
      
      // Recarregar pedidos
      fetchPedidos();
    } catch (err: any) {
      console.error('Erro ao cancelar pedido:', err);
      alert('Erro ao cancelar pedido: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-pink-600 hover:text-pink-700 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meus Pedidos</h1>
            <p className="text-gray-600">Acompanhe todos os seus pedidos</p>
          </div>
        </div>

        {/* Erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Lista de Pedidos */}
        {pedidos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum pedido encontrado</h3>
            <p className="text-gray-600 mb-6">Você ainda não fez nenhum pedido.</p>
            <button
              onClick={() => navigate('/loja')}
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Ir para a Loja
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {pedidos.map((pedido) => (
              <div key={pedido.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Header do Pedido */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(pedido.status)}
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Pedido #{pedido.id.slice(-8).toUpperCase()}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(pedido.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {formatPrice(pedido.totalAmount)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(pedido.status)}`}>
                        {getStatusText(pedido.status)}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewOrder(pedido)}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {pedido.status === 'pending' && (
                          <button
                            onClick={() => handleCancelOrder(pedido.id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                            title="Cancelar pedido"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Itens do Pedido */}
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Itens do Pedido
                  </h4>
                  <div className="space-y-3">
                    {pedido.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{item.name}</h5>
                          <p className="text-sm text-gray-600">
                            Qtd: {item.quantity} • {formatPrice(item.price)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Informações de Pagamento e Entrega */}
                <div className="p-6 bg-gray-50 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {pedido.paymentMethod && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          Forma de Pagamento
                        </h5>
                        <p className="text-sm text-gray-600">{pedido.paymentMethod}</p>
                      </div>
                    )}
                    
                    {pedido.shippingAddress && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <Truck className="w-4 h-4" />
                          Endereço de Entrega
                        </h5>
                        <p className="text-sm text-gray-600">
                          {pedido.shippingAddress.street}, {pedido.shippingAddress.number}
                          <br />
                          {pedido.shippingAddress.city} - {pedido.shippingAddress.state}
                          <br />
                          CEP: {pedido.shippingAddress.zipCode}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MeusPedidos; 