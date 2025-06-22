import { useEffect, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from '@/hooks/use-toast';
import { Calendar } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Calendar as CalendarPicker } from './ui/calendar';

interface GrowthRecord {
  id: string;
  date: string;
  weight: number;
  height: number;
  headCircumference?: number;
  notes?: string;
}

interface GrowthMeasurementsProps {
  babyId: string;
  canEdit?: boolean;
}

const GrowthMeasurements = ({ babyId, canEdit = true }: GrowthMeasurementsProps) => {
  const [records, setRecords] = useState<GrowthRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ date: '', weight: '', height: '', headCircumference: '', notes: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchRecords = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:3000/api/user/babies/${babyId}/growth`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setRecords(Array.isArray(data.data) ? data.data : []);
    setLoading(false);
  };

  useEffect(() => {
    if (babyId) fetchRecords();
  }, [babyId]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem('token');
    const payload = {
      date: form.date,
      weight: parseFloat(form.weight),
      height: parseFloat(form.height),
      headCircumference: form.headCircumference ? parseFloat(form.headCircumference) : undefined,
      notes: form.notes,
    };
    try {
      let res;
      if (editingId) {
        res = await fetch(`http://localhost:3000/api/user/growth/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`http://localhost:3000/api/user/babies/${babyId}/growth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) throw new Error('Erro ao salvar medida');
      toast({ title: 'Sucesso', description: 'Medida salva com sucesso!' });
      setForm({ date: '', weight: '', height: '', headCircumference: '', notes: '' });
      setEditingId(null);
      fetchRecords();
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (rec: GrowthRecord) => {
    setForm({
      date: rec.date.slice(0, 10),
      weight: rec.weight.toString(),
      height: rec.height.toString(),
      headCircumference: rec.headCircumference?.toString() || '',
      notes: rec.notes || '',
    });
    setEditingId(rec.id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja realmente excluir esta medida?')) return;
    setSubmitting(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:3000/api/user/growth/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Erro ao excluir medida');
      toast({ title: 'Excluído', description: 'Medida removida.' });
      fetchRecords();
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="py-6">
        <h3 className="text-lg font-bold mb-4">Medidas de Crescimento</h3>
        {canEdit && (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-6">
            <div>
              <Label>Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={form.date ? 'default' : 'outline'}
                    className={cn('w-full justify-start text-left font-normal', !form.date && 'text-muted-foreground')}
                    type="button"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {form.date ? format(new Date(form.date), 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione a data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarPicker
                    mode="single"
                    selected={form.date ? new Date(form.date) : undefined}
                    onSelect={(date) => setForm({ ...form, date: date ? date.toISOString().split('T')[0] : '' })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Peso (kg)</Label>
              <Input type="number" name="weight" value={form.weight} onChange={handleChange} step="0.01" min="0" required />
            </div>
            <div>
              <Label>Altura (cm)</Label>
              <Input type="number" name="height" value={form.height} onChange={handleChange} step="0.1" min="0" required />
            </div>
            <div>
              <Label>Perímetro Cefálico (cm)</Label>
              <Input type="number" name="headCircumference" value={form.headCircumference} onChange={handleChange} step="0.1" min="0" />
            </div>
            <div className="flex flex-col justify-end gap-1">
              <Button type="submit" disabled={submitting} className="w-full">
                {editingId ? 'Atualizar' : 'Adicionar'}
              </Button>
              {editingId && (
                <Button type="button" variant="ghost" onClick={() => { setEditingId(null); setForm({ date: '', weight: '', height: '', headCircumference: '', notes: '' }); }}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        )}
        {loading ? (
          <div>Carregando...</div>
        ) : records.length === 0 ? (
          <div className="text-muted-foreground">Nenhuma medida registrada ainda.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="px-2 py-1">Data</th>
                  <th className="px-2 py-1">Peso (kg)</th>
                  <th className="px-2 py-1">Altura (cm)</th>
                  <th className="px-2 py-1">Perímetro Cefálico</th>
                  {canEdit && <th className="px-2 py-1">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => (
                  <tr key={rec.id} className="border-b">
                    <td className="px-2 py-1">{new Date(rec.date).toLocaleDateString('pt-BR')}</td>
                    <td className="px-2 py-1">{rec.weight}</td>
                    <td className="px-2 py-1">{rec.height}</td>
                    <td className="px-2 py-1">{rec.headCircumference || '-'}</td>
                    {canEdit && (
                      <td className="px-2 py-1 flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(rec)}>Editar</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(rec.id)}>Excluir</Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GrowthMeasurements; 