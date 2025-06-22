
import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'blue' | 'pink';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  getGradientClass: () => string;
  getColorClass: () => string;
  getBgClass: () => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('blue');

  useEffect(() => {
    const savedTheme = localStorage.getItem('baby-diary-theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('baby-diary-theme', newTheme);
  };

  const getGradientClass = () => {
    return theme === 'blue' 
      ? 'baby-gradient-blue' 
      : 'baby-gradient-pink';
  };

  const getColorClass = () => {
    return theme === 'blue' 
      ? 'from-blue-600 to-cyan-600' 
      : 'from-pink-600 to-rose-600';
  };

  const getBgClass = () => {
    return theme === 'blue' 
      ? 'from-baby-blue via-baby-lavender to-baby-mint' 
      : 'from-baby-pink via-baby-peach to-baby-lavender';
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme: handleSetTheme,
      getGradientClass,
      getColorClass,
      getBgClass
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
