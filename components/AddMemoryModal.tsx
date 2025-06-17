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
import { useTheme } from '@/contexts/ThemeContext';
import { useBabyContext } from '@/contexts/BabyContext';
import { MemoryService, CreateMemoryData } from '@/services/memoryService';
import { Calendar, Camera, X } from 'lucide-react-native';

interface AddMemoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddMemoryModal({ visible, onClose, onSuccess }: AddMemoryModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { colors } = useTheme();
  const { selectedBaby } = useBabyContext();

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
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
      Alert.alert('Preencha o título da memória!');
      return;
    }

    setIsLoading(true);
    let photoUrl = undefined;

    if (photo) {
      try {
        const uploadRes = await MemoryService.uploadMemoryPhoto({
          uri: photo,
          type: 'image/jpeg',
          name: 'memory.jpg',
        });
        if (uploadRes.success && uploadRes.data) {
          photoUrl = uploadRes.data.url;
        }
      } catch (e) {
        console.error('Erro no upload da foto:', e);
      }
    }

    const memoryData: CreateMemoryData = {
      title: title.trim(),
      description: description.trim(),
      babyId: selectedBaby.id,
      date: date.toISOString(),
      photoUrl,
    };

    const response = await MemoryService.createMemory(memoryData);
    setIsLoading(false);

    if (response.success && response.data) {
      Alert.alert('Sucesso!', 'Memória criada com sucesso!');
      setTitle('');
      setDescription('');
      setDate(new Date());
      setPhoto(null);
      onSuccess();
      onClose();
    } else {
      Alert.alert('Erro', response.error || 'Erro ao criar memória');
    }
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setDate(new Date());
    setPhoto(null);
    onClose();
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>Nova Memória</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={isLoading}
            style={[styles.saveButton, { opacity: isLoading ? 0.5 : 1 }]}
          >
            <Text style={[styles.saveButtonText, { color: colors.primary }]}>
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Photo Section */}
          <TouchableOpacity style={styles.photoSection} onPress={handlePickPhoto}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.photo} />
            ) : (
              <View style={[styles.photoPlaceholder, { backgroundColor: colors.accent }]}>
                <Camera color={colors.primary} size={32} />
                <Text style={[styles.photoText, { color: colors.textSecondary }]}>
                  Adicionar Foto
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Title Input */}
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            placeholder="Título da memória"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />

          {/* Date Picker */}
          <TouchableOpacity
            style={[styles.dateInput, { borderColor: colors.border }]}
            onPress={() => setShowDatePicker(true)}
          >
            <View style={styles.dateInputContent}>
              <Calendar color={colors.textSecondary} size={20} />
              <Text style={[styles.dateText, { color: colors.text }]}>
                {formatDate(date)}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Description Input */}
          <TextInput
            style={[styles.textArea, { color: colors.text, borderColor: colors.border }]}
            placeholder="Descreva esta memória especial..."
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={500}
          />

          {/* Character Count */}
          <Text style={[styles.charCount, { color: colors.textSecondary }]}>
            {description.length}/500
          </Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    padding: 24,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  photo: {
    width: 200,
    height: 150,
    borderRadius: 12,
  },
  photoPlaceholder: {
    width: 200,
    height: 150,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  photoText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  dateInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  dateInputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateText: {
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    marginBottom: 8,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    marginBottom: 20,
  },
}); 