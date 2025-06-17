import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Moon, Milk, Baby, Gamepad2, Clock, TrendingUp } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface Activity {
  id: string;
  type: 'sleep' | 'feeding' | 'diaper' | 'weight' | 'play' | 'medical';
  title: string;
  date: string;
  duration?: string | number;
  amount?: string | number;
  notes?: string;
}

interface RecentActivityProps {
  activity: Activity;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'sleep':
      return <Moon color="#6366F1" size={20} />;
    case 'feeding':
      return <Milk color="#EF4444" size={20} />;
    case 'diaper':
      return <Baby color="#10B981" size={20} />;
    case 'weight':
      return <TrendingUp color="#F59E0B" size={20} />;
    case 'play':
      return <Gamepad2 color="#F59E0B" size={20} />;
    case 'medical':
      return <Clock color="#8B5CF6" size={20} />;
    default:
      return <Clock color="#6B7280" size={20} />;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'sleep':
      return '#6366F1';
    case 'feeding':
      return '#EF4444';
    case 'diaper':
      return '#10B981';
    case 'weight':
      return '#F59E0B';
    case 'play':
      return '#F59E0B';
    case 'medical':
      return '#8B5CF6';
    default:
      return '#6B7280';
  }
};

export default function RecentActivity({ activity }: RecentActivityProps) {
  const { colors } = useTheme();
  
  const formatTime = (date: string) => {
    try {
      if (!date) return '--:--';
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return '--:--';
      return dateObj.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Erro ao formatar hora:', error);
      return '--:--';
    }
  };

  const formatDuration = (duration?: string | number) => {
    try {
      if (!duration) return '';
      const minutes = parseInt(duration.toString());
      if (isNaN(minutes)) return '';
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      
      if (hours > 0) {
        return ` • ${hours}h ${remainingMinutes}min`;
      }
      return ` • ${remainingMinutes}min`;
    } catch (error) {
      console.error('Erro ao formatar duração:', error);
      return '';
    }
  };

  const activityColor = getActivityColor(activity.type || 'play');

  return (
    <TouchableOpacity style={styles.container}>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={[styles.iconContainer, { backgroundColor: `${activityColor}15` }]}>
          {getActivityIcon(activity.type || 'play')}
        </View>
        
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>{activity.title || 'Atividade'}</Text>
            <Text style={[styles.time, { color: colors.textSecondary }]}>
              {formatTime(activity.date || '')}{formatDuration(activity.duration || '')}
            </Text>
          </View>
          
          {activity.notes && activity.notes.trim() !== '' && (
            <Text style={[styles.notes, { color: colors.textSecondary }]} numberOfLines={1}>
              {activity.notes}
            </Text>
          )}
          
          {activity.amount !== undefined && activity.amount !== null && (
            <Text style={[styles.amount, { color: colors.textSecondary }]}>
              {String(activity.amount)}ml
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  time: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  notes: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  amount: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 2,
  },
});