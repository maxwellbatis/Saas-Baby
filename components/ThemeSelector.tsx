import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeSelector() {
  const { theme, setTheme, colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Escolha o Tema</Text>
      <View style={styles.themeOptions}>
        <TouchableOpacity
          style={[
            styles.themeOption,
            { backgroundColor: theme === 'pink' ? colors.primary : colors.card },
            theme === 'pink' && styles.selectedTheme,
          ]}
          onPress={() => setTheme('pink')}
        >
          <View style={[styles.colorPreview, { backgroundColor: '#FF6B9D' }]} />
          <Text style={[
            styles.themeText,
            { color: theme === 'pink' ? '#FFFFFF' : colors.text }
          ]}>
            Rosa
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.themeOption,
            { backgroundColor: theme === 'blue' ? colors.primary : colors.card },
            theme === 'blue' && styles.selectedTheme,
          ]}
          onPress={() => setTheme('blue')}
        >
          <View style={[styles.colorPreview, { backgroundColor: '#4ECDC4' }]} />
          <Text style={[
            styles.themeText,
            { color: theme === 'blue' ? '#FFFFFF' : colors.text }
          ]}>
            Azul
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedTheme: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  themeText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 