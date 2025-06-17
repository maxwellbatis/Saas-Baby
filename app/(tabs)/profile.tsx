import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Settings, Crown, Share2, Bell, Shield, HelpCircle, LogOut, Edit, Camera, Baby, Palette, Users, Calendar, Heart, Star } from 'lucide-react-native';
import { useBabyContext } from '@/contexts/BabyContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import ThemeSelector from '@/components/ThemeSelector';
import * as ImagePicker from 'expo-image-picker';
import { BabyService } from '@/services/babyService';
import { MemoryService } from '@/services/memoryService';
import { MilestoneService } from '@/services/milestoneService';

export default function ProfileScreen() {
  const { user: babyUser, babies, totalPoints, selectedBaby, refreshPoints } = useBabyContext();
  const { user: authUser, logout, updateUser } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const [showBabySelector, setShowBabySelector] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userPhoto, setUserPhoto] = useState<string | null>(authUser?.avatarUrl || null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [memoriesCount, setMemoriesCount] = useState(0);
  const [milestonesCount, setMilestonesCount] = useState(0);

  const user = authUser || babyUser;

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

  const handlePickUserPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsUploadingPhoto(true);
        
        const uploadRes = await BabyService.uploadBabyPhoto({
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'user-profile.jpg',
        });

        if (uploadRes.success && uploadRes.data) {
          const updateRes = await updateUser({ photoUrl: uploadRes.data.url });
          if (updateRes.success) {
            setUserPhoto(uploadRes.data.url);
            console.log('Foto atualizada com sucesso:', uploadRes.data.url);
            console.log('authUser após atualização:', authUser);
            Alert.alert('Sucesso', 'Foto de perfil atualizada com sucesso!');
          } else {
            console.error('Erro ao atualizar usuário:', updateRes.message);
            Alert.alert('Erro', 'Erro ao atualizar foto de perfil');
          }
        } else {
          console.error('Erro no upload:', uploadRes);
          Alert.alert('Erro', 'Erro ao fazer upload da foto');
        }
      }
    } catch (error) {
      console.error('Erro ao selecionar foto:', error);
      Alert.alert('Erro', 'Erro ao selecionar foto');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const babiesResponse = await BabyService.getBabies();
      if (babiesResponse.success) {
        console.log('Dados recarregados com sucesso');
      }
      await fetchMemoriesCount();
      await fetchMilestonesCount();
      await refreshPoints();
    } catch (error) {
      console.error('Erro ao recarregar dados:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getUserPhotoUrl = (): string | undefined => {
    console.log('=== DEBUG FOTO USUÁRIO ===');
    console.log('userPhoto:', userPhoto);
    console.log('authUser?.avatarUrl:', authUser?.avatarUrl);
    
    // Verificar se tem foto no estado local
    if (userPhoto && userPhoto !== 'null' && userPhoto !== 'undefined' && userPhoto.trim() !== '') {
      const correctedUrl = userPhoto.replace('http://localhost:3000', 'http://192.168.0.6:3000');
      console.log('URL da foto (estado local):', correctedUrl);
      return correctedUrl;
    }
    
    // Verificar se tem foto no objeto authUser
    if (authUser?.avatarUrl && authUser.avatarUrl !== 'null' && authUser.avatarUrl !== 'undefined' && authUser.avatarUrl.trim() !== '') {
      const correctedUrl = authUser.avatarUrl.replace('http://localhost:3000', 'http://192.168.0.6:3000');
      console.log('URL da foto (objeto authUser):', correctedUrl);
      return correctedUrl;
    }
    
    console.log('Nenhuma foto encontrada');
    console.log('=== FIM DEBUG FOTO USUÁRIO ===');
    return undefined;
  };

  const menuItems = [
    {
      id: 'babies',
      title: 'Gerenciar Bebês',
      subtitle: 'Adicionar, editar ou remover bebês',
      icon: <Baby color={colors.textSecondary} size={24} />,
      onPress: () => router.push('/manage-babies'),
    },
    {
      id: 'memories',
      title: 'Memórias',
      subtitle: 'Visualizar e gerenciar memórias',
      icon: <Heart color="#EF4444" size={24} />,
      onPress: () => router.push('/(tabs)/memories'),
    },
    {
      id: 'theme',
      title: 'Tema do App',
      subtitle: 'Personalize as cores',
      icon: <Palette color={colors.primary} size={24} />,
      onPress: () => {},
    },
    {
      id: 'settings',
      title: 'Configurações',
      subtitle: 'Preferências do app',
      icon: <Settings color={colors.textSecondary} size={24} />,
      onPress: () => {},
    },
    {
      id: 'premium',
      title: 'Plano Premium',
      subtitle: 'Desbloqueie recursos exclusivos',
      icon: <Crown color="#FFE66D" size={24} />,
      badge: 'Novo',
      onPress: () => {},
    },
    {
      id: 'share',
      title: 'Compartilhar App',
      subtitle: 'Convide amigos e familiares',
      icon: <Share2 color={colors.primary} size={24} />,
      onPress: () => {},
    },
    {
      id: 'notifications',
      title: 'Notificações',
      subtitle: 'Configurar lembretes e alertas',
      icon: <Bell color={colors.textSecondary} size={24} />,
      onPress: () => {},
    },
    {
      id: 'privacy',
      title: 'Privacidade',
      subtitle: 'Configurações de segurança',
      icon: <Shield color={colors.textSecondary} size={24} />,
      onPress: () => {},
    },
    {
      id: 'family',
      title: 'Família',
      subtitle: 'Compartilhar com familiares',
      icon: <Users color={colors.textSecondary} size={24} />,
      onPress: () => {},
    },
    {
      id: 'help',
      title: 'Ajuda',
      subtitle: 'Suporte e FAQ',
      icon: <HelpCircle color={colors.textSecondary} size={24} />,
      onPress: () => {},
    },
  ];

  const achievements = [
    { 
      title: 'Primeiro Marco', 
      description: '1º marco alcançado', 
      emoji: '🏆',
      unlocked: milestonesCount > 0 
    },
    { 
      title: 'Memória Especial', 
      description: `${memoriesCount} memórias criadas`, 
      emoji: '📸',
      unlocked: memoriesCount > 0 
    },
    { 
      title: 'Dedicação', 
      description: '30 dias consecutivos', 
      emoji: '🔥',
      unlocked: memoriesCount >= 30 
    },
    { 
      title: 'Família Unida', 
      description: 'Compartilhou com familiares', 
      emoji: '👨‍👩‍👧‍👦',
      unlocked: babies.length > 1 
    },
  ].filter(achievement => achievement.unlocked);

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

  // Buscar número de memórias
  const fetchMemoriesCount = async () => {
    if (!selectedBaby) return;
    
    try {
      const response = await MemoryService.getMemories(selectedBaby.id);
      if (response.success && response.data) {
        setMemoriesCount(response.data.memories?.length || 0);
      }
    } catch (error) {
      console.error('Erro ao buscar número de memórias:', error);
    }
  };

  // Buscar número de marcos
  const fetchMilestonesCount = async () => {
    if (!selectedBaby) return;
    
    try {
      const response = await MilestoneService.getMilestones({ babyId: selectedBaby.id });
      if (response.success) {
        setMilestonesCount(response.data?.length || 0);
      }
    } catch (error) {
      console.error('Erro ao buscar número de marcos:', error);
    }
  };

  useEffect(() => {
    fetchMemoriesCount();
    fetchMilestonesCount();
    refreshPoints();
  }, [selectedBaby]);

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
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              {getUserPhotoUrl() ? (
                <Image 
                  source={{ uri: getUserPhotoUrl() }} 
                  style={styles.profileImage}
                />
              ) : (
                <View style={[styles.profileImageGradient, { backgroundColor: colors.primary }]}>
                  <User color="#FFFFFF" size={40} />
                </View>
              )}
              <TouchableOpacity 
                style={[styles.editImageButton, { backgroundColor: colors.primary }]}
                onPress={handlePickUserPhoto}
                disabled={isUploadingPhoto}
              >
                <Camera color="white" size={16} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.profileInfo}>
              <View style={styles.nameContainer}>
                <Text style={[styles.userName, { color: colors.text }]}>{user?.name || 'Usuário'}</Text>
                <TouchableOpacity style={styles.editButton}>
                  <Edit color={colors.primary} size={16} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email || 'email@exemplo.com'}</Text>
              <View style={[styles.userStats, { backgroundColor: colors.accent }]}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.text }]}>{totalPoints}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pontos</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.text }]}>{babies.length}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Bebês</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.text }]}>{memoriesCount}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Memórias</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Selected Baby */}
          {selectedBaby && (
            <View style={styles.selectedBabyContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Bebê Selecionado</Text>
              <View style={[styles.selectedBabyCard, { backgroundColor: colors.card }]}>
                {getBabyPhotoUrl(selectedBaby) ? (
                  <Image 
                    source={{ uri: getBabyPhotoUrl(selectedBaby) }} 
                    style={styles.selectedBabyPhoto}
                  />
                ) : (
                  <View style={[styles.selectedBabyPhotoPlaceholder, { backgroundColor: colors.accent }]}>
                    <Baby color={colors.primary} size={32} />
                  </View>
                )}
                <View style={styles.selectedBabyInfo}>
                  <Text style={[styles.selectedBabyName, { color: colors.text }]}>{selectedBaby.name}</Text>
                  <Text style={[styles.selectedBabyAge, { color: colors.textSecondary }]}>{calculateAge(selectedBaby.birthDate)}</Text>
                  <Text style={[styles.selectedBabyGender, { color: colors.textSecondary }]}>
                    {selectedBaby.gender === 'male' ? 'Menino' : 'Menina'}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={[styles.editBabyButton, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    console.log('Tentando editar bebê do perfil:', selectedBaby?.id);
                    if (selectedBaby?.id) {
                      router.push(`/edit-baby?id=${selectedBaby.id}`);
                    } else {
                      console.error('selectedBaby não tem ID');
                    }
                  }}
                >
                  <Edit color="white" size={16} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Theme Selector */}
          <ThemeSelector />

          {/* Achievements */}
          <View style={styles.achievementsContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Conquistas Recentes</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achievementsScroll}>
              {achievements.map((achievement, index) => (
                <TouchableOpacity key={index} style={styles.achievementCard}>
                  <View style={[styles.achievementGradient, { backgroundColor: colors.accent }]}>
                    <Text style={styles.achievementEmoji}>{achievement.emoji}</Text>
                    <Text style={[styles.achievementTitle, { color: colors.text }]}>{achievement.title}</Text>
                    <Text style={[styles.achievementDescription, { color: colors.textSecondary }]}>{achievement.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Menu Items */}
          <View style={styles.menuContainer}>
            {menuItems.map((item) => (
              <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.onPress}>
                <View style={[styles.menuItemGradient, { backgroundColor: colors.card }]}>
                  <View style={[styles.menuItemIcon, { backgroundColor: colors.accent }]}>
                    {item.icon}
                  </View>
                  <View style={styles.menuItemContent}>
                    <View style={styles.menuItemHeader}>
                      <Text style={[styles.menuItemTitle, { color: colors.text }]}>{item.title}</Text>
                      {item.badge && (
                        <View style={styles.menuItemBadge}>
                          <Text style={styles.menuItemBadgeText}>{item.badge}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout Button */}
          <View style={styles.logoutContainer}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Sair</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacing} />
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
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 30,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImageGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  profileInfo: {
    alignItems: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  editButton: {
    padding: 4,
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 16,
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 20,
    marginHorizontal: 16,
  },
  achievementsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  achievementsScroll: {
    gap: 12,
  },
  achievementCard: {
    width: 120,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  achievementGradient: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  achievementEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 12,
  },
  menuContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  menuItem: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  menuItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  menuItemIcon: {
    marginRight: 12,
  },
  menuItemBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  menuItemBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  logoutContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 20,
  },
  selectedBabyContainer: {
    padding: 20,
  },
  selectedBabyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  selectedBabyPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  selectedBabyPhotoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBabyInfo: {
    flex: 1,
  },
  selectedBabyName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  selectedBabyAge: {
    fontSize: 14,
    marginBottom: 4,
  },
  selectedBabyGender: {
    fontSize: 14,
  },
  editBabyButton: {
    padding: 8,
    borderRadius: 12,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
});