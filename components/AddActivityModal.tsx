import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Moon, Milk, Baby, TrendingUp, FileText } from 'lucide-react-native';
import { useBabyContext } from '@/contexts/BabyContext';
import { ActivityService } from '@/services/activityService';
import { useTheme } from '@/contexts/ThemeContext';

interface AddActivityModalProps {
  visible: boolean;
  onClose: () => void;
  onActivityAdded?: () => void;
}

export default function AddActivityModal({ visible, onClose, onActivityAdded }: AddActivityModalProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [duration, setDuration] = useState('');
  const [amount, setAmount] = useState('');
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);
  const { selectedBaby } = useBabyContext();
  const { colors } = useTheme();

  const activityTypes = [
    {
      id: 'sleep',
      title: 'Sono',
      icon: <Moon color="white" size={24} />,
      gradient: ['#6366F1', '#8B5CF6'],
    },
    {
      id: 'feeding',
      title: 'Alimentação',
      icon: <Milk color="white" size={24} />,
      gradient: ['#EF4444', '#F97316'],
    },
    {
      id: 'diaper',
      title: 'Fralda',
      icon: <Baby color="white" size={24} />,
      gradient: ['#10B981', '#059669'],
    },
    {
      id: 'weight',
      title: 'Crescimento',
      icon: <TrendingUp color="white" size={24} />,
      gradient: ['#F59E0B', '#D97706'],
    },
  ];

  const resetForm = () => {
    setSelectedType(null);
    setTitle('');
    setNotes('');
    setDuration('');
    setAmount('');
    setWeight('');
  };

  const handleSave = async () => {
    if (!selectedType || !title.trim() || !selectedBaby) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const activityData = {
        babyId: selectedBaby.id,
        type: selectedType as any,
        title: title.trim(),
        notes: notes.trim() || undefined,
        date: new Date().toISOString(),
        duration: duration ? parseInt(duration, 10) : undefined,
        amount: amount ? parseInt(amount, 10) : undefined,
      };

      // Para atividades de peso, incluir o peso nas notas
      if (selectedType === 'weight' && weight) {
        activityData.notes = `Peso: ${weight}kg${notes ? ` - ${notes}` : ''}`;
      }

      console.log('Salvando atividade:', activityData);
      const response = await ActivityService.createActivity(activityData);
      
      if (response.success) {
        Alert.alert('Sucesso', 'Atividade adicionada com sucesso!');
        resetForm();
        onClose();
        onActivityAdded?.();
      } else {
        Alert.alert('Erro', response.error || 'Erro ao salvar atividade');
      }
    } catch (error) {
      console.error('Erro ao salvar atividade:', error);
      Alert.alert('Erro', 'Erro ao salvar atividade');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getDefaultTitle = (type: string) => {
    switch (type) {
      case 'sleep': return 'Sono';
      case 'feeding': return 'Alimentação';
      case 'diaper': return 'Troca de Fralda';
      case 'weight': return 'Pesagem';
      default: return '';
    }
  };

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    if (!title) {
      setTitle(getDefaultTitle(typeId));
    }
  };

  useEffect(() => {
    if (visible) {
      resetForm();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' }]}>
        <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.primary }]}>
          <LinearGradient
            colors={[colors.primary, colors.accent]}
            style={styles.gradient}
          >
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>Nova Atividade</Text>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <X color={colors.text} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Tipo de Atividade</Text>
                <View style={styles.typesGrid}>
                  {activityTypes.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.typeButton,
                        selectedType === type.id && { borderColor: colors.primary, backgroundColor: colors.background }
                      ]}
                      onPress={() => handleTypeSelect(type.id)}
                    >
                      <LinearGradient
                        colors={selectedType === type.id 
                          ? [colors.primary, colors.accent]
                          : [colors.card, colors.background]
                        }
                        style={styles.typeGradient}
                      >
                        <View style={styles.typeIcon}>
                          {React.cloneElement(type.icon, {
                            color: selectedType === type.id ? '#fff' : colors.textSecondary
                          })}
                        </View>
                        <Text style={[styles.typeTitle, { color: selectedType === type.id ? colors.primary : colors.textSecondary }]}> {type.title} </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {selectedType && (
                <>
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Título</Text>
                    <View style={[styles.inputContainer, { backgroundColor: colors.background }]}> 
                      <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Título da atividade"
                        placeholderTextColor={colors.textSecondary}
                        value={title}
                        onChangeText={setTitle}
                      />
                    </View>
                  </View>

                  {/* Campos específicos por tipo */}
                  {selectedType === 'sleep' && (
                    <View style={styles.section}>
                      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Duração (minutos)</Text>
                      <View style={[styles.inputContainer, { backgroundColor: colors.background }]}> 
                        <TextInput
                          style={[styles.input, { color: colors.text }]}
                          placeholder="Ex: 120"
                          placeholderTextColor={colors.textSecondary}
                          value={duration}
                          onChangeText={setDuration}
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                  )}

                  {selectedType === 'feeding' && (
                    <View style={styles.section}>
                      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Quantidade (ml)</Text>
                      <View style={[styles.inputContainer, { backgroundColor: colors.background }]}> 
                        <TextInput
                          style={[styles.input, { color: colors.text }]}
                          placeholder="Ex: 180"
                          placeholderTextColor={colors.textSecondary}
                          value={amount}
                          onChangeText={setAmount}
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                  )}

                  {selectedType === 'weight' && (
                    <View style={styles.section}>
                      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Peso (kg)</Text>
                      <View style={[styles.inputContainer, { backgroundColor: colors.background }]}> 
                        <TextInput
                          style={[styles.input, { color: colors.text }]}
                          placeholder="Ex: 6.8"
                          placeholderTextColor={colors.textSecondary}
                          value={weight}
                          onChangeText={setWeight}
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                  )}

                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Observações</Text>
                    <View style={[styles.notesContainer, { backgroundColor: colors.background }]}> 
                      <View style={styles.notesHeader}>
                        <FileText color={colors.textSecondary} size={20} />
                        <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>Adicionar notas</Text>
                      </View>
                      <TextInput
                        style={[styles.notesInput, { color: colors.text }]}
                        placeholder="Descreva detalhes sobre esta atividade..."
                        placeholderTextColor={colors.textSecondary}
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                      />
                    </View>
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, { backgroundColor: colors.background, borderColor: colors.primary }]}
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={[styles.cancelButtonText, { color: colors.primary }]}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.saveButton, (!selectedType || !title.trim() || loading) && styles.disabledButton]}
                onPress={handleSave}
                disabled={!selectedType || !title.trim() || loading}
              >
                <LinearGradient
                  colors={(!selectedType || !title.trim() || loading) ? [colors.border, colors.textSecondary] : [colors.primary, colors.accent]}
                  style={styles.saveButtonGradient}
                >
                  <Text style={[styles.saveButtonText, { color: '#fff' }]}> {loading ? 'Salvando...' : 'Salvar'} </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '95%',
    maxWidth: 420,
    maxHeight: '90%',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    alignSelf: 'center',
    padding: 0,
    backgroundColor: 'transparent',
    flex: 1,
  },
  gradient: {
    flex: 1,
    padding: 24,
    borderRadius: 24,
    minHeight: 0,
    justifyContent: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    marginLeft: 12,
    padding: 4,
  },
  content: {
    flexGrow: 1,
    minHeight: 0,
    marginBottom: 12,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  typeButton: {
    width: '48%',
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 10,
    overflow: 'hidden',
  },
  typeGradient: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
  typeIcon: {
    marginBottom: 6,
  },
  typeTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  inputContainer: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 0,
  },
  input: {
    fontSize: 16,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'transparent',
  },
  notesContainer: {
    borderRadius: 10,
    padding: 10,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  notesInput: {
    fontSize: 15,
    minHeight: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 8,
    backgroundColor: 'transparent',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 12,
    backgroundColor: 'transparent',
  },
  button: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginHorizontal: 0,
  },
  cancelButton: {
    borderWidth: 2,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    marginLeft: 0,
    padding: 0,
  },
  saveButtonGradient: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
});