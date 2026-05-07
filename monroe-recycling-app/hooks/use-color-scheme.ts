import { useThemeContext } from '@/contexts/theme-context';

export function useColorScheme(): 'light' | 'dark' {
  const { theme } = useThemeContext();

  return theme === 'dark' ? 'dark' : 'light';
}