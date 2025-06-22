import React, { useEffect, useState } from 'react';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Loader2, Info, ShieldAlert, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { getHealthAlerts } from '@/lib/api';

interface HealthAlertsCardProps {
  babyId: string;
  className?: string;
  limit?: number; // Quantos alertas mostrar (opcional)
}

const icons = [
  <ShieldAlert className="w-5 h-5 text-rose-500" />, // Alerta
  <Info className="w-5 h-5 text-blue-500" />,        // Informação
];

const HealthAlertsCard: React.FC<HealthAlertsCardProps> = ({ babyId, className = '', limit }) => {
  const [alerts, setAlerts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getHealthAlerts(babyId);
      if (res.success && Array.isArray(res.data)) {
        setAlerts(res.data);
      } else {
        setAlerts([]);
        setError('Limite de 10 semanal atingido. Faça upgrade. obter os alertas de saúde.');
      }
    } catch (err) {
      setError('Erro ao buscar alertas de saúde.');
      setAlerts([]);
    } finally {
      setLoading(false);
      setFetched(true);
    }
  };

  // Só busca quando abrir pela primeira vez
  useEffect(() => {
    if (open && !fetched) {
      fetchAlerts();
    }
    // eslint-disable-next-line
  }, [open]);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  return (
    <div className={`rounded-xl shadow-lg bg-white dark:bg-zinc-900 border border-muted p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-rose-500" />
          <span className="font-semibold text-lg">Alertas Inteligentes de Saúde</span>
        </div>
        <div className="flex items-center gap-2">
          {open && (
            <Button size="icon" variant="ghost" onClick={fetchAlerts} disabled={loading} title="Atualizar alertas">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
            </Button>
          )}
          <Button size="icon" variant="ghost" onClick={handleToggle} title={open ? 'Fechar alertas' : 'Ver alertas'}>
            {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </Button>
        </div>
      </div>
      {!open && (
        <div className="text-muted-foreground py-2 text-sm">Clique para ver os alertas de saúde gerados por IA para este bebê.</div>
      )}
      {open && (
        <div>
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-4">
              <Loader2 className="w-5 h-5 animate-spin" /> Carregando alertas...
            </div>
          ) : error ? (
            <Alert variant="destructive" className="mb-2">
              <Info className="w-5 h-5" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : alerts.length === 0 ? (
            <div className="text-muted-foreground py-4">Nenhum alerta de saúde no momento. Tudo certo!</div>
          ) : (
            <div className="space-y-2">
              {(limit ? alerts.slice(0, limit) : alerts).map((alert, i) => (
                <Alert key={i} className="flex items-start gap-2">
                  {icons[i % icons.length]}
                  <div>
                    <AlertDescription>{alert}</AlertDescription>
                  </div>
                </Alert>
              ))}
              {limit && alerts.length > limit && (
                <div className="text-xs text-muted-foreground mt-2">E mais {alerts.length - limit} alerta(s)...</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HealthAlertsCard; 