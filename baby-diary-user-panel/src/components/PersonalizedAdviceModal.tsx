import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Loader2, Bot, RefreshCw, Send } from 'lucide-react';
import { getPersonalizedAdvice } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface PersonalizedAdviceModalProps {
  open: boolean;
  onClose: () => void;
}

const PersonalizedAdviceModal: React.FC<PersonalizedAdviceModalProps> = ({ open, onClose }) => {
  const { currentBaby } = useAuth();
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAdvice = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await getPersonalizedAdvice({ question, babyId: currentBaby?.id });
      if (res.success && res.data) {
        setResult(res.data);
      } else {
        setResult(null);
        setError('Limite de 10 semanal atingido. Faça upgrade. obter conselho.');
      }
    } catch (err) {
      setError('Erro ao buscar conselho.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setQuestion('');
    setResult(null);
    setError(null);
    setLoading(false);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAdvice();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-full">
        <DialogTitle>Conselho Personalizado</DialogTitle>
        <DialogDescription>
          Envie uma pergunta específica e receba orientação da IA.
        </DialogDescription>
        <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
          <Input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Ex: Meu bebê está gripado, o que fazer?"
            disabled={loading}
            className="flex-1"
            required
          />
          <Button type="submit" disabled={loading || !question.trim()}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
          <Button onClick={fetchAdvice} disabled={loading || !question.trim()} size="icon" variant="ghost" title="Atualizar conselho">
            <RefreshCw className="w-5 h-5" />
          </Button>
        </form>
        <div className="mt-4 min-h-[80px]">
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground py-4">
              <Loader2 className="w-5 h-5 animate-spin" /> Buscando conselho...
            </div>
          )}
          {error && (
            <div className="text-red-500 text-sm py-2">{error}</div>
          )}
          {result && result.advice && (
            <div className="bg-muted/60 rounded-lg p-4 text-sm animate-fade-in">
              <div className="flex items-center gap-2 font-semibold mb-2">
                <Bot className="w-5 h-5 text-blue-500" />
                Resposta da IA
              </div>
              <div className="whitespace-pre-line">{result.advice}</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PersonalizedAdviceModal; 