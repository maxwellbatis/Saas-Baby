import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Bell, Clock, Baby, Utensils, Bath, Bed, Pill, Calendar, Settings, CheckCircle } from 'lucide-react';

interface Reminder {
  id: string;
  title: string;
  description: string;
  type: 'feeding' | 'sleep' | 'bath' | 'medication' | 'vaccine' | 'appointment' | 'milestone';
  time: string;
  isActive: boolean;
  isRecurring: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly';
  priority: 'low' | 'medium' | 'high';
  lastTriggered?: string;
}

interface SmartRemindersProps {
  reminders: Reminder[];
  onToggleReminder: (id: string, isActive: boolean) => void;
  onEditReminder: (reminder: Reminder) => void;
  onAddReminder: () => void;
}

const reminderIcons: Record<string, React.ReactNode> = {
  feeding: <Utensils className="w-4 h-4" />,
  sleep: <Bed className="w-4 h-4" />,
  bath: <Bath className="w-4 h-4" />,
  medication: <Pill className="w-4 h-4" />,
  vaccine: <Baby className="w-4 h-4" />,
  appointment: <Calendar className="w-4 h-4" />,
  milestone: <Bell className="w-4 h-4" />,
};

const priorityColors: Record<string, string> = {
  low: 'bg-green-100 text-green-800 border-green-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  high: 'bg-red-100 text-red-800 border-red-300',
};

const typeNames: Record<string, string> = {
  feeding: 'Alimentação',
  sleep: 'Sono',
  bath: 'Banho',
  medication: 'Medicamento',
  vaccine: 'Vacina',
  appointment: 'Consulta',
  milestone: 'Marco',
};

export const SmartReminders: React.FC<SmartRemindersProps> = ({
  reminders,
  onToggleReminder,
  onEditReminder,
  onAddReminder
}) => {
  const [showCompleted, setShowCompleted] = useState(false);

  const activeReminders = reminders.filter(r => r.isActive);
  const completedReminders = reminders.filter(r => !r.isActive);

  const getNextReminder = () => {
    const now = new Date();
    const today = now.toDateString();
    
    return activeReminders
      .filter(r => {
        const reminderTime = new Date(`${today} ${r.time}`);
        return reminderTime > now;
      })
      .sort((a, b) => {
        const timeA = new Date(`${today} ${a.time}`);
        const timeB = new Date(`${today} ${b.time}`);
        return timeA.getTime() - timeB.getTime();
      })[0];
  };

  const nextReminder = getNextReminder();

  return (
    <div className="space-y-4">
      {/* Próximo Lembrete */}
      {nextReminder && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-800 text-lg">
              <Clock className="w-5 h-5" />
              Próximo Lembrete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  {reminderIcons[nextReminder.type]}
                </div>
                <div>
                  <p className="font-medium text-blue-900">{nextReminder.title}</p>
                  <p className="text-sm text-blue-700">{nextReminder.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-800">{nextReminder.time}</p>
                <Badge className={priorityColors[nextReminder.priority]}>
                  {nextReminder.priority === 'high' ? 'Alta' : nextReminder.priority === 'medium' ? 'Média' : 'Baixa'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lembretes Ativos */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Lembretes Ativos ({activeReminders.length})
            </CardTitle>
            <Button variant="outline" size="sm" onClick={onAddReminder}>
              <Settings className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeReminders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum lembrete ativo</p>
              <p className="text-sm">Adicione lembretes para não perder nada importante!</p>
            </div>
          ) : (
            activeReminders.map((reminder) => (
              <div key={reminder.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border">
                    {reminderIcons[reminder.type]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{reminder.title}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-3 h-3" />
                      {reminder.time}
                      {reminder.isRecurring && (
                        <Badge variant="outline" className="text-xs">
                          {reminder.frequency === 'daily' ? 'Diário' : 
                           reminder.frequency === 'weekly' ? 'Semanal' : 'Mensal'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={priorityColors[reminder.priority]}>
                    {reminder.priority === 'high' ? 'Alta' : reminder.priority === 'medium' ? 'Média' : 'Baixa'}
                  </Badge>
                  <Switch
                    checked={reminder.isActive}
                    onCheckedChange={(checked) => onToggleReminder(reminder.id, checked)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditReminder(reminder)}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Lembretes Concluídos */}
      {completedReminders.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Lembretes Concluídos ({completedReminders.length})
              </CardTitle>
              <Switch
                checked={showCompleted}
                onCheckedChange={setShowCompleted}
              />
            </div>
          </CardHeader>
          {showCompleted && (
            <CardContent className="space-y-3">
              {completedReminders.map((reminder) => (
                <div key={reminder.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg opacity-75">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    {reminderIcons[reminder.type]}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-600 line-through">{reminder.title}</p>
                    <p className="text-sm text-gray-500">{reminder.time}</p>
                  </div>
                  <Badge variant="outline" className="text-gray-500">
                    Concluído
                  </Badge>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}; 