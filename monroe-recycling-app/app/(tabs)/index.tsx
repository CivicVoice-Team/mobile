import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { fetchMobileContent } from '@/services/mobileContent'

type MobileContentItem = {
  field_id: string;
  text: string;
}

export default function HomeScreen() {
  const [mobileContent, setMobileContent] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadContent() {
      // TEMP HARDCODED FOR NOW
      const skill_id = "amzn1.ask.skill.dd463ba3-38f4-423f-acd4-4d9d2a4a7d4d";

      const data: MobileContentItem[] = await fetchMobileContent(skill_id);

      const mapped: Record<string, string> = {};

      data.forEach((item) => {
        mapped[item.field_id] = item.text;
      });

      setMobileContent(mapped);
    }

    loadContent();
  }, [])

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
          {mobileContent.notice_box || "This is a sample announcement message. The Civicvoice web dashboard will allow you to customize the message displayed here."}
        </ThemedText>
      </ThemedView>

      <ThemedView style={[styles.card, styles.redCard]}>
        <Ionicons name="notifications" size={22} color="#FFFFFF" style={styles.icon} />
        <ThemedText style={styles.cardText} lightColor="#FFFFFF">
          {mobileContent.alert_box || "This is another important update or alert message. The Civicvoice web dashboard will allow you to customize the message displayed here."}
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