import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Mail, ArrowLeft, Baby, CheckCircle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);

  const router = useRouter();
  const { forgotPassword, isLoading } = useAuth();
  const { colors } = useTheme();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    if (!email.trim()) {
      setEmailError('Email é obrigatório');
      return false;
    } else if (!validateEmail(email)) {
      setEmailError('Email inválido');
      return false;
    } else {
      setEmailError('');
      return true;
    }
  };

  const handleSendEmail = async () => {
    if (!validateForm()) return;

    const success = await forgotPassword(email);
    
    if (success) {
      setIsEmailSent(true);
    } else {
      Alert.alert(
        'Erro',
        'Não foi possível enviar o email de recuperação. Tente novamente.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  if (isEmailSent) {
    return (
      <LinearGradient colors={colors.gradient} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={[styles.backButton, { backgroundColor: colors.accent }]}
                onPress={() => router.back()}
              >
                <ArrowLeft color={colors.text} size={24} />
              </TouchableOpacity>
            </View>

            {/* Success Content */}
            <View style={styles.successContainer}>
              <View style={[styles.successIcon, { backgroundColor: colors.accent }]}>
                <CheckCircle color="#10B981" size={60} />
              </View>
              
              <Text style={[styles.successTitle, { color: colors.text }]}>
                Email enviado!
              </Text>
              
              <Text style={[styles.successMessage, { color: colors.textSecondary }]}>
                Enviamos um link de recuperação para:
              </Text>
              
              <Text style={[styles.emailText, { color: colors.primary }]}>
                {email}
              </Text>
              
              <Text style={[styles.instructions, { color: colors.textSecondary }]}>
                Verifique sua caixa de entrada e clique no link para redefinir sua senha.
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                onPress={handleBackToLogin}
              >
                <Text style={styles.primaryButtonText}>Voltar ao Login</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.secondaryButton, { backgroundColor: colors.accent }]}
                onPress={() => setIsEmailSent(false)}
              >
                <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                  Enviar novamente
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={colors.gradient} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={[styles.backButton, { backgroundColor: colors.accent }]}
                onPress={() => router.back()}
              >
                <ArrowLeft color={colors.text} size={24} />
              </TouchableOpacity>
            </View>

            {/* Logo e Título */}
            <View style={styles.logoContainer}>
              <View style={[styles.logoBackground, { backgroundColor: colors.accent }]}>
                <Baby color={colors.primary} size={60} />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>Recuperar Senha</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Digite seu email para receber um link de recuperação
              </Text>
            </View>

            {/* Formulário */}
            <View style={styles.formContainer}>
              {/* Email */}
              <View style={styles.inputContainer}>
                <View style={[styles.inputWrapper, { backgroundColor: colors.card }]}>
                  <Mail color={colors.textSecondary} size={20} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Email"
                    placeholderTextColor={colors.textSecondary}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (emailError) setEmailError('');
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {emailError ? (
                  <Text style={[styles.errorText, { color: '#EF4444' }]}>{emailError}</Text>
                ) : null}
              </View>

              {/* Botão de Envio */}
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  { backgroundColor: colors.primary },
                  isLoading && styles.disabledButton,
                ]}
                onPress={handleSendEmail}
                disabled={isLoading}
              >
                <Text style={styles.sendButtonText}>
                  {isLoading ? 'Enviando...' : 'Enviar Email'}
                </Text>
              </TouchableOpacity>

              {/* Botão de Voltar */}
              <TouchableOpacity
                style={[styles.backToLoginButton, { backgroundColor: colors.accent }]}
                onPress={handleBackToLogin}
              >
                <Text style={[styles.backToLoginText, { color: colors.text }]}>
                  Voltar ao Login
                </Text>
              </TouchableOpacity>
            </View>

            {/* Dica */}
            <View style={[styles.tipContainer, { backgroundColor: colors.accent }]}>
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                💡 Verifique também sua pasta de spam
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 40,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 30,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
  },
  sendButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
  backToLoginButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  backToLoginText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tipContainer: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  tipText: {
    fontSize: 14,
    textAlign: 'center',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  instructions: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 