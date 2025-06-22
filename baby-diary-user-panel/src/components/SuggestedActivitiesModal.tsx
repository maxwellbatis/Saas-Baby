import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Loader2, Bot, RefreshCw, Sparkles, Puzzle, Baby, Utensils, Clock, Bath, Pill } from 'lucide-react';
import { suggestActivities } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const categories = [
  { value: '', label: 'Todas' },
  { value: 'motor', label: 'Desenvolvimento Motor' },
  { value: 'sensory', label: 'Sensorial' },
  { value: 'play', label: 'Brincadeira' },
  { value: 'feeding', label: 'Alimentação' },
  { value: 'sleep', label: 'Sono' },
];

const icons = {
  motor: <Baby className="w-5 h-5 text-blue-500" />,
  sensory: <Sparkles className="w-5 h-5 text-amber-500" />,
  play: <Puzzle className="w-5 h-5 text-pink-500" />,
  feeding: <Utensils className="w-5 h-5 text-green-500" />,
  sleep: <Clock className="w-5 h-5 text-cyan-500" />,
  bath: <Bath className="w-5 h-5 text-cyan-400" />,
  medicine: <Pill className="w-5 h-5 text-red-500" />,
  general: <Bot className="w-5 h-5 text-gray-500" />,
};

interface SuggestedActivitiesModalProps {
  open: boolean;
  onClose: () => void;
}

const SuggestedActivitiesModal: React.FC<SuggestedActivitiesModalProps> = ({ open, onClose }) => {
  const { currentBaby } = useAuth();
  const [category, setCategory] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = async () => {
    if (!currentBaby?.id) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await suggestActivities({ babyId: currentBaby.id, category });
      if (res.success && res.data) {
        setResult(res.data);
      } else {
        setResult(null);
        setError('Limite de 10 semanal atingido. Faça upgrade.');
      }
    } catch (err) {
      setError('Erro ao buscar sugestões.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCategory('');
    setResult(null);
    setError(null);
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg w-full">
        <DialogTitle>Sugestão de Atividades</DialogTitle>
        <DialogDescription>
          Receba sugestões personalizadas de atividades para o bebê.
        </DialogDescription>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm">Categoria:</span>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            disabled={loading}
            className="border rounded px-2 py-1 text-sm"
          >
            {categories.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <Button onClick={fetchSuggestions} disabled={loading} variant="secondary">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Sugerir
          </Button>
          <Button onClick={fetchSuggestions} disabled={loading} size="icon" variant="ghost" title="Atualizar sugestões">
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>
        <div className="mt-4 min-h-[100px]">
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground py-4">
              <Loader2 className="w-5 h-5 animate-spin" /> Buscando sugestões...
            </div>
          )}
          {error && (
            <div className="text-red-500 text-sm py-2">{error}</div>
          )}
          {result && result.suggestions && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
              {result.suggestions.map((s: any, i: number) => (
                <div key={i} className="bg-muted/60 rounded-lg p-4 flex flex-col gap-2 shadow">
                  <div className="flex items-center gap-2 font-semibold">
                    {icons[s.category] || icons.general}
                    {s.title}
                  </div>
                  <div className="text-sm text-muted-foreground">{s.description}</div>
                  {s.materials && (
                    <div className="text-xs mt-1"><b>Materiais:</b> {s.materials.join(', ')}</div>
                  )}
                  {s.duration && (
                    <div className="text-xs"><b>Duração:</b> {s.duration} min</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuggestedActivitiesModal; 