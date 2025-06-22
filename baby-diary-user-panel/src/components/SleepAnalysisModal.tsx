import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Loader2, Bot, RefreshCw, Moon, BarChart2 } from 'lucide-react';
import { analyzeSleepPattern } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface SleepAnalysisModalProps {
  open: boolean;
  onClose: () => void;
}

const SleepAnalysisModal: React.FC<SleepAnalysisModalProps> = ({ open, onClose }) => {
  const { currentBaby } = useAuth();
  const [days, setDays] = useState(7);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    if (!currentBaby?.id) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await analyzeSleepPattern({ babyId: currentBaby.id, days });
      if (res.success && res.data) {
        setResult(res.data);
      } else {
        setResult(null);
        setError('Limite de 10 semanal atingido. Faça upgrade. obter a análise de sono.');
      }
    } catch (err) {
      setError('Erro ao buscar análise de sono.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDays(7);
    setResult(null);
    setError(null);
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-full">
        <DialogTitle>Análise de Sono Inteligente</DialogTitle>
        <DialogDescription>
          Receba uma análise personalizada do padrão de sono do bebê.
        </DialogDescription>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm">Período:</span>
          <Input
            type="number"
            min={1}
            max={30}
            value={days}
            onChange={e => setDays(Number(e.target.value))}
            disabled={loading}
            className="w-20"
          />
          <span className="text-sm">dias</span>
          <Button onClick={fetchAnalysis} disabled={loading} variant="secondary">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart2 className="w-4 h-4" />}
            Analisar
          </Button>
          <Button onClick={fetchAnalysis} disabled={loading} size="icon" variant="ghost" title="Atualizar análise">
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>
        <div className="mt-4 min-h-[100px]">
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground py-4">
              <Loader2 className="w-5 h-5 animate-spin" /> Analisando sono...
            </div>
          )}
          {error && (
            <div className="text-red-500 text-sm py-2">{error}</div>
          )}
          {result && (
            <div className="bg-muted/60 rounded-lg p-4 text-sm whitespace-pre-line flex flex-col gap-2">
              <div className="flex items-center gap-2 font-semibold">
                <Moon className="w-5 h-5 text-blue-500" />
                Análise
              </div>
              <div>{result.analysis || result.message}</div>
              {result.recommendations && result.recommendations.length > 0 && (
                <div>
                  <div className="font-semibold mt-2">Recomendações:</div>
                  <ul className="list-disc ml-6 mt-1">
                    {result.recommendations.map((rec: string, i: number) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.metrics && (
                <div className="mt-2 text-xs text-muted-foreground">
                  <div>Total de registros: {result.metrics.sleepCount}</div>
                  <div>Tempo médio de sono: {Math.round(result.metrics.averageSleepTime)} min</div>
                  <div>Qualidade: {JSON.stringify(result.metrics.qualityDistribution)}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SleepAnalysisModal; 