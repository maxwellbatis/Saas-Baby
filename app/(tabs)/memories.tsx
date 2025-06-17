import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Camera, Calendar, Tag, Plus, Search, Edit, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useBabyContext } from '@/contexts/BabyContext';
import { MemoryService, Memory } from '@/services/memoryService';
import AddMemoryModal from '@/components/AddMemoryModal';
import MemoryDetailModal from '@/components/MemoryDetailModal';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48 - 16) / 2;

export default function MemoriesScreen() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'photos' | 'videos' | 'notes'>('all');
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    withPhotos: 0,
    withVideos: 0,
    notes: 0,
  });

  const { colors } = useTheme();
  const { selectedBaby } = useBabyContext();

  const fetchMemories = async () => {
    if (!selectedBaby) {
      console.log('fetchMemories: Nenhum bebê selecionado');
      return;
    }

    try {
      console.log('fetchMemories: Iniciando busca de memórias para bebê:', selectedBaby.id);
      setLoading(true);
      const response = await MemoryService.getMemories(selectedBaby.id);
      console.log('fetchMemories: Resposta do serviço:', response);
      
      if (response.success && response.data) {
        console.log('fetchMemories: Memórias carregadas com sucesso:', response.data.memories?.length || 0);
        setMemories(response.data.memories);
        
        // Calcular estatísticas
        const total = response.data.memories.length;
        const withPhotos = response.data.memories.filter(m => m.photoUrl).length;
        const withVideos = 0; // Por enquanto não temos vídeos
        const notes = response.data.memories.filter(m => m.description && m.description.trim() !== '').length;
        setStats({ total, withPhotos, withVideos, notes });
        console.log('fetchMemories: Estatísticas atualizadas:', { total, withPhotos, withVideos, notes });
      } else {
        setMemories([]);
        setStats({ total: 0, withPhotos: 0, withVideos: 0, notes: 0 });
        console.error('fetchMemories: Erro ao buscar memórias:', response.error);
      }
    } catch (error: any) {
      setMemories([]);
      setStats({ total: 0, withPhotos: 0, withVideos: 0, notes: 0 });
      console.error('fetchMemories: Erro ao buscar memórias:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMemories();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchMemories();
  }, [selectedBaby]);

  const handleMemoryPress = (memory: Memory) => {
    setSelectedMemory(memory);
    setShowDetailModal(true);
  };

  const handleDeleteMemory = (memory: Memory) => {
    Alert.alert(
      'Excluir Memória',
      `Tem certeza que deseja excluir "${memory.title}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
    {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await MemoryService.deleteMemory(memory.id);
              if (response.success) {
                Alert.alert('Sucesso', 'Memória excluída com sucesso!');
                setShowDetailModal(false);
                setSelectedMemory(null);
                fetchMemories();
              } else {
                Alert.alert('Erro', response.error || 'Erro ao excluir memória');
              }
            } catch (error) {
              console.error('Erro ao excluir memória:', error);
              Alert.alert('Erro', 'Erro ao excluir memória');
            }
          },
    },
      ]
    );
  };

  const handleEditMemory = (memory: Memory) => {
    // TODO: Implementar edição de memória
    Alert.alert('Em desenvolvimento', 'Funcionalidade de edição será implementada em breve!');
  };

  const handleShareMemory = (memory: Memory) => {
    // TODO: Implementar compartilhamento de memória
    Alert.alert('Em desenvolvimento', 'Funcionalidade de compartilhamento será implementada em breve!');
  };

  const filters = [
    { key: 'all', label: 'Todas', icon: <Heart size={16} /> },
    { key: 'photos', label: 'Fotos', icon: <Camera size={16} /> },
    { key: 'videos', label: 'Vídeos', icon: <Calendar size={16} /> },
    { key: 'notes', label: 'Notas', icon: <Tag size={16} /> },
  ];

  const filteredMemories = memories.filter(memory => {
    if (selectedFilter === 'photos') return memory.photoUrl;
    if (selectedFilter === 'notes') return !memory.photoUrl;
    if (selectedFilter === 'videos') return false; // Por enquanto não temos vídeos
    return true;
  });

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      return dateString;
    }
  };

  if (!selectedBaby) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Nenhum bebê selecionado
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Selecione um bebê para ver suas memórias
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
          <Text style={[styles.title, { color: colors.text }]}>Memórias</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={[styles.headerButton, { backgroundColor: colors.accent }]}>
              <Search color={colors.text} size={24} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
            >
              <View style={[styles.addButtonGradient, { backgroundColor: colors.primary }]}>
                <Plus color="#fff" size={24} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.text }]}>{stats.total}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Memórias</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.text }]}>{stats.withPhotos}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Fotos</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.text }]}>{stats.notes}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Notas</Text>
            </View>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                  { backgroundColor: colors.card },
                  selectedFilter === filter.key && [styles.activeFilter, { backgroundColor: colors.primary }],
                ]}
                onPress={() => setSelectedFilter(filter.key as any)}
              >
                <View style={styles.filterContent}>
                  {React.cloneElement(filter.icon, {
                    color: selectedFilter === filter.key ? '#FFFFFF' : colors.textSecondary
                  })}
                  <Text
                    style={[
                      styles.filterText,
                      { color: selectedFilter === filter.key ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {filter.label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Memories Grid */}
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Carregando memórias...
              </Text>
            </View>
          ) : filteredMemories.length === 0 ? (
            <View style={styles.emptyState}>
              <Camera color={colors.textSecondary} size={64} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Nenhuma memória encontrada
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {selectedFilter === 'all' 
                  ? 'Crie sua primeira memória para começar a registrar momentos especiais'
                  : `Nenhuma memória do tipo "${selectedFilter}" encontrada`
                }
              </Text>
              {selectedFilter === 'all' && (
                <TouchableOpacity
                  style={[styles.emptyButton, { backgroundColor: colors.primary }]}
                  onPress={() => setShowAddModal(true)}
                >
                  <Text style={styles.emptyButtonText}>Criar Primeira Memória</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
          <View style={styles.memoriesGrid}>
              {filteredMemories.map((memory) => (
                <MemoryCard 
                  key={memory.id} 
                  memory={memory} 
                  width={cardWidth} 
                  colors={colors}
                  onPress={() => handleMemoryPress(memory)}
                  onEdit={() => handleEditMemory(memory)}
                  onDelete={() => handleDeleteMemory(memory)}
                />
            ))}
          </View>
          )}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>

      <AddMemoryModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchMemories}
      />

      <MemoryDetailModal
        visible={showDetailModal}
        memory={selectedMemory}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedMemory(null);
        }}
        onEdit={() => selectedMemory && handleEditMemory(selectedMemory)}
        onDelete={() => selectedMemory && handleDeleteMemory(selectedMemory)}
        onShare={() => selectedMemory && handleShareMemory(selectedMemory)}
      />
    </View>
  );
}

function MemoryCard({ 
  memory, 
  width, 
  colors, 
  onPress,
  onEdit, 
  onDelete 
}: { 
  memory: Memory; 
  width: number; 
  colors: any;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.memoryCard, { width, backgroundColor: colors.card }]}
      onPress={onPress}
    > 
      {memory.photoUrl ? (
        <Image 
          source={{ uri: memory.photoUrl }} 
          style={styles.memoryImage}
          onError={(error) => console.log('Erro ao carregar foto:', error)}
        />
      ) : (
        <View style={[styles.noteContent, { backgroundColor: colors.accent }]}>
          <Text style={[styles.noteText, { color: colors.textSecondary }]} numberOfLines={4}>
            {memory.description || 'Sem descrição'}
          </Text>
        </View>
      )}
      
      <View style={styles.memoryInfo}>
        <Text style={[styles.memoryTitle, { color: colors.text }]} numberOfLines={1}>
          {memory.title}
        </Text>
        <Text style={[styles.memoryDate, { color: colors.textSecondary }]}>
          {formatDate(memory.date)}
        </Text>
        
        <View style={styles.memoryFooter}>
          <View style={styles.memoryActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.accent }]}
              onPress={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit color={colors.primary} size={12} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.accent }]}
              onPress={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 color="#EF4444" size={12} />
            </TouchableOpacity>
          </View>
          
          {memory.tags && memory.tags.length > 0 && (
          <View style={styles.tags}>
            {memory.tags.slice(0, 2).map((tag: string, index: number) => (
                <View key={index} style={[styles.tag, { backgroundColor: colors.accent }]}>
                  <Text style={[styles.tagText, { color: colors.primary }]}>#{tag}</Text>
              </View>
            ))}
          </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    padding: 12,
    borderRadius: 12,
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addButtonGradient: {
    padding: 12,
  },
  statsContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statsCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  statDivider: {
    width: 1,
    height: '100%',
  },
  filtersContainer: {
    marginBottom: 24,
  },
  filtersScroll: {
    paddingHorizontal: 24,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  activeFilter: {
    // Estilo ativo já aplicado inline
  },
  filterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
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
  memoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  memoryCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 16,
  },
  memoryImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  noteContent: {
    width: '100%',
    height: 140,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  memoryInfo: {
    padding: 16,
  },
  memoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  memoryDate: {
    fontSize: 12,
    marginBottom: 12,
    opacity: 0.7,
  },
  memoryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memoryActions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
  },
  tags: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 24,
  },
});