import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Star, Calendar, CheckCircle, Circle, Target, Award, TrendingUp, Plus, Image as ImageIcon } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useBabyContext } from '@/contexts/BabyContext';
import { MilestoneService, Milestone } from '@/services/milestoneService';
import AddMilestoneModal from '@/components/AddMilestoneModal';

export default function MilestonesScreen() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'motor' | 'cognitive' | 'social' | 'language'>('all');
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const { colors } = useTheme();
  const { selectedBaby } = useBabyContext();

  const categories = [
    { key: 'all', label: 'Todos', icon: <Trophy size={16} /> },
    { key: 'motor', label: 'Motor', icon: <Target size={16} /> },
    { key: 'cognitive', label: 'Cognitivo', icon: <Star size={16} /> },
    { key: 'social', label: 'Social', icon: <Award size={16} /> },
    { key: 'language', label: 'Linguagem', icon: <TrendingUp size={16} /> },
  ];

  const loadMilestones = async () => {
    if (!selectedBaby) return;

    try {
      const filters: any = { babyId: selectedBaby.id };
      if (selectedCategory !== 'all') {
        filters.category = selectedCategory;
      }

      const response = await MilestoneService.getMilestones(filters);
      
      if (response.success) {
        setMilestones(response.data || []);
      } else {
        console.error('Erro ao carregar marcos:', response.error);
      }
    } catch (error) {
      console.error('Erro ao carregar marcos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMilestones();
    setRefreshing(false);
  };

  useEffect(() => {
    loadMilestones();
  }, [selectedBaby, selectedCategory]);

  const handleAddMilestone = () => {
    if (!selectedBaby) {
      Alert.alert('Erro', 'Selecione um bebê primeiro');
      return;
    }
    setShowAddModal(true);
  };

  const handleMilestoneSuccess = () => {
    loadMilestones();
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'Data não disponível';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Data inválida';
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'motor': return '💪';
      case 'cognitive': return '🧠';
      case 'social': return '👥';
      case 'language': return '💬';
      default: return '🎯';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'motor': return '#10B981';
      case 'cognitive': return '#3B82F6';
      case 'social': return '#8B5CF6';
      case 'language': return '#F59E0B';
      default: return colors.primary;
    }
  };

  const completedMilestones = milestones.length;
  const totalPoints = completedMilestones * 50; // 50 pontos por marco

  if (!selectedBaby) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.emptyState}>
            <Trophy color={colors.textSecondary} size={64} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Selecione um bebê
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Escolha um bebê para ver seus marcos
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Marcos</Text>
          <View style={styles.headerBadge}>
            <LinearGradient
              colors={[colors.card, colors.accent]}
              style={styles.badgeGradient}
            >
              <Trophy color={colors.primary} size={20} />
              <Text style={[styles.badgeText, { color: colors.text }]}>{totalPoints}</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Progress Stats */}
        <View style={styles.statsContainer}>
          <LinearGradient
            colors={[colors.card, colors.accent]}
            style={styles.statsCard}
          >
            <View style={styles.progressContainer}>
              <View style={styles.progressInfo}>
                <Text style={[styles.progressTitle, { color: colors.text }]}>Progresso Geral</Text>
                <Text style={[styles.progressSubtitle, { color: colors.textSecondary }]}>
                  {completedMilestones} marco{completedMilestones !== 1 ? 's' : ''} registrado{completedMilestones !== 1 ? 's' : ''}
                </Text>
              </View>
              <View style={[styles.progressCircle, { backgroundColor: colors.primary }]}>
                <Text style={[styles.progressPercentage, { color: '#FFFFFF' }]}>
                  {completedMilestones}
                </Text>
              </View>
            </View>
            
            <View style={styles.achievementsContainer}>
              <View style={styles.achievement}>
                <CheckCircle color="#10B981" size={20} />
                <Text style={[styles.achievementText, { color: colors.textSecondary }]}>Campeão!</Text>
              </View>
              <View style={styles.achievement}>
                <Star color="#F59E0B" size={20} />
                <Text style={[styles.achievementText, { color: colors.textSecondary }]}>Em dia</Text>
              </View>
              <View style={styles.achievement}>
                <Award color="#8B5CF6" size={20} />
                <Text style={[styles.achievementText, { color: colors.textSecondary }]}>Superstar</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Add Milestone Button */}
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={handleAddMilestone}
        >
          <Plus color="white" size={24} />
          <Text style={styles.addButtonText}>Adicionar Marco</Text>
        </TouchableOpacity>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.key}
                style={[
                  styles.categoryButton,
                  { backgroundColor: colors.card },
                  selectedCategory === category.key && [styles.activeCategory, { backgroundColor: colors.primary }],
                ]}
                onPress={() => setSelectedCategory(category.key as any)}
              >
                <View style={styles.categoryContent}>
                  {React.cloneElement(category.icon, {
                    color: selectedCategory === category.key ? '#FFFFFF' : colors.textSecondary
                  })}
                  <Text
                    style={[
                      styles.categoryText,
                      { color: selectedCategory === category.key ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {category.label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Milestones List */}
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.milestonesContainer}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Carregando marcos...</Text>
              </View>
            ) : milestones.length === 0 ? (
              <View style={styles.emptyState}>
                <Trophy color={colors.textSecondary} size={64} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  Nenhum marco registrado
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  Registre o primeiro marco do {selectedBaby.name}
                </Text>
                <TouchableOpacity
                  style={[styles.emptyButton, { backgroundColor: colors.primary }]}
                  onPress={handleAddMilestone}
                >
                  <Text style={styles.emptyButtonText}>Adicionar Primeiro Marco</Text>
                </TouchableOpacity>
              </View>
            ) : (
              milestones.map((milestone) => (
                <MilestoneCard key={milestone.id} milestone={milestone} colors={colors} />
              ))
            )}
          </View>
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>

      {/* Add Milestone Modal */}
      <AddMilestoneModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleMilestoneSuccess}
      />
    </View>
  );
}

function MilestoneCard({ milestone, colors }: { milestone: Milestone; colors: any }) {
  const categoryColor = getCategoryColor(milestone.category || 'motor');
  const categoryIcon = getCategoryIcon(milestone.category || 'motor');

  return (
    <TouchableOpacity style={styles.milestoneCard}>
      <LinearGradient
        colors={[colors.accent, colors.card]}
        style={styles.milestoneCardGradient}
      >
        <View style={styles.milestoneHeader}>
          <View style={[styles.milestoneIcon, { backgroundColor: categoryColor }]}>
            <Text style={styles.milestoneEmoji}>{categoryIcon}</Text>
          </View>
          
          <View style={styles.milestoneInfo}>
            <Text style={[styles.milestoneTitle, { color: colors.text }]}>{milestone.title || 'Sem título'}</Text>
            <Text style={[styles.milestoneCategory, { color: categoryColor }]}>
              {(milestone.category || 'motor').charAt(0).toUpperCase() + (milestone.category || 'motor').slice(1)}
            </Text>
          </View>
          
          <View style={styles.milestoneStatus}>
            <CheckCircle color="#10B981" size={24} fill="#10B981" />
          </View>
        </View>
        
        {milestone.description && (
          <Text style={[styles.milestoneDescription, { color: colors.textSecondary }]}>
            {milestone.description}
          </Text>
        )}
        
        <View style={styles.milestoneFooter}>
          <View style={styles.milestonePoints}>
            <Star color="#F59E0B" size={16} fill="#F59E0B" />
            <Text style={[styles.pointsText, { color: '#F59E0B' }]}>50 pontos</Text>
          </View>
          
          <View style={styles.completedDate}>
            <Calendar color="#10B981" size={16} />
            <Text style={[styles.completedDateText, { color: '#10B981' }]}>
              {formatDate(milestone.date || '')}
            </Text>
          </View>
        </View>

        {milestone.photoUrl && (
          <View style={styles.photoIndicator}>
            <ImageIcon color={colors.textSecondary} size={16} />
            <Text style={[styles.photoText, { color: colors.textSecondary }]}>Com foto</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

function getCategoryColor(category: string) {
  switch (category) {
    case 'motor': return '#10B981';
    case 'cognitive': return '#3B82F6';
    case 'social': return '#8B5CF6';
    case 'language': return '#F59E0B';
    default: return '#6B7280';
  }
}

function getCategoryIcon(category: string) {
  switch (category) {
    case 'motor': return '💪';
    case 'cognitive': return '🧠';
    case 'social': return '👥';
    case 'language': return '💬';
    default: return '🎯';
  }
}

function formatDate(dateString: string) {
  try {
    if (!dateString) return 'Data não disponível';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Data inválida';
    return date.toLocaleDateString('pt-BR');
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Data inválida';
  }
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
  headerBadge: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  badgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsCard: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  achievementsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  achievement: {
    alignItems: 'center',
    gap: 4,
  },
  achievementText: {
    fontSize: 12,
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoriesScroll: {
    gap: 8,
  },
  categoryButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  activeCategory: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  milestonesContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  milestoneCard: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  milestoneCardGradient: {
    padding: 16,
    borderRadius: 16,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  milestoneIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  milestoneEmoji: {
    fontSize: 24,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  milestoneCategory: {
    fontSize: 14,
    fontWeight: '600',
  },
  milestoneStatus: {
    marginLeft: 8,
  },
  milestoneDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  milestoneFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  milestonePoints: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '600',
  },
  completedDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completedDateText: {
    fontSize: 14,
    fontWeight: '600',
  },
  photoIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  photoText: {
    fontSize: 12,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 20,
  },
});