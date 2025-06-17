import { Tabs } from 'expo-router';
import { Chrome as Home, Activity, Heart, Trophy, User } from 'lucide-react-native';
import { StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import AuthGuard from '@/components/AuthGuard';

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <AuthGuard>
    <Tabs
      screenOptions={{
        headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
            backgroundColor: colors.card,
          borderTopWidth: 1,
            borderTopColor: colors.border,
          height: 90,
          paddingBottom: 20,
          paddingTop: 10,
            shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="activities"
        options={{
          title: 'Atividades',
          tabBarIcon: ({ color, size }) => (
            <Activity color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="memories"
        options={{
          title: 'Memórias',
          tabBarIcon: ({ color, size }) => (
            <Heart color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="milestones"
        options={{
          title: 'Marcos',
          tabBarIcon: ({ color, size }) => (
            <Trophy color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <User color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai-chat"
        options={{
          href: null, // Oculta da navegação por tab
        }}
      />
    </Tabs>
    </AuthGuard>
  );
}