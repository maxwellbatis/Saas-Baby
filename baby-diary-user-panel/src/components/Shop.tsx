import { useEffect, useState } from "react";
import { getShopItems, purchaseShopItem, getUserPurchases } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Lock, Heart, Star, Flame, Gift, BadgeCheck, Cloud, Download, Palette } from "lucide-react";
import confetti from "canvas-confetti";
import { Dialog } from "@/components/ui/dialog";

interface ShopProps {
  userPoints: number;
  onPointsUpdate?: (newPoints: number) => void;
}

export const Shop: React.FC<ShopProps> = ({ userPoints, onPointsUpdate }) => {
  const [items, setItems] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [confirmItem, setConfirmItem] = useState<any>(null);
  const [currentPoints, setCurrentPoints] = useState(userPoints);

  const iconMap: Record<string, JSX.Element> = {
    pink_theme: <Heart className="w-10 h-10 text-pink-400 animate-bounce" />,
    blue_theme: <Star className="w-10 h-10 text-blue-400 animate-spin" />,
    export_feature: <Download className="w-10 h-10 text-purple-400 animate-pulse" />,
    backup_feature: <Cloud className="w-10 h-10 text-blue-300 animate-float" />,
    points_bonus: <Gift className="w-10 h-10 text-yellow-400 animate-heartbeat" />,
    gold_badge: <BadgeCheck className="w-10 h-10 text-yellow-500 animate-glow" />,
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [shop, userPurchases] = await Promise.all([
          getShopItems(),
          getUserPurchases(),
        ]);
        console.log("Resposta da loja:", shop);
        let shopArray = [];
        if (Array.isArray(shop)) {
          shopArray = shop;
        } else if (shop && Array.isArray(shop.data)) {
          shopArray = shop.data;
        } else if (shop && Array.isArray(shop.items)) {
          shopArray = shop.items;
        }
        setItems(shopArray);
        setPurchases(Array.isArray(userPurchases) ? userPurchases.map((p: any) => p.itemId) : []);
      } catch (e: any) {
        setFeedback(e?.response?.data?.error || "Erro ao carregar a loja. Tente novamente mais tarde.");
        setItems([]); // fallback defensivo
      }
      setLoading(false);
    }
    fetchData();
    // Limpa o estado do modal ao desmontar
    return () => setConfirmItem(null);
  }, []);

  useEffect(() => { setCurrentPoints(userPoints); }, [userPoints]);

  const handlePurchase = async (itemId: string) => {
    setProcessing(itemId);
    setFeedback(null);
    try {
      const result = await purchaseShopItem(itemId);
      setFeedback("Item resgatado com sucesso!");
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      const userPurchases = await getUserPurchases();
      setPurchases(userPurchases.map((p: any) => p.itemId));
      // Atualiza pontos se o item for bônus de pontos
      if (result && result.newPoints !== undefined) {
        setCurrentPoints(result.newPoints);
        if (onPointsUpdate) onPointsUpdate(result.newPoints);
      } else {
        // fallback: recarregar pontos do usuário se necessário
      }
    } catch (e: any) {
      setFeedback(e?.response?.data?.error || "Erro ao resgatar item.");
    }
    setProcessing(null);
    setConfirmItem(null);
  };

  if (loading) return <div className="text-center py-8">Carregando loja...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Loja de Recompensas</h2>
        <div className="text-pink-600 font-semibold">Seus pontos: {currentPoints}</div>
      </div>
      {feedback && <div className="mb-4 text-center text-sm text-pink-600 animate-fade-in">{feedback}</div>}
      {/* Modal de confirmação - agora fora do grid, overlay centralizado */}
      <Dialog open={!!confirmItem} onOpenChange={() => setConfirmItem(null)}>
        {confirmItem && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md text-center">
              <h3 className="text-lg font-bold mb-2">Confirmar resgate?</h3>
              <p className="mb-4">Deseja realmente resgatar <span className="font-semibold">{confirmItem.name}</span> por <span className="text-pink-500 font-bold">{confirmItem.price} pontos</span>?</p>
              <div className="flex gap-4 justify-center">
                <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => setConfirmItem(null)}>Cancelar</button>
                <button className="px-4 py-2 rounded bg-pink-500 text-white font-semibold hover:bg-pink-600" onClick={() => confirmItem && handlePurchase(confirmItem.id)} disabled={processing === confirmItem?.id}>Confirmar</button>
              </div>
            </div>
          </div>
        )}
      </Dialog>
      {items.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">Nenhum item disponível na loja no momento.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4">
          {items.map((item: any) => (
            <div key={item.id} className="glass-card p-6 flex flex-col items-center shadow-lg hover:shadow-2xl transition-all duration-300 animate-fade-in">
              <div className="mb-3">
                {iconMap[item.id] || <Palette className="w-10 h-10 text-gray-300 animate-float" />}
              </div>
              <h3 className="font-bold text-lg mb-1 text-center">{item.name}</h3>
              <p className="text-sm text-muted-foreground mb-2 text-center">{item.description}</p>
              <div className="flex items-center gap-2 mt-2 mb-2">
                <Gift className="w-5 h-5 text-pink-400" />
                <span className="font-semibold text-pink-500">{item.price} pts</span>
              </div>
              <button
                className="mt-2 px-4 py-2 rounded bg-pink-400 text-white font-semibold hover:bg-pink-500 transition-all disabled:opacity-50"
                onClick={() => setConfirmItem(item)}
                disabled={purchases.includes(item.id) || currentPoints < item.price}
              >
                {purchases.includes(item.id) ? "Resgatado" : "Resgatar"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 