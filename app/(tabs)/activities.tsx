import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Moon, Milk, Baby, TrendingUp, Calendar, Clock, Plus, Filter } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import ActivityCard from '@/components/ActivityCard';
import AddActivityModal from '@/components/AddActivityModal';
import { useBabyContext } from '@/contexts/BabyContext';
import { ActivityService } from '@/services/activityService';

export default function ActivitiesScreen() {
  const [selectedTab, setSelectedTab] = useState<'today' | 'week' | 'month'>('today');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();
  const { selectedBaby } = useBabyContext();

  const fetchActivities = async () => {
    if (!selectedBaby) {
      console.log('fetchActivities: Nenhum bebê selecionado');
      setActivities([]);
      return;
    }
    console.log('fetchActivities: Buscando atividades para bebê:', selectedBaby.id);
    console.log('fetchActivities: Tab selecionada:', selectedTab);
    
    setLoading(true);
    let response;
    if (selectedTab === 'today') {
      response = await ActivityService.getTodayActivities(selectedBaby.id);
    } else if (selectedTab === 'week') {
      response = await ActivityService.getWeekActivities(selectedBaby.id);
    } else {
      response = await ActivityService.getMonthActivities(selectedBaby.id);
    }
    
    console.log('fetchActivities: Resposta da API:', response);
    
    if (response && response.success) {
      // Verificar se a resposta tem a estrutura esperada
      const responseData = response.data as any;
      const activitiesData = responseData?.activities || response.data;
      
      if (Array.isArray(activitiesData)) {
        console.log('fetchActivities: Atividades encontradas:', activitiesData.length);
        console.log('fetchActivities: Dados das atividades:', activitiesData);
        setActivities(activitiesData);
      } else {
        console.log('fetchActivities: Estrutura de resposta inesperada:', response.data);
        setActivities([]);
      }
    } else {
      console.log('fetchActivities: Nenhuma atividade encontrada ou erro na resposta');
      setActivities([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchActivities();
  }, [selectedTab, selectedBaby]);

  // Função para converter dados da API para o formato do ActivityCard
  const mapActivity = (activity: any) => {
    let icon, color;
    switch (activity.type) {
      case 'sleep':
        icon = <Moon color={colors.primary} size={24} />;
        color = colors.primary;
        break;
      case 'feeding':
        icon = <Milk color="#EF4444" size={24} />;
        color = '#EF4444';
        break;
      case 'diaper':
        icon = <Baby color="#10B981" size={24} />;
        color = '#10B981';
        break;
      case 'weight':
        icon = <TrendingUp color="#F59E0B" size={24} />;
        color = '#F59E0B';
        break;
      default:
        icon = <Clock color={colors.primary} size={24} />;
        color = colors.primary;
    }
    
    // Extrair hora
    const time = activity.date ? new Date(activity.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
    
    return {
      id: activity.id,
      type: activity.type,
      title: activity.title,
      description: activity.description,
      date: activity.date,
      duration: activity.duration ? ActivityService.formatDuration(activity.duration.toString()) : undefined,
      amount: activity.amount ? `${activity.amount}ml` : undefined,
      time,
      notes: activity.notes,
      photoUrl: activity.photoUrl,
      tags: activity.tags || [],
      location: activity.location || {},
      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt,
      icon,
      color,
    };
  };

  // Função para calcular resumo do dia
  const calculateDailySummary = () => {
    if (!activities || activities.length === 0) {
      return {
        sleep: '0h 0min',
        feeding: '0 vezes',
        diaper: '0 trocas'
      };
    }

    const todayActivities = activities.filter(activity => {
      const activityDate = new Date(activity.date);
      const today = new Date();
      return activityDate.toDateString() === today.toDateString();
    });

    let totalSleepMinutes = 0;
    let feedingCount = 0;
    let diaperCount = 0;

    todayActivities.forEach(activity => {
      switch (activity.type) {
        case 'sleep':
          if (activity.duration) {
            totalSleepMinutes += parseInt(activity.duration.toString());
          }
          break;
        case 'feeding':
          feedingCount++;
          break;
        case 'diaper':
          diaperCount++;
          break;
      }
    });

    const sleepHours = Math.floor(totalSleepMinutes / 60);
    const sleepMinutes = totalSleepMinutes % 60;
    const sleepText = sleepHours > 0 ? `${sleepHours}h ${sleepMinutes}min` : `${sleepMinutes}min`;

    return {
      sleep: sleepText,
      feeding: `${feedingCount} vezes`,
      diaper: `${diaperCount} trocas`
    };
  };

  const dailySummary = calculateDailySummary();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Atividades</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={[styles.filterButton, { backgroundColor: colors.card }]}>
              <Filter color={colors.textSecondary} size={20} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.card }]}
              onPress={() => {
                console.log('Botão de adicionar atividade pressionado');
                setShowAddModal(true);
              }}
            >
              <Plus color={colors.primary} size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          {[
            { key: 'today', label: 'Hoje', icon: <Clock size={16} /> },
            { key: 'week', label: 'Semana', icon: <Calendar size={16} /> },
            { key: 'month', label: 'Mês', icon: <TrendingUp size={16} /> },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                { backgroundColor: colors.card },
                selectedTab === tab.key && [styles.activeTab, { backgroundColor: colors.accent }],
              ]}
              onPress={() => setSelectedTab(tab.key as any)}
            >
              <View style={styles.tabContent}>
                {React.cloneElement(tab.icon, { 
                  color: selectedTab === tab.key ? colors.primary : colors.textSecondary 
                })}
                <Text
                  style={[
                    styles.tabText,
                    { color: colors.textSecondary },
                    selectedTab === tab.key && [styles.activeTabText, { color: colors.primary }],
                  ]}
                >
                  {tab.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Activities List */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.activitiesContainer}>
            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 32 }} />
            ) : activities.length === 0 ? (
              <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 32 }}>Nenhuma atividade encontrada.</Text>
            ) : (
              activities.map((activity) => (
                <ActivityCard key={activity.id} activity={mapActivity(activity)} />
              ))
            )}
          </View>

          {/* Summary Card */}
          <View style={styles.summaryContainer}>
            <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.summaryTitle, { color: colors.text }]}>Resumo do Dia</Text>
              <View style={styles.summaryStats}>
                <View style={styles.summaryItem}>
                  <View style={[styles.summaryIcon, { backgroundColor: `${colors.primary}15` }]}>
                    <Moon color={colors.primary} size={16} />
                  </View>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Sono</Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>{dailySummary.sleep}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <View style={[styles.summaryIcon, { backgroundColor: '#EF444415' }]}>
                    <Milk color="#EF4444" size={16} />
                  </View>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Alimentação</Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>{dailySummary.feeding}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <View style={[styles.summaryIcon, { backgroundColor: '#10B98115' }]}>
                    <Baby color="#10B981" size={16} />
                  </View>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Fraldas</Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>{dailySummary.diaper}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>

        <AddActivityModal
          visible={showAddModal}
          onClose={() => {
            console.log('Fechando modal de atividade');
            setShowAddModal(false);
          }}
          onActivityAdded={fetchActivities}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  tab: {
    flex: 1,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  activitiesContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  summaryContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    gap: 8,
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 20,
  },
});