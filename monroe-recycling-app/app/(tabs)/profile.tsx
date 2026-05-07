import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

import { Switch } from 'react-native';
import { useThemeContext } from '@/contexts/theme-context';

export default function Profile() {
  const { theme, toggleTheme } = useThemeContext();
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={260}
          color="#808080"
          name="person.fill"
          style={styles.headerImage}
        />
      }>
      
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{ fontFamily: Fonts.rounded }}>
          Profile
        </ThemedText>
      </ThemedView>

      <ThemedText>
        This is a placeholder for the profile page.
      </ThemedText>

      <ThemedText>
        Content and features will be added here soon.
      </ThemedText>

      <ThemedView style={styles.settingRow}>
        <ThemedText>Dark Mode</ThemedText>

        <Switch
          value={theme === 'dark'}
          onValueChange={toggleTheme}
        />
      </ThemedView>

    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    bottom: -70,
    left: -20,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
    settingRow: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});