import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Bot, User, ArrowLeft, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useBabyContext } from '@/contexts/BabyContext';
import { AIService, ChatMessage } from '@/services/aiService';

export default function AIChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const { colors } = useTheme();
  const { selectedBaby } = useBabyContext();
  const router = useRouter();

  console.log('=== AI CHAT SCREEN DEBUG ===');
  console.log('selectedBaby:', selectedBaby);
  console.log('messages:', messages);
  console.log('isLoading:', isLoading);

  // Mensagem de boas-vindas inicial
  useEffect(() => {
    console.log('AI Chat useEffect - selectedBaby:', selectedBaby);
    if (selectedBaby) {
      // Calcular idade do bebê em meses
      const calculateAgeInMonths = (birthDate: string) => {
        try {
          const birth = new Date(birthDate);
          const today = new Date();
          const diffTime = Math.abs(today.getTime() - birth.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const months = Math.floor(diffDays / 30.44);
          return months;
        } catch (error) {
          console.error('Erro ao calcular idade:', error);
          return 0;
        }
      };

      const babyAgeInMonths = calculateAgeInMonths(selectedBaby.birthDate);
      console.log('Idade do bebê para boas-vindas:', babyAgeInMonths);

      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        message: '',
        response: `Olá! Sou sua assistente virtual especializada em desenvolvimento infantil. Posso ajudar você com dicas sobre o ${selectedBaby.name} (${babyAgeInMonths} meses), análise de padrões de sono, sugestões de atividades, interpretação de choro e muito mais! 

Como posso ajudar você hoje?`,
        timestamp: new Date().toISOString(),
        babyAge: babyAgeInMonths,
      };
      console.log('Definindo mensagem de boas-vindas:', welcomeMessage);
      setMessages([welcomeMessage]);
    }
  }, [selectedBaby]);

  const sendMessage = async () => {
    console.log('Enviando mensagem:', inputMessage);
    if (!inputMessage.trim() || !selectedBaby) return;

    // Calcular idade do bebê em meses
    const calculateAgeInMonths = (birthDate: string) => {
      try {
        const birth = new Date(birthDate);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - birth.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const months = Math.floor(diffDays / 30.44);
        return months;
      } catch (error) {
        console.error('Erro ao calcular idade:', error);
        return 0;
      }
    };

    const babyAgeInMonths = calculateAgeInMonths(selectedBaby.birthDate);
    console.log('Idade do bebê em meses:', babyAgeInMonths);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: inputMessage,
      response: '',
      timestamp: new Date().toISOString(),
      babyAge: babyAgeInMonths,
    };

    console.log('Adicionando mensagem do usuário:', userMessage);
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log('Chamando AIService.chat...');
      const response = await AIService.chat(inputMessage, selectedBaby.id, babyAgeInMonths);
      console.log('Resposta do AIService:', response);
      
      if (response.success && response.data) {
        console.log('Adicionando resposta da IA:', response.data);
        
        // Criar mensagem da IA com formato correto
        const aiMessage: ChatMessage = {
          id: Date.now().toString(),
          message: '',
          response: typeof response.data === 'string' ? response.data : response.data.response || response.data.message || 'Resposta da IA',
          timestamp: new Date().toISOString(),
          babyAge: babyAgeInMonths,
        };
        
        console.log('Mensagem da IA formatada:', aiMessage);
        setMessages(prev => [...prev, aiMessage]);
      } else {
        console.log('Erro na resposta da IA:', response.error);
        Alert.alert('Erro', response.error || 'Erro ao processar mensagem');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      Alert.alert('Erro', 'Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!selectedBaby) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          Nenhum bebê selecionado
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color={colors.text} size={24} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.botIcon}>
              <Bot color={colors.primary} size={24} />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Assistente IA
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                Especialista em bebês
              </Text>
            </View>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View key={message.id} style={styles.messageContainer}>
              {message.message ? (
                // User message
                <View style={[styles.userMessage, { backgroundColor: colors.primary }]}>
                  <View style={styles.messageHeader}>
                    <User color="white" size={16} />
                    <Text style={styles.messageTime}>
                      {formatTime(message.timestamp)}
                    </Text>
                  </View>
                  <Text style={styles.userMessageText}>{message.message}</Text>
                </View>
              ) : (
                // Bot message
                <View style={[styles.botMessage, { backgroundColor: colors.card }]}>
                  <View style={styles.messageHeader}>
                    <Bot color={colors.primary} size={16} />
                    <Text style={[styles.messageTime, { color: colors.textSecondary }]}>
                      {formatTime(message.timestamp)}
                    </Text>
                  </View>
                  <Text style={[styles.botMessageText, { color: colors.text }]}>
                    {message.response}
                  </Text>
                </View>
              )}
            </View>
          ))}
          
          {isLoading && (
            <View style={styles.messageContainer}>
              <View style={[styles.botMessage, { backgroundColor: colors.card }]}>
                <View style={styles.messageHeader}>
                  <Bot color={colors.primary} size={16} />
                  <Text style={[styles.messageTime, { color: colors.textSecondary }]}>
                    {formatTime(new Date().toISOString())}
                  </Text>
                </View>
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color={colors.primary} size="small" />
                  <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                    Assistente está digitando...
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[styles.inputContainer, { backgroundColor: colors.card }]}
        >
          <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: colors.background }]}
            placeholder="Digite sua pergunta..."
            placeholderTextColor={colors.textSecondary}
            value={inputMessage}
            onChangeText={setInputMessage}
            multiline
            maxLength={1000}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: inputMessage.trim() ? colors.primary : colors.border }
            ]}
            onPress={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
          >
            <Send color="white" size={20} />
          </TouchableOpacity>
        </KeyboardAvoidingView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  botIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 14,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignSelf: 'flex-end',
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    borderBottomRightRadius: 4,
  },
  botMessage: {
    alignSelf: 'flex-start',
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  messageTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  userMessageText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 22,
  },
  botMessageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
}); 