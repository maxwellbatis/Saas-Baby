import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, ShoppingBag, CreditCard, Gift } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variations?: any;
}

const CarrinhoLoja: React.FC = () => {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState<CartItem[]>([]);
  const [showCheckoutOptions, setShowCheckoutOptions] = useState(false);

  // Carregar produtos do localStorage
  useEffect(() => {
    const loadCart = () => {
      const cartData = localStorage.getItem('cart');
      if (cartData) {
        try {
          const parsedCart = JSON.parse(cartData);
          setProdutos(parsedCart);
        } catch (error) {
          console.error('Erro ao carregar carrinho:', error);
          setProdutos([]);
        }
      }
    };

    // Carregar carrinho inicial
    loadCart();

    // Listener para mudanças no localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cart') {
        loadCart();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const removerProduto = (id: string) => {
    const updatedProdutos = produtos.filter((p) => p.id !== id);
    setProdutos(updatedProdutos);
    localStorage.setItem('cart', JSON.stringify(updatedProdutos));
  };

  const aumentarQuantidade = (id: string) => {
    const updatedProdutos = produtos.map((p) => 
      p.id === id ? { ...p, quantity: p.quantity + 1 } : p
    );
    setProdutos(updatedProdutos);
    localStorage.setItem('cart', JSON.stringify(updatedProdutos));
  };

  const diminuirQuantidade = (id: string) => {
    const updatedProdutos = produtos.map((p) => 
      p.id === id && p.quantity > 1 ? { ...p, quantity: p.quantity - 1 } : p
    );
    setProdutos(updatedProdutos);
    localStorage.setItem('cart', JSON.stringify(updatedProdutos));
  };

  const voltarParaLoja = () => {
    navigate('/loja');
  };

  const adicionarMaisProdutos = () => {
    navigate('/loja');
  };

  const finalizarCompra = () => {
    setShowCheckoutOptions(true);
  };

  const checkoutComPontos = () => {
    // Implementar checkout com pontos (gamificação)
    alert('Checkout com pontos será implementado em breve!');
  };

  const checkoutReal = () => {
    navigate('/loja/checkout-real');
  };

  const cancelarCheckout = () => {
    setShowCheckoutOptions(false);
  };

  const total = produtos.reduce((acc, p) => acc + p.price * p.quantity, 0);

  return (
    <div className="carrinho-loja min-h-screen bg-pink-50 pb-28 px-2 flex flex-col items-center">
      {/* Header com botão voltar */}
      <div className="w-full max-w-xl flex items-center justify-between py-4">
        <button
          onClick={voltarParaLoja}
          className="flex items-center gap-2 text-pink-700 hover:text-pink-800 font-semibold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar à Loja
        </button>
        <h1 className="text-2xl font-extrabold text-pink-700 text-center">Seu Carrinho</h1>
        <div className="w-20"></div> {/* Espaçador para centralizar o título */}
      </div>

      {/* Lista de produtos */}
      <div className="w-full max-w-xl space-y-4 mb-6">
        {produtos.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-8 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Seu carrinho está vazio</h3>
            <p className="text-gray-500 mb-6">Adicione produtos para começar suas compras!</p>
            <button
              onClick={adicionarMaisProdutos}
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-full font-semibold transition-colors shadow-lg"
            >
              Adicionar Produtos
            </button>
          </div>
        ) : (
          produtos.map((prod) => (
            <div key={prod.id} className="flex items-center bg-white rounded-2xl shadow p-4 border-2 border-pink-100 gap-4">
              <img 
                src={prod.image || 'https://via.placeholder.com/80x80?text=Produto'} 
                alt={prod.name} 
                className="w-20 h-20 object-cover rounded-xl border-2 border-pink-200" 
              />
              <div className="flex-1">
                <div className="font-bold text-lg text-gray-800">{prod.name}</div>
                <div className="text-pink-600 font-bold text-base">
                  R$ {(prod.price / 100).toFixed(2)}
                </div>
                
                {/* Controles de quantidade */}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-sm text-gray-600">Quantidade:</span>
                  <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
                    <button
                      onClick={() => diminuirQuantidade(prod.id)}
                      className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-gray-600 hover:text-pink-600 transition-colors shadow-sm"
                      disabled={prod.quantity <= 1}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-semibold text-gray-800 min-w-[20px] text-center">
                      {prod.quantity}
                    </span>
                    <button
                      onClick={() => aumentarQuantidade(prod.id)}
                      className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-gray-600 hover:text-pink-600 transition-colors shadow-sm"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500 mt-1">
                  Subtotal: R$ {((prod.price * prod.quantity) / 100).toFixed(2)}
                </div>
              </div>
              <button
                className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-full font-semibold text-xs shadow transition-colors"
                onClick={() => removerProduto(prod.id)}
              >
                Remover
              </button>
            </div>
          ))
        )}
      </div>

      {/* Botão para adicionar mais produtos quando há produtos no carrinho */}
      {produtos.length > 0 && (
        <div className="w-full max-w-xl mb-4">
          <button
            onClick={adicionarMaisProdutos}
            className="w-full bg-white border-2 border-pink-300 hover:bg-pink-50 text-pink-700 py-3 rounded-full font-semibold transition-colors shadow-lg flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Adicionar Mais Produtos
          </button>
        </div>
      )}

      {/* Total e finalizar */}
      {produtos.length > 0 && (
        <div className="w-full max-w-xl fixed bottom-0 left-0 right-0 bg-white border-t-2 border-pink-200 p-4 flex flex-col items-center z-20 shadow-2xl">
          <div className="flex justify-between w-full max-w-xl mb-3">
            <span className="text-lg font-bold text-gray-700">Total:</span>
            <span className="text-2xl font-extrabold text-pink-600">R$ {(total / 100).toFixed(2)}</span>
          </div>
          <button
            className="w-full bg-pink-500 hover:bg-pink-600 text-white text-lg font-bold py-3 rounded-full shadow-lg transition-colors"
            onClick={finalizarCompra}
          >
            Finalizar Compra
          </button>
        </div>
      )}

      {/* Modal de Opções de Checkout */}
      {showCheckoutOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
              Escolha como pagar
            </h3>
            
            <div className="space-y-4 mb-6">
              {/* Checkout com Pontos */}
              <button
                onClick={checkoutComPontos}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-4 rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-3"
              >
                <Gift className="w-6 h-6" />
                <div className="text-left">
                  <div className="font-bold">Com Pontos</div>
                  <div className="text-sm opacity-90">Use seus pontos de gamificação</div>
                </div>
              </button>

              {/* Checkout Real */}
              <button
                onClick={checkoutReal}
                className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white p-4 rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-3"
              >
                <CreditCard className="w-6 h-6" />
                <div className="text-left">
                  <div className="font-bold">Pagamento Real</div>
                  <div className="text-sm opacity-90">Cartão, PIX ou Boleto</div>
                </div>
              </button>
            </div>

            {/* Botão Cancelar */}
            <button
              onClick={cancelarCheckout}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarrinhoLoja; 