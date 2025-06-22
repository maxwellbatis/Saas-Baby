import React, { useEffect, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Loader2, Sparkles, CalendarCheck, RefreshCw, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { predictMilestones } from '@/lib/api';

interface PredictedMilestonesCardProps {
  babyId: string;
  className?: string;
}

const PredictedMilestonesCard: React.FC<PredictedMilestonesCardProps> = ({ babyId, className }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const fetchPrediction = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await predictMilestones({ babyId });
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError('Limite de 10 semanal atingido. Faça upgrade. obter a previsão de marcos.');
      }
    } catch (err) {
      setError('Erro ao buscar previsão de marcos.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setOpen((prev) => {
      if (!prev && !data && !loading) fetchPrediction();
      return !prev;
    });
  };

  // Função para limitar texto
  const resumir = (texto: string, max = 200) => {
    if (!texto) return '';
    return texto.length > max ? texto.slice(0, max) + '...' : texto;
  };

  // Pega só os 3 próximos marcos
  const getTimelinePreview = () => {
    if (!data?.timeline) return [];
    return Object.entries(data.timeline).slice(0, 3);
  };

  return (
    <Card className={`shadow-lg glass-card border-0 ${className || ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span className="font-bold text-lg">Próximos Marcos (IA)</span>
          <Button onClick={handleToggle} size="icon" variant="ghost" className="ml-auto" title={open ? 'Fechar' : 'Ver previsão'}>
            {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </Button>
        </div>
        {open && (
          <>
            <Button onClick={fetchPrediction} size="icon" variant="ghost" title="Atualizar previsão" disabled={loading}>
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground py-4">
                <Loader2 className="w-5 h-5 animate-spin" /> Carregando previsão...
              </div>
            )}
            {error && (
              <div className="text-red-500 text-sm py-2">{error}</div>
            )}
            {data && (
              <div className="flex flex-col gap-2 animate-fade-in">
                <div className="flex items-center gap-2 font-semibold">
                  <CalendarCheck className="w-5 h-5 text-green-500" />
                  Timeline dos próximos marcos
                </div>
                <div className="bg-muted/60 rounded-lg p-3 text-sm whitespace-pre-line">
                  {data.timeline && Object.keys(data.timeline).length > 0 ? (
                    <ul className="list-disc ml-6">
                      {(showAll ? Object.entries(data.timeline) : getTimelinePreview()).map(([age, desc]: any, i) => (
                        <li key={i}><b>{age} meses:</b> {resumir(desc, 100)}</li>
                      ))}
                    </ul>
                  ) : (
                    <div>{resumir(data.predictions, 200) || 'Nenhuma previsão disponível.'}</div>
                  )}
                  {data.timeline && Object.keys(data.timeline).length > 3 && !showAll && (
                    <Button variant="link" size="sm" onClick={() => setShowAll(true)} className="mt-2">Ver todos</Button>
                  )}
                  {showAll && (
                    <Button variant="link" size="sm" onClick={() => setShowAll(false)} className="mt-2">Ver menos</Button>
                  )}
                </div>
                {data.predictions && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 font-semibold">
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                      Dicas e Atividades Sugeridas
                    </div>
                    <div className="bg-muted/60 rounded-lg p-3 text-sm whitespace-pre-line">
                      {resumir(data.predictions, 200)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PredictedMilestonesCard; 