import React, { createContext, useContext, useState } from 'react';
import { ColorSchemeName } from 'react-native';

type ThemeContextType = {
  theme: ColorSchemeName;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
});

export function ThemeProviderCustom({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<ColorSchemeName>('light');

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  return useContext(ThemeContext);
}