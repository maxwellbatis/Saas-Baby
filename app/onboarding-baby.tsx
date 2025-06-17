import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { BabyService } from '@/services/babyService';
import { useTheme } from '@/contexts/ThemeContext';
import { Calendar } from 'lucide-react-native';

export default function OnboardingBabyScreen() {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { colors } = useTheme();

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

  const handleAddBaby = async () => {
    if (!name.trim() || !gender) {
      Alert.alert('Preencha todos os campos obrigatórios!');
      return;
    }
    setIsLoading(true);
    let photoUrl = undefined;
    if (photo) {
      // Upload da foto do bebê (opcional)
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
    }
    
    // Corrigir problema de timezone - usar data local
    const localDate = new Date(birthDate.getTime() - (birthDate.getTimezoneOffset() * 60000));
    const formattedDate = localDate.toISOString().split('T')[0];
    
    console.log('Data original:', birthDate);
    console.log('Data local:', localDate);
    console.log('Data formatada:', formattedDate);
    
    const response = await BabyService.createBaby({ 
      name, 
      birthDate: formattedDate, 
      gender, 
      photo: photoUrl 
    });
    setIsLoading(false);
    if (response.success && response.data) {
      console.log('Bebê cadastrado com sucesso no onboarding, redirecionando...');
      
      // Forçar atualização do contexto de bebês
      setTimeout(() => {
        console.log('Executando redirecionamento direto...');
        try {
          router.replace('/(tabs)');
          console.log('router.replace executado com sucesso');
        } catch (error) {
          console.error('Erro ao executar router.replace:', error);
          // Fallback: tentar push
          try {
            router.push('/(tabs)');
            console.log('router.push executado como fallback');
          } catch (pushError) {
            console.error('Erro ao executar router.push:', pushError);
          }
        }
      }, 1000); // Aumentar o tempo para dar chance do contexto atualizar
      
      Alert.alert(
        'Bem-vinda!', 
        'Bebê cadastrado com sucesso!'
      );
    } else {
      Alert.alert('Erro ao cadastrar bebê', response.message || response.error || 'Tente novamente.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: colors.primary }]}>Bem-vinda, Mamãe!</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Vamos começar cadastrando seu bebê</Text>
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
          onPress={handleAddBaby}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>{isLoading ? 'Salvando...' : 'Salvar'}</Text>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
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
