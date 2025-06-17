import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Edit, Trash2, Baby, Calendar, User, Eye, EyeOff } from 'lucide-react-native';
import { useBabyContext } from '@/contexts/BabyContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { BabyService } from '@/services/babyService';
import * as ImagePicker from 'expo-image-picker';

export default function ManageBabiesScreen() {
  const { babies, addBaby } = useBabyContext();
  const { colors } = useTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Recarregar bebês do backend
      const response = await BabyService.getBabies();
      if (response.success) {
        console.log('Bebês recarregados:', response.data);
      }
    } catch (error) {
      console.error('Erro ao recarregar bebês:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleEditBaby = (baby: any) => {
    console.log('Tentando editar bebê:', baby.id);
    router.push(`/edit-baby?id=${baby.id}`);
  };

  const handleToggleBabyStatus = async (baby: any) => {
    const newStatus = !baby.isActive;
    const statusText = newStatus ? 'ativar' : 'desativar';
    
    Alert.alert(
      `${newStatus ? 'Ativar' : 'Desativar'} Bebê`,
      `Deseja ${statusText} ${baby.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: newStatus ? 'Ativar' : 'Desativar',
          onPress: async () => {
            try {
              const response = await BabyService.updateBaby({
                id: baby.id,
                isActive: newStatus
              });
              if (response.success) {
                Alert.alert('Sucesso', `Bebê ${statusText} com sucesso!`);
                onRefresh();
              } else {
                Alert.alert('Erro', `Erro ao ${statusText} bebê`);
              }
            } catch (error) {
              console.error('Erro ao alterar status do bebê:', error);
              Alert.alert('Erro', `Erro ao ${statusText} bebê`);
            }
          }
        }
      ]
    );
  };

  const handleDeleteBaby = (baby: any) => {
    Alert.alert(
      'Excluir Bebê',
      `Tem certeza que deseja excluir ${baby.name}? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Tentando excluir bebê:', baby.id);
              const response = await BabyService.deleteBaby(baby.id);
              console.log('Resposta da exclusão:', response);
              
              if (response.success) {
                Alert.alert('Sucesso', 'Bebê excluído com sucesso!');
                onRefresh();
              } else {
                Alert.alert('Erro', response.error || 'Erro ao excluir bebê');
              }
            } catch (error) {
              console.error('Erro ao excluir bebê:', error);
              Alert.alert('Erro', 'Erro ao excluir bebê');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    try {
      // Ajustar para timezone local
      const date = new Date(dateString);
      const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
      return localDate.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return dateString;
    }
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

  const getBabyPhotoUrl = (baby: any) => {
    // Verificar se tem foto e se a URL é válida
    if (baby.photoUrl && baby.photoUrl !== 'null' && baby.photoUrl !== 'undefined' && baby.photoUrl.trim() !== '') {
      console.log('URL da foto encontrada:', baby.photoUrl);
      // Corrigir URLs antigas que usam localhost
      const correctedUrl = baby.photoUrl.replace('http://localhost:3000', 'http://192.168.0.6:3000');
      return correctedUrl;
    }
    if (baby.photo && baby.photo !== 'null' && baby.photo !== 'undefined' && baby.photo.trim() !== '') {
      console.log('URL da foto (campo photo):', baby.photo);
      // Corrigir URLs antigas que usam localhost
      const correctedUrl = baby.photo.replace('http://localhost:3000', 'http://192.168.0.6:3000');
      return correctedUrl;
    }
    console.log('Nenhuma foto encontrada para:', baby.name);
    return null;
  };

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
            <Text style={[styles.title, { color: colors.text }]}>Gerenciar Bebês</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {babies.length} bebê{babies.length !== 1 ? 's' : ''} cadastrado{babies.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {/* Add Baby Button */}
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/add-baby')}
          >
            <Plus color="white" size={24} />
            <Text style={styles.addButtonText}>Adicionar Bebê</Text>
          </TouchableOpacity>

          {/* Babies List */}
          <View style={styles.babiesContainer}>
            {babies.length === 0 ? (
              <View style={styles.emptyState}>
                <Baby color={colors.textSecondary} size={64} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  Nenhum bebê cadastrado
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  Adicione seu primeiro bebê para começar a registrar memórias
                </Text>
                <TouchableOpacity
                  style={[styles.emptyButton, { backgroundColor: colors.primary }]}
                  onPress={() => router.push('/add-baby')}
                >
                  <Text style={styles.emptyButtonText}>Adicionar Primeiro Bebê</Text>
                </TouchableOpacity>
              </View>
            ) : (
              babies.map((baby, index) => {
                const photoUrl = getBabyPhotoUrl(baby);
                const isActive = baby.isActive !== false; // Default to true if not specified
                
                return (
                  <View key={baby.id} style={[
                    styles.babyCard, 
                    { 
                      backgroundColor: colors.card,
                      opacity: isActive ? 1 : 0.6
                    }
                  ]}>
                    {/* Baby Photo */}
                    <View style={styles.babyPhotoContainer}>
                      {photoUrl ? (
                        <Image 
                          source={{ uri: photoUrl }} 
                          style={styles.babyPhoto}
                          onError={(error) => console.log('Erro ao carregar foto:', error)}
                        />
                      ) : (
                        <View style={[styles.babyPhotoPlaceholder, { backgroundColor: colors.accent }]}>
                          <Baby color={colors.primary} size={32} />
                        </View>
                      )}
                      {!isActive && (
                        <View style={[styles.inactiveBadge, { backgroundColor: colors.textSecondary }]}>
                          <EyeOff color="white" size={12} />
                        </View>
                      )}
                    </View>

                    {/* Baby Info */}
                    <View style={styles.babyInfo}>
                      <View style={styles.babyHeader}>
                        <Text style={[styles.babyName, { color: colors.text }]}>{baby.name}</Text>
                        <View style={styles.babyActions}>
                          <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.accent }]}
                            onPress={() => handleToggleBabyStatus(baby)}
                          >
                            {isActive ? <Eye color={colors.primary} size={16} /> : <EyeOff color={colors.primary} size={16} />}
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.accent }]}
                            onPress={() => handleEditBaby(baby)}
                          >
                            <Edit color={colors.primary} size={16} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.accent }]}
                            onPress={() => handleDeleteBaby(baby)}
                          >
                            <Trash2 color="#EF4444" size={16} />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={styles.babyDetails}>
                        <View style={styles.detailItem}>
                          <Calendar color={colors.textSecondary} size={16} />
                          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                            {formatDate(baby.birthDate)}
                          </Text>
                        </View>
                        <View style={styles.detailItem}>
                          <User color={colors.textSecondary} size={16} />
                          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                            {baby.gender === 'male' ? 'Menino' : 'Menina'}
                          </Text>
                        </View>
                      </View>

                      <View style={[styles.ageContainer, { backgroundColor: colors.accent }]}>
                        <Text style={[styles.ageText, { color: colors.text }]}>
                          {calculateAge(baby.birthDate)}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
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
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  babiesContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
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
  babyCard: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  babyPhotoContainer: {
    marginRight: 16,
  },
  babyPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  babyPhotoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  babyInfo: {
    flex: 1,
  },
  babyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  babyName: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  babyActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
  },
  babyDetails: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  detailText: {
    fontSize: 14,
  },
  ageContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  ageText: {
    fontSize: 14,
    fontWeight: '600',
  },
  inactiveBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    borderRadius: 8,
  },
}); 