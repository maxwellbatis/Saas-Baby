import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { BabyProvider } from '@/contexts/BabyContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import OnboardingGuard from './_onboarding-guard';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <ThemeProvider>
        <BabyProvider>
          <OnboardingGuard>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="splash" />
              <Stack.Screen name="login" />
              <Stack.Screen name="register" />
              <Stack.Screen name="forgot-password" />
              <Stack.Screen name="+not-found" />
              <Stack.Screen name="onboarding-baby" />
              <Stack.Screen name="add-baby" options={{ headerShown: false }} />
              <Stack.Screen name="edit-baby" options={{ headerShown: false }} />
              <Stack.Screen name="manage-babies" options={{ headerShown: false }} />
            </Stack>
          </OnboardingGuard>
          <StatusBar style="auto" />
        </BabyProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}