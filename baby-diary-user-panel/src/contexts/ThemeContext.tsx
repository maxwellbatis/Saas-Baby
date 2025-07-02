import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'blue' | 'pink';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  getBgClass: () => string;
  getGradientClass: () => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Verificar se há tema salvo no localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme === 'blue' || savedTheme === 'pink') {
      return savedTheme;
    }
    // Azul como padrão
    return 'blue';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    // Aplicar tema ao documento
    if (newTheme === 'pink') {
      document.documentElement.classList.add('theme-pink');
      document.documentElement.classList.remove('theme-blue');
    } else {
      document.documentElement.classList.add('theme-blue');
      document.documentElement.classList.remove('theme-pink');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'blue' ? 'pink' : 'blue');
  };

  // Funções utilitárias para gradientes do painel do usuário
  const getBgClass = () => {
    return theme === 'pink'
      ? 'bg-gradient-to-br from-pink-100 via-pink-50 to-rose-100'
      : 'bg-gradient-to-br from-blue-100 via-blue-50 to-cyan-100';
  };

  const getGradientClass = () => {
    return theme === 'pink'
      ? 'bg-gradient-to-r from-pink-500 to-rose-500'
      : 'bg-gradient-to-r from-blue-500 to-cyan-500';
  };

  useEffect(() => {
    setTheme(theme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, getBgClass, getGradientClass }}>
      {children}
    </ThemeContext.Provider>
  );
};
