import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { Pressable, Text, Modal} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';


import { Switch } from 'react-native';
import { useThemeContext } from '@/contexts/theme-context';

export default function Profile() {
  const { theme, toggleTheme } = useThemeContext();
  const [themeModalVisible, setThemeModalVisible] = useState(false);
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
          Settings
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.titleContainer}>
      <MyButton
        title="Language"
        icon="globe-outline"
        onPress={() => console.log("Language")}
      />
      </ThemedView>

      <ThemedView style={styles.titleContainer}>
      <MyButton
        title="Theme"
        icon="contrast-outline"
        onPress={() => setThemeModalVisible(true)}
      />
      </ThemedView>

      <Modal
  visible={themeModalVisible}
  transparent={true}
  animationType="fade"
  onRequestClose={() => setThemeModalVisible(false)}
>
  <ThemedView style={styles.modalBackground}>
    <ThemedView style={styles.modalBox}>

      <ThemedText type="subtitle">
        Theme
      </ThemedText>

      <ThemedView style={styles.settingRow}>
        <ThemedText>Dark Mode</ThemedText>

        <Switch
          value={theme === 'dark'}
          onValueChange={toggleTheme}
        />
      </ThemedView>

      <Pressable
        style={styles.closeButton}
        onPress={() => setThemeModalVisible(false)}
      >
        <Text style={styles.closeButtonText}>Close</Text>
      </Pressable>

    </ThemedView>
  </ThemedView>
</Modal>

      <ThemedView style={styles.titleContainer}>
      <MyButton
        title="Help"
        icon="help-circle-outline"
        onPress={() => console.log("Help")}
      />
      </ThemedView>


    </ParallaxScrollView>
  );
}

export function MyButton({ title, icon, onPress }: {
  title: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.button}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={20}
        color="#12304A"
      />

      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
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
  button: {
  backgroundColor: '#58ADE0',
  borderRadius: 10,
  paddingHorizontal: 12,
  height: 45,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: "flex-start",
  marginBottom: 15,
  width: "100%",
},
buttonText: {
  color: '#12304A',
  fontSize: 16,
  marginLeft: 10,
  fontWeight: "bold",
},
modalBackground:{
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.5)",
  justifyContent: "center",
  alignItems: "center",
},
modalBox:{
  width: "85%",
  padding: 20,
  borderRadius: 15,
},
closeButton:{
  backgroundColor: "#58ADE0",
  padding: 12,
  borderRadius: 10,
  alignItems: "center",
  marginTop: 20,
},
  closeButtonText:{
    color: "#12304A",
    fontWeight: "bold",
    fontSize: 16,
  }
});