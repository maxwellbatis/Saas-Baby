import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Loader2, Send, Bot, User, X } from 'lucide-react';
import { sendAIChatMessage } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import UpgradePrompt from './UpgradePrompt';

interface AIChatModalProps {
  open: boolean;
  onClose: () => void;
}

const AIChatModal: React.FC<AIChatModalProps> = ({ open, onClose }) => {
  const { currentBaby } = useAuth();
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [messages, open]);

  const getBabyAge = () => {
    if (!currentBaby?.birthDate) return undefined;
    const birth = new Date(currentBaby.birthDate);
    const now = new Date();
    return Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    setMessages((msgs) => [...msgs, { role: 'user', content: input }]);
    setLoading(true);
    setError(null);
    try {
      const res = await sendAIChatMessage({ message: input, babyId: currentBaby?.id, babyAge: getBabyAge() });
      if (res.success && res.data?.response) {
        setMessages((msgs) => [...msgs, { role: 'assistant', content: res.data.response }]);
      } else {
        // Verificar se é erro de limite
        if (res.error?.includes('limite') || res.error?.includes('limit')) {
          setShowUpgradePrompt(true);
          return;
        }
        setMessages((msgs) => [...msgs, { role: 'assistant', content: 'Desculpe, não consegui responder no momento.' }]);
      }
    } catch (err: any) {
      if (err.message?.includes('limite') || err.message?.includes('limit')) {
        setShowUpgradePrompt(true);
        return;
      }
      setError('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  const handleClose = () => {
    setInput('');
    setLoading(false);
    setError(null);
    setMessages([]);
    setShowUpgradePrompt(false);
    onClose();
  };

  // Se deve mostrar o prompt de upgrade
  if (showUpgradePrompt) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-2xl">
          <UpgradePrompt
            title="Limite de IA atingido! 🤖"
            description="Você atingiu o limite de interações com a IA do plano gratuito. Faça upgrade para conversar ilimitadamente com seu assistente virtual."
            limit="10 interações/semana (plano gratuito)"
            variant="premium"
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
      <DialogContent className="max-w-md w-full p-0 overflow-hidden">
        <DialogTitle>Assistente Virtual</DialogTitle>
        <DialogDescription>
          Converse com a IA sobre saúde, rotina, desenvolvimento, dúvidas e mais.
        </DialogDescription>
        <div className="flex flex-col h-[70vh] bg-background rounded-lg shadow-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6 text-rose-500" />
              <span className="font-semibold text-lg">Assistente Virtual</span>
            </div>
            <Button size="icon" variant="ghost" onClick={handleClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 bg-muted/40">
            {messages.length === 0 && (
              <div className="text-muted-foreground text-center mt-8">Faça uma pergunta sobre saúde, rotina, desenvolvimento, etc.</div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2 rounded-lg shadow ${msg.role === 'user' ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white' : 'bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 border'}`}>
                  <div className="flex items-center gap-2">
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-rose-500" />}
                    <span className="text-sm whitespace-pre-line">{msg.content}</span>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] px-4 py-2 rounded-lg shadow bg-white dark:bg-zinc-800 border flex items-center gap-2">
                  <Bot className="w-4 h-4 text-rose-500" />
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Pensando...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {error && <div className="text-red-500 text-center py-2 text-sm">{error}</div>}
          <div className="flex items-center gap-2 border-t px-4 py-3 bg-background">
            <Input
              placeholder="Digite sua pergunta..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleInputKeyDown}
              disabled={loading}
              className="flex-1"
              autoFocus
            />
            <Button onClick={handleSend} disabled={loading || !input.trim()} className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIChatModal; 