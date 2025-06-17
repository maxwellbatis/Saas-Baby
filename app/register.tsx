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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Baby, User, Check } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const router = useRouter();
  const { register, isLoading } = useAuth();
  const { colors } = useTheme();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const validateForm = () => {
    let isValid = true;

    // Validar nome
    if (!name.trim()) {
      setNameError('Nome é obrigatório');
      isValid = false;
    } else if (name.trim().length < 2) {
      setNameError('Nome deve ter pelo menos 2 caracteres');
      isValid = false;
    } else {
      setNameError('');
    }

    // Validar email
    if (!email.trim()) {
      setEmailError('Email é obrigatório');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Email inválido');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Validar senha
    if (!password.trim()) {
      setPasswordError('Senha é obrigatória');
      isValid = false;
    } else if (!validatePassword(password)) {
      setPasswordError('Senha deve ter pelo menos 6 caracteres');
      isValid = false;
    } else {
      setPasswordError('');
    }

    // Validar confirmação de senha
    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Confirme sua senha');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Senhas não coincidem');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    // Validar termos
    if (!acceptTerms) {
      Alert.alert('Termos e Condições', 'Você deve aceitar os termos e condições para continuar.');
      isValid = false;
    }

    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    const success = await register(name, email, password);
    
    if (success) {
      Alert.alert(
        'Sucesso!',
        'Conta criada com sucesso! Bem-vindo ao Baby Diary.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } else {
      Alert.alert(
        'Erro no Registro',
        'Não foi possível criar sua conta. Tente novamente.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={colors.gradient}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
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
              <Text style={[styles.title, { color: colors.text }]}>Baby Diary</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Crie sua conta para começar
              </Text>
            </View>

            {/* Formulário */}
            <View style={styles.formContainer}>
              {/* Nome */}
              <View style={styles.inputContainer}>
                <View style={[styles.inputWrapper, { backgroundColor: colors.card }]}>
                  <User color={colors.textSecondary} size={20} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Nome completo"
                    placeholderTextColor={colors.textSecondary}
                    value={name}
                    onChangeText={(text) => {
                      setName(text);
                      if (nameError) setNameError('');
                    }}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>
                {nameError ? (
                  <Text style={[styles.errorText, { color: '#EF4444' }]}>{nameError}</Text>
                ) : null}
              </View>

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

              {/* Senha */}
              <View style={styles.inputContainer}>
                <View style={[styles.inputWrapper, { backgroundColor: colors.card }]}>
                  <Lock color={colors.textSecondary} size={20} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Senha"
                    placeholderTextColor={colors.textSecondary}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (passwordError) setPasswordError('');
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    {showPassword ? (
                      <EyeOff color={colors.textSecondary} size={20} />
                    ) : (
                      <Eye color={colors.textSecondary} size={20} />
                    )}
                  </TouchableOpacity>
                </View>
                {passwordError ? (
                  <Text style={[styles.errorText, { color: '#EF4444' }]}>{passwordError}</Text>
                ) : null}
              </View>

              {/* Confirmar Senha */}
              <View style={styles.inputContainer}>
                <View style={[styles.inputWrapper, { backgroundColor: colors.card }]}>
                  <Lock color={colors.textSecondary} size={20} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Confirmar senha"
                    placeholderTextColor={colors.textSecondary}
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (confirmPasswordError) setConfirmPasswordError('');
                    }}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    {showConfirmPassword ? (
                      <EyeOff color={colors.textSecondary} size={20} />
                    ) : (
                      <Eye color={colors.textSecondary} size={20} />
                    )}
                  </TouchableOpacity>
                </View>
                {confirmPasswordError ? (
                  <Text style={[styles.errorText, { color: '#EF4444' }]}>{confirmPasswordError}</Text>
                ) : null}
              </View>

              {/* Termos e Condições */}
              <TouchableOpacity
                style={styles.termsContainer}
                onPress={() => setAcceptTerms(!acceptTerms)}
              >
                <View style={[
                  styles.checkbox,
                  { backgroundColor: acceptTerms ? colors.primary : colors.accent }
                ]}>
                  {acceptTerms && <Check color="#FFFFFF" size={16} />}
                </View>
                <Text style={[styles.termsText, { color: colors.textSecondary }]}>
                  Aceito os{' '}
                  <Text style={[styles.termsLink, { color: colors.primary }]}>
                    Termos de Uso
                  </Text>
                  {' '}e{' '}
                  <Text style={[styles.termsLink, { color: colors.primary }]}>
                    Política de Privacidade
                  </Text>
                </Text>
              </TouchableOpacity>

              {/* Botão de Registro */}
              <TouchableOpacity
                style={[
                  styles.registerButton,
                  { backgroundColor: colors.primary },
                  isLoading && styles.disabledButton,
                ]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                <Text style={styles.registerButtonText}>
                  {isLoading ? 'Criando conta...' : 'Criar conta'}
                </Text>
              </TouchableOpacity>

              {/* Divisor */}
              <View style={styles.dividerContainer}>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <Text style={[styles.dividerText, { color: colors.textSecondary }]}>
                  ou
                </Text>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
              </View>

              {/* Botão de Login */}
              <TouchableOpacity
                style={[styles.loginButton, { backgroundColor: colors.accent }]}
                onPress={handleLogin}
              >
                <Text style={[styles.loginButtonText, { color: colors.text }]}>
                  Já tenho uma conta
                </Text>
              </TouchableOpacity>
            </View>

            {/* Dica */}
            <View style={[styles.tipContainer, { backgroundColor: colors.accent }]}>
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                🔒 Seus dados estão seguros e protegidos
              </Text>
            </View>
          </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
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
  },
  formContainer: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
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
  eyeButton: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 30,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  termsLink: {
    fontWeight: '600',
  },
  registerButton: {
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
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  loginButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  loginButtonText: {
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
}); 