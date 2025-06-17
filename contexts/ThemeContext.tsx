import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ThemeType = 'pink' | 'blue';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  shadow: string;
  gradient: string[];
}

const themes: Record<ThemeType, ThemeColors> = {
  pink: {
    primary: '#FF6B9D',
    secondary: '#FFB3D1',
    accent: '#FFE6F0',
    background: '#FFF5F8',
    card: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#F3E7ED',
    shadow: '#FF6B9D',
    gradient: ['#FF6B9D', '#FFB3D1'],
  },
  blue: {
    primary: '#4ECDC4',
    secondary: '#A8E6CF',
    accent: '#E8F8F5',
    background: '#F0F9FF',
    card: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E7F3F2',
    shadow: '#4ECDC4',
    gradient: ['#4ECDC4', '#A8E6CF'],
  },
};

interface ThemeContextType {
  theme: ThemeType;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>('pink');

  const colors = themes[theme];

  const toggleTheme = () => {
    setThemeState(prev => prev === 'pink' ? 'blue' : 'pink');
  };

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colors,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 