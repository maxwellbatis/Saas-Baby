import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, Camera, X, Save } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useBabyContext } from '@/contexts/BabyContext';
import { MilestoneService, CreateMilestoneData } from '@/services/milestoneService';

interface AddMilestoneModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddMilestoneModal({ visible, onClose, onSuccess }: AddMilestoneModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'motor' | 'cognitive' | 'social' | 'language'>('motor');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { colors } = useTheme();
  const { selectedBaby } = useBabyContext();

  const categories = [
    { key: 'motor', label: 'Motor', icon: '💪' },
    { key: 'cognitive', label: 'Cognitivo', icon: '🧠' },
    { key: 'social', label: 'Social', icon: '👥' },
    { key: 'language', label: 'Linguagem', icon: '💬' },
  ];

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  const handleSave = async () => {
    if (!title.trim() || !selectedBaby) {
      Alert.alert('Preencha todos os campos obrigatórios!');
      return;
    }

    setIsLoading(true);
    let photoUrl = undefined;

    if (photo) {
      try {
        const uploadRes = await MilestoneService.uploadMilestonePhoto({
          uri: photo,
          type: 'image/jpeg',
          name: 'milestone.jpg',
        });
        if (uploadRes.success && uploadRes.data) {
          photoUrl = uploadRes.data.url;
        }
      } catch (e) {
        console.error('Erro no upload da foto:', e);
      }
    }

    const milestoneData: CreateMilestoneData = {
      title: title.trim(),
      description: description.trim(),
      babyId: selectedBaby.id,
      date: date.toISOString(),
      category,
      photoUrl,
    };

    const response = await MilestoneService.createMilestone(milestoneData);
    setIsLoading(false);

    if (response.success) {
      Alert.alert('Sucesso!', 'Marco registrado com sucesso!');
      onSuccess();
      onClose();
      // Limpar formulário
      setTitle('');
      setDescription('');
      setCategory('motor');
      setDate(new Date());
      setPhoto(null);
    } else {
      Alert.alert('Erro', response.error || 'Erro ao registrar marco');
    }
  };

  const handleCancel = () => {
    if (title.trim() || description.trim() || photo) {
      Alert.alert(
        'Cancelar',
        'Deseja cancelar? As informações serão perdidas.',
        [
          { text: 'Continuar editando', style: 'cancel' },
          { 
            text: 'Cancelar', 
            style: 'destructive',
            onPress: () => {
              onClose();
              setTitle('');
              setDescription('');
              setCategory('motor');
              setDate(new Date());
              setPhoto(null);
            }
          }
        ]
      );
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
            <X color={colors.text} size={24} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Novo Marco</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={isLoading}
            style={[styles.saveButton, { opacity: isLoading ? 0.5 : 1 }]}
          >
            <Save color={colors.primary} size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Foto */}
          <View style={styles.photoSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Foto (opcional)</Text>
            <TouchableOpacity style={[styles.photoContainer, { borderColor: colors.border }]} onPress={handlePickPhoto}>
              {photo ? (
                <Image source={{ uri: photo }} style={styles.photo} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Camera color={colors.textSecondary} size={32} />
                  <Text style={[styles.photoText, { color: colors.textSecondary }]}>Adicionar Foto</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Título */}
          <View style={styles.inputSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Título *</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
              placeholder="Ex: Primeiro sorriso"
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>

          {/* Descrição */}
          <View style={styles.inputSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Descrição</Text>
            <TextInput
              style={[styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
              placeholder="Descreva o marco alcançado..."
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>

          {/* Categoria */}
          <View style={styles.inputSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Categoria</Text>
            <View style={styles.categoriesContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.categoryButton,
                    { backgroundColor: colors.card },
                    category === cat.key && [styles.activeCategory, { backgroundColor: colors.primary }],
                  ]}
                  onPress={() => setCategory(cat.key as any)}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text
                    style={[
                      styles.categoryText,
                      { color: category === cat.key ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Data */}
          <View style={styles.inputSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Data</Text>
            <TouchableOpacity
              style={[styles.dateInput, { borderColor: colors.border, backgroundColor: colors.card }]}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={styles.dateInputContent}>
                <Calendar color={colors.textSecondary} size={20} />
                <Text style={[styles.dateText, { color: colors.text }]}>
                  {formatDate(date)}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Botões */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={handleCancel}
              disabled={isLoading}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButtonLarge, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Salvando...' : 'Salvar Marco'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
            minimumDate={new Date(2020, 0, 1)}
          />
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    padding: 8,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  photoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  photoPlaceholder: {
    alignItems: 'center',
    gap: 8,
  },
  photoText: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputSection: {
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    minWidth: 100,
  },
  activeCategory: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  dateInputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
    marginBottom: 40,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonLarge: {
    flex: 2,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
