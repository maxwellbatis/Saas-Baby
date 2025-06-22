import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Loader2, Send, Utensils } from 'lucide-react';
import { getFeedingTips } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useUpgradePrompt } from '@/hooks/useUpgradePrompt';
import UpgradePrompt from './UpgradePrompt';

interface FeedingTipsModalProps {
  open: boolean;
  onClose: () => void;
}

const FeedingTipsModal: React.FC<FeedingTipsModalProps> = ({ open, onClose }) => {
  const { currentBaby } = useAuth();
  const [question, setQuestion] = useState('');
  const [tips, setTips] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showUpgradePrompt, upgradeConfig, hideUpgrade, showUpgrade } = useUpgradePrompt({
    title: "Limite de IA atingido! 🍼",
    description: "Você atingiu o limite de interações com a IA do plano gratuito. Faça upgrade para obter dicas ilimitadas de alimentação.",
    limit: "10 interações/semana (plano gratuito)",
    variant: "premium"
  });

  const fetchTips = async (customQuestion?: string) => {
    if (!currentBaby?.id) return;
    setLoading(true);
    setError(null);
    setTips(null);
    try {
      const res = await getFeedingTips({ babyId: currentBaby.id, question: customQuestion || question });
      if (res.success && res.data?.tips) {
        setTips(res.data.tips);
      } else {
        setTips(null);
        setError('Limite de 10 semanal atingido. Faça upgrade. obter dicas de alimentação.');
      }
    } catch (err: any) {
      if (err.message?.includes('limite') || err.message?.includes('limit')) {
        showUpgrade();
        return;
      }
      setError('Erro ao buscar dicas de alimentação.');
      setTips(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    fetchTips();
  };

  const handleClose = () => {
    setQuestion('');
    setTips(null);
    setError(null);
    setLoading(false);
    hideUpgrade();
    onClose();
  };

  // Se deve mostrar o prompt de upgrade
  if (showUpgradePrompt) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-2xl">
          <UpgradePrompt
            title={upgradeConfig.title}
            description={upgradeConfig.description}
            limit={upgradeConfig.limit}
            variant={upgradeConfig.variant}
            className="border-0 shadow-none"
          />
          <div className="flex justify-center mt-4">
            <Button variant="outline" onClick={handleClose}>
              Voltar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Utensils className="w-5 h-5" />
            Dicas de Alimentação
          </DialogTitle>
          <DialogDescription>
            Faça perguntas sobre alimentação do seu bebê e receba dicas personalizadas da IA
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Sua pergunta sobre alimentação:</label>
            <Textarea
              placeholder="Ex: Como introduzir novos alimentos? Quantas vezes por dia devo amamentar? Meu bebê não quer comer..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSend}
              disabled={loading || !question.trim()}
              className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Buscando dicas...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Pergunta
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {tips && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">💡 Dicas da IA:</h4>
              <div className="text-green-700 text-sm whitespace-pre-line">
                {tips}
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 text-center">
            💡 Dica: Seja específico na sua pergunta para receber dicas mais precisas!
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedingTipsModal; 