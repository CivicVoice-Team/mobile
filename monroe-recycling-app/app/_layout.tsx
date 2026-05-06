import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as NavigationBar from 'expo-navigation-bar'
import { useRootNavigationState } from 'expo-router';

import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) return;

    const applyNavBarStyle = async () => {
      await NavigationBar.setPositionAsync('absolute');
      await NavigationBar.setBehaviorAsync('overlay-swipe');
      await NavigationBar.setBackgroundColorAsync('#1B633B');
      await NavigationBar.setButtonStyleAsync('light');
    };

    applyNavBarStyle();
  }, [navigationState?.key]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="light"backgroundColor="#1B633B"/>
    </ThemeProvider>
  );
}
