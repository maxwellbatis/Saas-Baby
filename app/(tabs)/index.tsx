import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Baby, Moon, Milk, Zap, Heart, TrendingUp, Calendar, Award, Plus, MoreVertical, Camera, MoreHorizontal, Sparkles, MessageCircle } from 'lucide-react-native';
import { useBabyContext } from '@/contexts/BabyContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { ActivityService } from '@/services/activityService';
import { MemoryService } from '@/services/memoryService';
import { MilestoneService } from '@/services/milestoneService';
import StatsCard from '@/components/StatsCard';
import QuickActionButton from '@/components/QuickActionButton';
import RecentActivity from '@/components/RecentActivity';
import AddActivityModal from '@/components/AddActivityModal';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48 - 16) / 2;

export default function HomeScreen() {
  const { selectedBaby, babies } = useBabyContext();
  const { colors } = useTheme();
  const router = useRouter();
  const [todayActivities, setTodayActivities] = useState<any[]>([]);
  const [memoriesCount, setMemoriesCount] = useState(0);
  const [milestonesCount, setMilestonesCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const fetchTodayActivities = async () => {
    if (!selectedBaby) return;

    try {
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      console.log('Buscando atividades do dia:', todayString, 'para bebê:', selectedBaby.id);

      const response = await ActivityService.getActivities({
        babyId: selectedBaby.id,
        startDate: todayString,
        endDate: todayString,
      });

      console.log('Resposta das atividades do dia:', response);
      if (response.success && response.data) {
        const responseData = response.data as any;
        let activities: any[] = [];
        
        if (responseData.activities && Array.isArray(responseData.activities)) {
          activities = responseData.activities;
        } else if (Array.isArray(responseData)) {
          activities = responseData;
        }
        
        console.log('Atividades do dia definidas como:', activities.length);
        setTodayActivities(activities);
      }
    } catch (error) {
      console.error('Erro ao buscar atividades do dia:', error);
    }
  };

  const fetchMemoriesCount = async () => {
    if (!selectedBaby) return;
    
    try {
      console.log('Buscando contagem de memórias para bebê:', selectedBaby.id);
      const response = await MemoryService.getMemories(selectedBaby.id, 1, 1);
      console.log('Resposta da contagem de memórias:', response);
      if (response.success && response.data) {
        const count = response.data.pagination?.total || 0;
        console.log('Contagem de memórias definida como:', count);
        setMemoriesCount(count);
      }
    } catch (error) {
      console.error('Erro ao buscar contagem de memórias:', error);
    }
  };

  const fetchMilestonesCount = async () => {
    if (!selectedBaby) return;
    
    try {
      console.log('Buscando contagem de marcos para bebê:', selectedBaby.id);
      const response = await MilestoneService.getMilestones({ babyId: selectedBaby.id });
      console.log('Resposta da contagem de marcos:', response);
      if (response.success) {
        const count = response.data?.length || 0;
        console.log('Contagem de marcos definida como:', count);
        setMilestonesCount(count);
      }
    } catch (error) {
      console.error('Erro ao buscar contagem de marcos:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchTodayActivities(),
      fetchMemoriesCount(),
      fetchMilestonesCount(),
    ]);
    setRefreshing(false);
  };

  useEffect(() => {
    onRefresh();
  }, [selectedBaby]);

  const getBabyPhotoUrl = (baby: any) => {
    if (baby.photoUrl && baby.photoUrl !== 'null' && baby.photoUrl !== 'undefined' && baby.photoUrl.trim() !== '') {
      const correctedUrl = baby.photoUrl.replace('http://localhost:3000', 'http://192.168.0.6:3000');
      return correctedUrl;
    }
    if (baby.photo && baby.photo !== 'null' && baby.photo !== 'undefined' && baby.photo.trim() !== '') {
      const correctedUrl = baby.photo.replace('http://localhost:3000', 'http://192.168.0.6:3000');
      return correctedUrl;
    }
    return null;
  };
  
  const calculateAge = (birthDate: string) => {
    try {
      const birth = new Date(birthDate);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - birth.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const months = Math.floor(diffDays / 30.44);
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      
      if (years > 0) {
        if (remainingMonths > 0) {
          return `${years} ano${years > 1 ? 's' : ''} e ${remainingMonths} mês${remainingMonths > 1 ? 'es' : ''}`;
        } else {
          return `${years} ano${years > 1 ? 's' : ''}`;
        }
      } else if (months > 0) {
        return `${months} mês${months > 1 ? 'es' : ''}`;
      } else {
        return `${diffDays} dia${diffDays > 1 ? 's' : ''}`;
      }
    } catch (error) {
      console.error('Erro ao calcular idade:', error);
      return 'Idade não disponível';
    }
  };

  const handleQuickAction = (type: string) => {
    setShowAddModal(true);
  };

  const handleActivityAdded = () => {
    fetchTodayActivities();
  };

  const handleQuickMilestone = () => {
    router.push('/(tabs)/milestones');
  };

  const handleQuickMemory = () => {
    router.push('/(tabs)/memories');
  };

  const babyPhotoUrl = getBabyPhotoUrl(selectedBaby);
  const babyAge = calculateAge(selectedBaby?.birthDate || '');

  // Debug log para atividades
  console.log('DEBUG - Atividades de hoje:', todayActivities.length, todayActivities);

  if (!selectedBaby) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.emptyState}>
            <Baby color={colors.textSecondary} size={64} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Nenhum bebê selecionado
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Selecione um bebê para começar
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={[styles.greeting, { color: colors.text }]}>
                Olá, Mamãe! 👋
              </Text>
              <Text style={[styles.welcome, { color: colors.textSecondary }]}>
                Como está o {selectedBaby?.name || 'bebê'} hoje?
              </Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={[styles.headerButton, { backgroundColor: colors.card }]}
                onPress={() => router.push('/manage-babies')}
              >
                <MoreHorizontal color={colors.text} size={24} />
            </TouchableOpacity>
            </View>
          </View>

          {/* Baby Selector */}
            <View style={styles.babySelector}>
            <TouchableOpacity
              style={[styles.babySelectorCard, { backgroundColor: colors.card }]}
              onPress={() => router.push('/manage-babies')}
            >
              {babyPhotoUrl ? (
                <Image source={{ uri: babyPhotoUrl }} style={styles.babyPhoto} />
              ) : (
                <View style={[styles.babyPhotoPlaceholder, { backgroundColor: colors.accent }]}>
                  <Baby color={colors.primary} size={20} />
                </View>
              )}
              <View style={styles.babyInfo}>
                <Text style={[styles.babyName, { color: colors.text }]}>{selectedBaby?.name || 'Bebê'}</Text>
                <Text style={[styles.babyAge, { color: colors.textSecondary }]}>{babyAge}</Text>
                </View>
              <View style={[styles.babyBadge, { backgroundColor: colors.accent }]}>
                <Text style={[styles.babyBadgeText, { color: colors.text }]}>
                  {selectedBaby?.gender === 'male' ? '👶' : '👧'}
                </Text>
              </View>
            </TouchableOpacity>
            </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <StatsCard
              icon={<Calendar color={colors.primary} size={24} />}
              title="Atividades"
              value={(todayActivities?.length || 0).toString()}
              subtitle="Hoje"
              color={colors.primary}
            />
            <StatsCard
              icon={<Heart color="#EF4444" size={24} />}
              title="Memórias"
              value={(memoriesCount || 0).toString()}
              subtitle="Total"
              color="#EF4444"
            />
            <StatsCard
              icon={<Award color="#F59E0B" size={24} />}
              title="Marcos"
              value={(milestonesCount || 0).toString()}
              subtitle="Alcançados"
              color="#F59E0B"
            />
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Ações Rápidas</Text>
            <View style={styles.quickActions}>
              <QuickActionButton
                icon={<Moon color="white" size={28} />}
                title="Sono"
                subtitle="Registrar"
                color={colors.primary}
                onPress={() => handleQuickAction('sleep')}
              />
              <QuickActionButton
                icon={<Milk color="white" size={28} />}
                title="Alimentação"
                subtitle="Registrar"
                color="#EF4444"
                onPress={() => handleQuickAction('feeding')}
              />
              <QuickActionButton
                icon={<Baby color="white" size={28} />}
                title="Fralda"
                subtitle="Trocar"
                color="#10B981"
                onPress={() => handleQuickAction('diaper')}
              />
              <QuickActionButton
                icon={<TrendingUp color="white" size={28} />}
                title="Peso"
                subtitle="Medir"
                color="#F59E0B"
                onPress={() => handleQuickAction('weight')}
              />
            </View>
            <View style={styles.quickActions}>
              <QuickActionButton
                icon={<Award color="white" size={28} />}
                title="Marcos"
                subtitle="Registrar"
                color="#8B5CF6"
                onPress={handleQuickMilestone}
              />
              <QuickActionButton
                icon={<Camera color="white" size={28} />}
                title="Memórias"
                subtitle="Criar"
                color="#EC4899"
                onPress={handleQuickMemory}
              />
              <QuickActionButton
                icon={<MessageCircle color="white" size={28} />}
                title="Assistente"
                subtitle="IA"
                color="#06B6D4"
                onPress={() => {
                  console.log('Botão IA clicado, navegando para ai-chat...');
                  router.push('/(tabs)/ai-chat');
                }}
              />
            </View>
          </View>

          {/* Recent Activities */}
          <View style={styles.recentContainer}>
            <View style={styles.recentHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Atividades Recentes</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/activities')}>
                <Text style={[styles.seeAllText, { color: colors.primary }]}>Ver todas</Text>
              </TouchableOpacity>
            </View>
            {todayActivities.length > 0 ? (
              todayActivities.slice(0, 3).map((activity, index) => (
                <RecentActivity key={activity.id || `activity-${index}`} activity={activity} />
              ))
            ) : (
              <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
                <Calendar color={colors.textSecondary} size={32} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Nenhuma atividade hoje
                </Text>
                <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                  Registre a primeira atividade do dia!
                </Text>
              </View>
            )}
          </View>

          {/* Daily Tip */}
          <View style={styles.tipContainer}>
            <View style={[styles.tipCard, { backgroundColor: colors.card, borderLeftColor: colors.primary }]}>
              <View style={[styles.tipIconContainer, { backgroundColor: colors.accent }]}>
                <Zap color={colors.primary} size={20} />
              </View>
              <Text style={[styles.tipTitle, { color: colors.text }]}>Dica do Dia</Text>
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                Bebês de {selectedBaby?.age || 6} meses precisam de 12-15 horas de sono por dia. 
                Mantenha uma rotina consistente para ajudar no desenvolvimento! 😴
              </Text>
            </View>
          </View>

          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Add Activity Modal */}
        <AddActivityModal
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
          onActivityAdded={handleActivityAdded}
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 10,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  welcome: {
    fontSize: 16,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  babySelector: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  babySelectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  babyPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
  },
  babyPhotoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  babyInfo: {
    flex: 1,
  },
  babyName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  babyAge: {
    fontSize: 14,
  },
  babyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  babyBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  recentContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyState: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  tipContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tipCard: {
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tipIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 20,
  },
});