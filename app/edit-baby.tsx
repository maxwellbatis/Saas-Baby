import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BabyService } from '@/services/babyService';
import { useTheme } from '@/contexts/ThemeContext';
import { useBabyContext } from '@/contexts/BabyContext';
import { Calendar } from 'lucide-react-native';

export default function EditBabyScreen() {
  const { id } = useLocalSearchParams();
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const router = useRouter();
  const { colors } = useTheme();
  const { updateBaby } = useBabyContext();

  useEffect(() => {
    if (id) {
      loadBabyData();
    }
  }, [id]);

  const loadBabyData = async () => {
    try {
      setIsLoadingData(true);
      const response = await BabyService.getBaby(id as string);
      if (response.success && response.data) {
        const baby = response.data;
        setName(baby.name);
        setGender(baby.gender);
        setBirthDate(new Date(baby.birthDate));
        if (baby.photoUrl) {
          setPhoto(baby.photoUrl);
        }
      } else {
        Alert.alert('Erro', 'Não foi possível carregar os dados do bebê');
        router.back();
      }
    } catch (error) {
      console.error('Erro ao carregar dados do bebê:', error);
      Alert.alert('Erro', 'Erro ao carregar dados do bebê');
      router.back();
    } finally {
      setIsLoadingData(false);
    }
  };

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
      setBirthDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  const handleUpdateBaby = async () => {
    if (!name.trim() || !gender) {
      Alert.alert('Preencha todos os campos obrigatórios!');
      return;
    }
    setIsLoading(true);
    let photoUrl = undefined;
    if (photo && photo.startsWith('file://')) {
      // Upload da nova foto do bebê
      try {
        const uploadRes = await BabyService.uploadBabyPhoto({
          uri: photo,
          type: 'image/jpeg',
          name: 'baby.jpg',
        });
        if (uploadRes.success && uploadRes.data) {
          photoUrl = uploadRes.data.url;
        }
      } catch (e) {
        console.error('Erro no upload da foto:', e);
      }
    } else if (photo) {
      // Foto já existe, manter a URL atual
      photoUrl = photo;
    }
    
    // Corrigir problema de timezone - usar data local
    const localDate = new Date(birthDate.getTime() - (birthDate.getTimezoneOffset() * 60000));
    const formattedDate = localDate.toISOString().split('T')[0];
    
    const response = await BabyService.updateBaby({
      id: id as string,
      name, 
      birthDate: formattedDate, 
      gender, 
      photo: photoUrl 
    });
    setIsLoading(false);
    if (response.success && response.data) {
      Alert.alert('Sucesso', 'Bebê atualizado com sucesso!');
      updateBaby(response.data);
      router.back();
    } else {
      Alert.alert('Erro ao atualizar bebê', response.message || response.error || 'Tente novamente.');
    }
  };

  if (isLoadingData) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Carregando...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: colors.primary }]}>Editar Bebê</Text>
        
        <TouchableOpacity style={[styles.photoContainer, { borderColor: colors.primary }]} onPress={handlePickPhoto}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.photo} />
          ) : (
            <Text style={[styles.photoText, { color: colors.primary }]}>Adicionar Foto</Text>
          )}
        </TouchableOpacity>
        
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder="Nome do bebê"
          placeholderTextColor={colors.textSecondary}
          value={name}
          onChangeText={setName}
        />
        
        <TouchableOpacity
          style={[styles.dateInput, { borderColor: colors.border }]}
          onPress={() => setShowDatePicker(true)}
        >
          <View style={styles.dateInputContent}>
            <Calendar color={colors.textSecondary} size={20} />
            <Text style={[styles.dateText, { color: colors.text }]}>
              {formatDate(birthDate)}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.genderContainer}>
          <TouchableOpacity
            style={[styles.genderButton, gender === 'male' && { backgroundColor: colors.primary }]}
            onPress={() => setGender('male')}
          >
            <Text style={[styles.genderText, { color: gender === 'male' ? '#fff' : colors.text }]}>Menino</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.genderButton, gender === 'female' && { backgroundColor: colors.primary }]}
            onPress={() => setGender('female')}
          >
            <Text style={[styles.genderText, { color: gender === 'female' ? '#fff' : colors.text }]}>Menina</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleUpdateBaby}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>{isLoading ? 'Salvando...' : 'Salvar Alterações'}</Text>
        </TouchableOpacity>
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={birthDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
          minimumDate={new Date(2020, 0, 1)}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoText: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  dateInput: {
    width: '100%',
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
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  genderButton: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    marginHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  genderText: {
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    width: '100%',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 