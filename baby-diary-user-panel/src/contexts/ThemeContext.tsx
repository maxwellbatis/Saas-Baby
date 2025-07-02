import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
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
    if (savedTheme) {
      return savedTheme;
    }
    
    // Verificar preferência do sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Aplicar tema ao documento
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.setProperty('--background', '#0B0B0F');
      document.documentElement.style.setProperty('--foreground', '#FFFFFF');
      document.documentElement.style.setProperty('--primary', '#8A2BE2');
      document.documentElement.style.setProperty('--primary-foreground', '#FFFFFF');
      document.documentElement.style.setProperty('--secondary', '#1B1C22');
      document.documentElement.style.setProperty('--secondary-foreground', '#FFFFFF');
      document.documentElement.style.setProperty('--accent', '#B86BFF');
      document.documentElement.style.setProperty('--destructive', '#E50914');
      document.documentElement.style.setProperty('--muted', '#2A2A2A');
      document.documentElement.style.setProperty('--muted-foreground', '#A0A0A0');
      document.documentElement.style.setProperty('--border', '#333333');
      document.documentElement.style.setProperty('--card', '#1B1C22');
      document.documentElement.style.setProperty('--card-foreground', '#FFFFFF');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.setProperty('--background', '#FFFFFF');
      document.documentElement.style.setProperty('--foreground', '#0B0B0F');
      document.documentElement.style.setProperty('--primary', '#8A2BE2');
      document.documentElement.style.setProperty('--primary-foreground', '#FFFFFF');
      document.documentElement.style.setProperty('--secondary', '#F5F5F5');
      document.documentElement.style.setProperty('--secondary-foreground', '#0B0B0F');
      document.documentElement.style.setProperty('--accent', '#B86BFF');
      document.documentElement.style.setProperty('--destructive', '#E50914');
      document.documentElement.style.setProperty('--muted', '#F5F5F5');
      document.documentElement.style.setProperty('--muted-foreground', '#6B7280');
      document.documentElement.style.setProperty('--border', '#E5E7EB');
      document.documentElement.style.setProperty('--card', '#FFFFFF');
      document.documentElement.style.setProperty('--card-foreground', '#0B0B0F');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    setTheme(theme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
