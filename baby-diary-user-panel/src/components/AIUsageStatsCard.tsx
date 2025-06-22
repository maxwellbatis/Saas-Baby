import React, { useEffect, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Loader2, BarChart2, Bot, Sparkles } from 'lucide-react';
import { getAIUsageStats } from '@/lib/api';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

const typeLabels: Record<string, string> = {
  'chat': 'Chat',
  'sleep_analysis': 'Análise de Sono',
  'feeding_tips': 'Dicas de Alimentação',
  'milestone_prediction': 'Previsão de Marcos',
  'cry_interpretation': 'Choro',
  'personalized_advice': 'Conselho',
  'feeding-tips': 'Dicas de Alimentação',
  'suggested_activities': 'Sugestão de Atividades',
};

const COLORS = ['#6366f1', '#f59e42', '#10b981', '#f43f5e', '#fbbf24', '#3b82f6', '#a21caf', '#14b8a6'];

function groupByDate(arr) {
  // Agrupa por dia (YYYY-MM-DD)
  const map = {};
  arr.forEach((item) => {
    const date = item.createdAt ? item.createdAt.slice(0, 10) : 'Desconhecido';
    map[date] = (map[date] || 0) + 1;
  });
  return Object.entries(map).map(([date, count]) => ({ date, count }));
}

const AIUsageStatsCard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getAIUsageStats();
        if (res.success && res.data) {
          setData(res.data);
        } else {
          setError('Não foi possível obter estatísticas.');
        }
      } catch (err) {
        setError('Erro ao buscar estatísticas.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Dados para gráfico de pizza
  const pieData = data && data.byType ? Object.entries(data.byType).map(([type, count]) => ({ name: typeLabels[type] || type, value: count })) : [];
  // Dados para gráfico de barras
  const barData = data && data.recentUsage ? groupByDate(data.recentUsage) : [];

  return (
    <Card className="shadow-lg glass-card border-0">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <BarChart2 className="w-5 h-5 text-indigo-500" />
          <span className="font-bold text-lg">Meu uso de IA</span>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground py-4">
            <Loader2 className="w-5 h-5 animate-spin" /> Carregando estatísticas...
          </div>
        )}
        {error && (
          <div className="text-red-500 text-sm py-2">{error}</div>
        )}
        {data && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div className="flex gap-4 flex-wrap">
              <div className="bg-muted/60 rounded-lg p-3 text-sm flex flex-col items-center min-w-[120px]">
                <Bot className="w-6 h-6 text-blue-500 mb-1" />
                <b>{data.totalInteractions}</b>
                <span className="text-xs text-muted-foreground">Interações</span>
              </div>
              <div className="bg-muted/60 rounded-lg p-3 text-sm flex flex-col items-center min-w-[120px]">
                <Sparkles className="w-6 h-6 text-amber-500 mb-1" />
                <b>{data.totalTokens}</b>
                <span className="text-xs text-muted-foreground">Tokens usados</span>
              </div>
            </div>
            {/* Gráfico de pizza: tipos de interação */}
            {pieData.length > 0 && (
              <div className="w-full md:w-1/2 mx-auto">
                <div className="font-semibold mb-1 text-center">Proporção de tipos de interação</div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            {/* Gráfico de barras: uso ao longo do tempo */}
            {barData.length > 0 && (
              <div className="w-full md:w-2/3 mx-auto">
                <div className="font-semibold mb-1 text-center">Interações recentes por dia</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis allowDecimals={false} fontSize={12} />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#6366f1" name="Interações" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="mt-2">
              <div className="font-semibold mb-1">Tipos mais usados:</div>
              <ul className="list-disc ml-6 text-sm">
                {data.byType && Object.entries(data.byType).map(([type, count]: any) => (
                  <li key={type}><b>{typeLabels[type] || type}:</b> {count}</li>
                ))}
              </ul>
            </div>
            <div className="mt-2">
              <div className="font-semibold mb-1">Últimas interações:</div>
              <ul className="list-disc ml-6 text-sm">
                {data.recentUsage && data.recentUsage.map((item: any, i: number) => (
                  <li key={i}>{typeLabels[item.type] || item.type} - {item.createdAt ? new Date(item.createdAt).toLocaleString('pt-BR') : ''}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIUsageStatsCard; 