import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{light: '#A1CEDC', dark: '#1D3D47'}}
      headerImage={
        <Image
          source={require('@/assets/images/recyclingbanner.png')}
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.headerText}>News & Announcements</ThemedText>
      </ThemedView>

      <ThemedView style={[styles.card, styles.blueCard]}>
        <Ionicons name="alert-circle" size={22} color="#FFFFFF" style={styles.icon} />
        <ThemedText style={styles.cardText} lightColor="#FFFFFF">
          This is a sample announcement message. The Civicvoice web dashboard will allow you to customize the message displayed here.
        </ThemedText>
      </ThemedView>

      <ThemedView style={[styles.card, styles.redCard]}>
        <Ionicons name="notifications" size={22} color="#FFFFFF" style={styles.icon} />
        <ThemedText style={styles.cardText} lightColor="#FFFFFF">
          This is another important update or alert message. The Civicvoice web dashboard will allow you to customize the message displayed here.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.divider} />

      <ThemedView style={[styles.card, styles.blueCard]}>
        <Image
          source={require('@/assets/images/recyclingbanner.png')}
          style={styles.cardImage}
        />
        <ThemedText style={styles.cardText} lightColor="#FFFFFF">
          This section can display news and corresponding images from the web dashboard. The method determining exactly what news will be displayed at any given time is TBD
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    paddingVertical: 10
  },

  headerText: {
    fontSize: 28
  },

  card: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 12
  },

  blueCard: {
    backgroundColor: '#456781'
  },

  redCard: {
    backgroundColor: '#9D1416'
  },

  icon: {
    marginBottom: 6,
  },

  cardText: {
    fontSize: 14,
    lineHeight: 20,
  },

  divider: {
    height: 1,
    backgroundColor: '#bbb',
    marginVertical: 16,
    width: '100%',
    alignSelf: 'center'
  },

  cardImage: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    marginBottom: 10,
  },

  headerImage: {
    height: 178,
    width: '100%',
    bottom: 0,
    left: 0,
    right: 0,
    position: 'absolute'
  },
});