import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { useToast } from '../../hooks/use-toast';
import { 
  CreditCard, 
  FileText, 
  QrCode, 
  Truck, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  MapPin,
  User,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';
import { apiFetch } from '../../config/api';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variations?: any;
}

interface CheckoutData {
  customer: {
    name: string;
    email: string;
    document: string;
    phone: string;
  };
  shipping_address: {
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
    shipping_cost: number;
  };
  payment_method: 'credit_card' | 'boleto' | 'pix';
  installments: number;
  card_data?: {
    number: string;
    holder_name: string;
    exp_month: string;
    exp_year: string;
    cvv: string;
  };
}

interface OrderResponse {
  orderId: string;
  paymentId: string;
  status: string;
  totalAmount: number;
  paymentUrl?: string;
  qrCode?: any;
  boletoUrl?: string;
  pixCode?: string;
}

const CheckoutReal: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  // Verificar se o usuário está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: 'Login necessário',
        description: 'Você precisa estar logado para finalizar a compra.',
        variant: 'destructive'
      });
      navigate('/login', { state: { from: '/loja/checkout-real' } });
      return;
    }
  }, [isAuthenticated, navigate, toast]);
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderData, setOrderData] = useState<OrderResponse | null>(null);
  
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    customer: {
      name: '',
      email: '',
      document: '',
      phone: ''
    },
    shipping_address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zip_code: '',
      shipping_cost: 0
    },
    payment_method: 'credit_card',
    installments: 1
  });

  // Estados para validação
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Carregar itens do carrinho
  useEffect(() => {
    const loadCart = () => {
      const cart = localStorage.getItem('cart');
      if (cart) {
        const items = JSON.parse(cart);
        setCartItems(items);
      }
    };

    loadCart();
    window.addEventListener('storage', loadCart);
    return () => window.removeEventListener('storage', loadCart);
  }, []);

  // Calcular total
  const calculateTotal = () => {
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = checkoutData.shipping_address.shipping_cost;
    return subtotal + shipping;
  };

  // Validar formulário
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validar dados do cliente
    if (!checkoutData.customer.name.trim()) {
      newErrors.customerName = 'Nome é obrigatório';
    }
    if (!checkoutData.customer.email.trim()) {
      newErrors.customerEmail = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(checkoutData.customer.email)) {
      newErrors.customerEmail = 'Email inválido';
    }
    if (!checkoutData.customer.document.trim()) {
      newErrors.customerDocument = 'CPF é obrigatório';
    }
    if (!checkoutData.customer.phone.trim()) {
      newErrors.customerPhone = 'Telefone é obrigatório';
    }

    // Validar endereço
    if (!checkoutData.shipping_address.street.trim()) {
      newErrors.street = 'Rua é obrigatória';
    }
    if (!checkoutData.shipping_address.number.trim()) {
      newErrors.number = 'Número é obrigatório';
    }
    if (!checkoutData.shipping_address.neighborhood.trim()) {
      newErrors.neighborhood = 'Bairro é obrigatório';
    }
    if (!checkoutData.shipping_address.city.trim()) {
      newErrors.city = 'Cidade é obrigatória';
    }
    if (!checkoutData.shipping_address.state.trim()) {
      newErrors.state = 'Estado é obrigatório';
    }
    if (!checkoutData.shipping_address.zip_code.trim()) {
      newErrors.zipCode = 'CEP é obrigatório';
    }

    // NÃO validar cartão de crédito para Stripe Checkout!

    setErrors(newErrors);
    console.log('Erros de validação:', newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Processar checkout
  const handleCheckout = async () => {
    if (!validateForm()) {
      toast({
        title: 'Dados incompletos',
        description: 'Por favor, preencha todos os campos obrigatórios.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // Montar o payload para o Stripe
      const payload = {
        items: cartItems.map(item => ({
          productId: parseInt(item.id),
          quantity: item.quantity
        })),
        customerInfo: {
          name: checkoutData.customer.name,
          email: checkoutData.customer.email,
          phone: checkoutData.customer.phone,
          cpf: checkoutData.customer.document
        },
        shippingAddress: {
          street: checkoutData.shipping_address.street,
          number: checkoutData.shipping_address.number,
          complement: checkoutData.shipping_address.complement,
          neighborhood: checkoutData.shipping_address.neighborhood,
          city: checkoutData.shipping_address.city,
          state: checkoutData.shipping_address.state,
          zipCode: checkoutData.shipping_address.zip_code
        }
      };

      console.log('Enviando payload para Stripe:', payload);

      // Verificar se o usuário está autenticado
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: 'Sessão expirada',
          description: 'Faça login novamente para finalizar a compra.',
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }

      // Enviar para o endpoint do Stripe com o token no header
      const result = await apiFetch('/shop/stripe/create-order', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (result.success && result.data?.url) {
        window.location.href = result.data.url;
        return;
      } else {
        toast({
          title: 'Erro ao criar pedido',
          description: result.error || 'Tente novamente.',
          variant: 'destructive'
        });
      }
    } catch (err) {
      console.error('Erro no checkout:', err);
      toast({
        title: 'Erro ao processar checkout',
        description: 'Ocorreu um erro inesperado.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Voltar para o carrinho
  const handleBackToCart = () => {
    navigate('/loja/carrinho');
  };

  // Formatar preço
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price / 100);
  };

  // Estados brasileiros
  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  if (orderCreated && orderData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pedido Criado!</h1>
            <p className="text-gray-600">Seu pedido foi processado com sucesso</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Detalhes do Pedido */}


            {/* Instruções de Pagamento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Instruções de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                {checkoutData.payment_method === 'credit_card' && (
                  <div className="text-center">
                    <CreditCard className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      Seu pagamento está sendo processado. Você receberá uma confirmação em breve.
                    </p>
                  </div>
                )}

                {checkoutData.payment_method === 'boleto' && orderData.boletoUrl && (
                  <div className="text-center">
                    <FileText className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      Clique no botão abaixo para gerar o boleto bancário.
                    </p>
                    <Button 
                      onClick={() => window.open(orderData.boletoUrl, '_blank')}
                      className="w-full"
                    >
                      Gerar Boleto
                    </Button>
                  </div>
                )}

                {checkoutData.payment_method === 'pix' && orderData.pixCode && (
                  <div className="text-center">
                    <QrCode className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      Escaneie o QR Code ou copie o código PIX abaixo.
                    </p>
                    <div className="bg-gray-100 p-4 rounded-lg mb-4">
                      <p className="text-sm font-mono break-all">{orderData.pixCode}</p>
                    </div>
                    <Button 
                      onClick={() => navigator.clipboard.writeText(orderData.pixCode || '')}
                      variant="outline"
                      className="w-full"
                    >
                      Copiar Código PIX
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <Button onClick={() => navigate('/loja')} variant="outline">
              Continuar Comprando
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button onClick={handleBackToCart} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Carrinho
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário de Checkout */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dados Pessoais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Dados Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={checkoutData.customer.name}
                      onChange={(e) => setCheckoutData(prev => ({
                        ...prev,
                        customer: { ...prev.customer, name: e.target.value }
                      }))}
                      className={errors.customerName ? 'border-red-500' : ''}
                    />
                    {errors.customerName && (
                      <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={checkoutData.customer.email}
                      onChange={(e) => setCheckoutData(prev => ({
                        ...prev,
                        customer: { ...prev.customer, email: e.target.value }
                      }))}
                      className={errors.customerEmail ? 'border-red-500' : ''}
                    />
                    {errors.customerEmail && (
                      <p className="text-red-500 text-sm mt-1">{errors.customerEmail}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="document">CPF *</Label>
                    <Input
                      id="document"
                      value={checkoutData.customer.document}
                      onChange={(e) => setCheckoutData(prev => ({
                        ...prev,
                        customer: { ...prev.customer, document: e.target.value }
                      }))}
                      className={errors.customerDocument ? 'border-red-500' : ''}
                    />
                    {errors.customerDocument && (
                      <p className="text-red-500 text-sm mt-1">{errors.customerDocument}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input
                      id="phone"
                      value={checkoutData.customer.phone}
                      onChange={(e) => setCheckoutData(prev => ({
                        ...prev,
                        customer: { ...prev.customer, phone: e.target.value }
                      }))}
                      className={errors.customerPhone ? 'border-red-500' : ''}
                    />
                    {errors.customerPhone && (
                      <p className="text-red-500 text-sm mt-1">{errors.customerPhone}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Endereço de Entrega */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Endereço de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="street">Rua *</Label>
                    <Input
                      id="street"
                      value={checkoutData.shipping_address.street}
                      onChange={(e) => setCheckoutData(prev => ({
                        ...prev,
                        shipping_address: { ...prev.shipping_address, street: e.target.value }
                      }))}
                      className={errors.street ? 'border-red-500' : ''}
                    />
                    {errors.street && (
                      <p className="text-red-500 text-sm mt-1">{errors.street}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="number">Número *</Label>
                    <Input
                      id="number"
                      value={checkoutData.shipping_address.number}
                      onChange={(e) => setCheckoutData(prev => ({
                        ...prev,
                        shipping_address: { ...prev.shipping_address, number: e.target.value }
                      }))}
                      className={errors.number ? 'border-red-500' : ''}
                    />
                    {errors.number && (
                      <p className="text-red-500 text-sm mt-1">{errors.number}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={checkoutData.shipping_address.complement}
                    onChange={(e) => setCheckoutData(prev => ({
                      ...prev,
                      shipping_address: { ...prev.shipping_address, complement: e.target.value }
                    }))}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="neighborhood">Bairro *</Label>
                    <Input
                      id="neighborhood"
                      value={checkoutData.shipping_address.neighborhood}
                      onChange={(e) => setCheckoutData(prev => ({
                        ...prev,
                        shipping_address: { ...prev.shipping_address, neighborhood: e.target.value }
                      }))}
                      className={errors.neighborhood ? 'border-red-500' : ''}
                    />
                    {errors.neighborhood && (
                      <p className="text-red-500 text-sm mt-1">{errors.neighborhood}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="city">Cidade *</Label>
                    <Input
                      id="city"
                      value={checkoutData.shipping_address.city}
                      onChange={(e) => setCheckoutData(prev => ({
                        ...prev,
                        shipping_address: { ...prev.shipping_address, city: e.target.value }
                      }))}
                      className={errors.city ? 'border-red-500' : ''}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="state">Estado *</Label>
                    <Select
                      value={checkoutData.shipping_address.state}
                      onValueChange={(value) => setCheckoutData(prev => ({
                        ...prev,
                        shipping_address: { ...prev.shipping_address, state: value }
                      }))}
                    >
                      <SelectTrigger className={errors.state ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {estados.map(estado => (
                          <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.state && (
                      <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="zipCode">CEP *</Label>
                  <Input
                    id="zipCode"
                    value={checkoutData.shipping_address.zip_code}
                    onChange={(e) => setCheckoutData(prev => ({
                      ...prev,
                      shipping_address: { ...prev.shipping_address, zip_code: e.target.value }
                    }))}
                    className={errors.zipCode ? 'border-red-500' : ''}
                  />
                  {errors.zipCode && (
                    <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumo do Pedido */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">Qtd: {item.quantity}</p>
                    </div>
                    <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatPrice(cartItems.reduce((total, item) => total + (item.price * item.quantity), 0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frete:</span>
                    <span>{formatPrice(checkoutData.shipping_address.shipping_cost)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>{formatPrice(calculateTotal())}</span>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={loading || cartItems.length === 0}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    `Finalizar Compra - ${formatPrice(calculateTotal())}`
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Informações de Segurança */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600">
                <p>• Pagamento processado pelo Pagar.me</p>
                <p>• Dados criptografados</p>
                <p>• Ambiente seguro</p>
                <p>• Suporte 24/7</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutReal; 