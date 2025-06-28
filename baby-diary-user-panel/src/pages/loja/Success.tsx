import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ShoppingBag, Package, ArrowLeft, Home } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiFetch } from '@/config/api';

interface OrderDetails {
  orderId?: string;
  totalAmount?: number;
  items?: Array<{
    productId: number;
    name: string;
    quantity: number;
    price: number;
  }>;
  customerName?: string;
  estimatedDelivery?: string;
  status?: string;
  createdAt?: string;
}

const Success: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<OrderDetails>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // Tentar buscar dados do pedido da URL ou da sessão
        const orderId = searchParams.get('order_id') || searchParams.get('session_id');
        
        if (orderId) {
          // Buscar detalhes do pedido da API
          const response = await apiFetch(`/user/pedidos/${orderId}`);
          if (response.success) {
            const order = response.data;
            setOrderDetails({
              orderId: order.id,
              totalAmount: order.totalAmount,
              items: order.items,
              customerName: order.customerInfo?.name || 'Cliente',
              status: order.status,
              createdAt: order.createdAt,
              estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')
            });
          } else {
            // Fallback para dados da URL
            setOrderDetails({
              orderId: orderId,
              totalAmount: parseFloat(searchParams.get('amount') || '0'),
              items: [
                {
                  productId: parseInt(searchParams.get('product_id') || '0'),
                  name: searchParams.get('product_name') || 'Produto da Loja',
                  quantity: parseInt(searchParams.get('quantity') || '1'),
                  price: parseFloat(searchParams.get('amount') || '0')
                }
              ],
              customerName: searchParams.get('customer_name') || 'Cliente',
              estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')
            });
          }
        } else {
          // Dados simulados se não houver orderId
          setOrderDetails({
            orderId: 'PED-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            totalAmount: parseFloat(searchParams.get('amount') || '0'),
            items: [
              {
                productId: parseInt(searchParams.get('product_id') || '0'),
                name: searchParams.get('product_name') || 'Produto da Loja',
                quantity: parseInt(searchParams.get('quantity') || '1'),
                price: parseFloat(searchParams.get('amount') || '0')
              }
            ],
            customerName: searchParams.get('customer_name') || 'Cliente',
            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')
          });
        }
      } catch (error) {
        console.error('Erro ao buscar detalhes do pedido:', error);
        // Fallback para dados básicos
        setOrderDetails({
          orderId: 'PED-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          totalAmount: parseFloat(searchParams.get('amount') || '0'),
          items: [
            {
              productId: 0,
              name: 'Produto da Loja',
              quantity: 1,
              price: parseFloat(searchParams.get('amount') || '0')
            }
          ],
          customerName: searchParams.get('customer_name') || 'Cliente',
          estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [searchParams]);

  const handleBackToShop = () => {
    navigate('/loja');
  };

  const handleViewOrders = () => {
    navigate('/meus-pedidos');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando detalhes do pedido...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header com ícone de sucesso */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pedido Confirmado!
          </h1>
          <p className="text-lg text-gray-600">
            Obrigado por sua compra. Seu pedido foi processado com sucesso.
          </p>
        </div>

        {/* Card principal com detalhes */}
        <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              <Package className="w-6 h-6 text-blue-600" />
              Detalhes do Pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Número do pedido */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Número do Pedido:</span>
              <Badge variant="secondary" className="font-mono">
                {orderDetails.orderId}
              </Badge>
            </div>

            {/* Cliente */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Cliente:</span>
              <span className="text-gray-900">{orderDetails.customerName}</span>
            </div>

            {/* Status */}
            {orderDetails.status && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="font-medium text-gray-700">Status:</span>
                <Badge variant={orderDetails.status === 'paid' ? 'default' : 'secondary'} className="capitalize">
                  {orderDetails.status === 'paid' ? 'Pago' : orderDetails.status}
                </Badge>
              </div>
            )}

            {/* Valor total */}
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="font-medium text-gray-700">Valor Total:</span>
              <span className="text-xl font-bold text-green-600">
                {formatPrice(orderDetails.totalAmount || 0)}
              </span>
            </div>

            {/* Entrega estimada */}
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="font-medium text-gray-700">Entrega Estimada:</span>
              <span className="text-blue-600 font-medium">
                {orderDetails.estimatedDelivery}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card com itens do pedido */}
        {orderDetails.items && orderDetails.items.length > 0 && (
          <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Itens do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orderDetails.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">Quantidade: {item.quantity}</p>
                    </div>
                    <span className="font-medium text-gray-900">
                      {formatPrice(item.price)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Card com próximos passos */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Próximos Passos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-gray-900">Confirmação por Email</p>
                <p className="text-sm text-gray-600">
                  Você receberá um email de confirmação com todos os detalhes do pedido.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-gray-900">Acompanhamento</p>
                <p className="text-sm text-gray-600">
                  Acompanhe o status do seu pedido na seção "Meus Pedidos".
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-gray-900">Suporte</p>
                <p className="text-sm text-gray-600">
                  Em caso de dúvidas, entre em contato conosco através do suporte.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botões de ação */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={handleBackToShop}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Continuar Comprando
          </Button>
          
          <Button
            onClick={handleViewOrders}
            variant="outline"
            className="w-full border-green-600 text-green-600 hover:bg-green-50 py-3"
          >
            <Package className="w-4 h-4 mr-2" />
            Meus Pedidos
          </Button>
          
          <Button
            onClick={handleBackToHome}
            variant="outline"
            className="w-full border-gray-600 text-gray-600 hover:bg-gray-50 py-3"
          >
            <Home className="w-4 h-4 mr-2" />
            Voltar ao Início
          </Button>
        </div>

        {/* Mensagem de agradecimento */}
        <div className="text-center mt-8 p-6 bg-white/60 rounded-lg backdrop-blur-sm">
          <p className="text-gray-700 mb-2">
            <strong>Obrigado por escolher nossa loja!</strong>
          </p>
          <p className="text-sm text-gray-600">
            Esperamos que você aproveite sua compra. Volte sempre!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Success;
