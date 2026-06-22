import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as NavigationBar from 'expo-navigation-bar'
import { useRootNavigationState } from 'expo-router';

import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';

import TopBar from '@/components/topbar';
import { ThemeProviderCustom, useThemeContext } from '@/contexts/theme-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutInner() {
  const { theme } = useThemeContext();

  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) return;

    const applyNavBarStyle = async () => {
      await NavigationBar.setPositionAsync('absolute');
      await NavigationBar.setBehaviorAsync('overlay-swipe');
      await NavigationBar.setBackgroundColorAsync(
        theme === 'dark' ? '#000000' : '#152e70'
      );
      await NavigationBar.setButtonStyleAsync('light');
    };

    applyNavBarStyle();
  }, [navigationState?.key, theme]);

  return (
    <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
      <TopBar title="Monroe County Recycling" />

      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: 'modal', title: 'Modal' }}
        />
      </Stack>

      <StatusBar
        style={'light'}
        backgroundColor={theme === 'dark' ? '#000000' : '#152370'} //1B633B for green
      />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProviderCustom>
      <RootLayoutInner />
    </ThemeProviderCustom>
  );
}