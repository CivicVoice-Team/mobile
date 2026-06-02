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

type NewsItem = {
  newsletter_id: string;
  skill_id: string;
  title: string;
  description: string;
  date: string;
  title_es?: string
  description_es?: string;
  video_url?: string;
};

type NotificationItem = {
  title: string;
  description: string;
  date: string;
  state?: string;
}

export default function HomeScreen() {
  const [mobileContent, setMobileContent] = useState<Record<string, string>>({});
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [topNotification, setTopNotification] = useState("");

  useEffect(() => {
    async function loadContent() {
      // Mobile Content
      const skill_id = "amzn1.ask.skill.dd463ba3-38f4-423f-acd4-4d9d2a4a7d4d";

      const data: MobileContentItem[] = await fetchMobileContent(skill_id);

      const mapped: Record<string, string> = {};

      data.forEach((item) => {
        mapped[item.field_id] = item.text;
      });

      setMobileContent(mapped);

      // Notification Content
      try {
        const notifications = await fetchNotifications(skill_id);

        const latestNotification = notifications.filter((n) => n.state !== "INVALID").sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

        if (latestNotification?.description) {
          setTopNotification(latestNotification.description);
        }
      } catch (err) {
        console.error("Notification fetch failed:", err);
      }

      // News Content
      try {
        const rawNews = await fetchNews(skill_id);

        const filteredNews = getLastYearNews(rawNews);

        setNewsItems(filteredNews);
      } catch (err) {
        console.error("News fetch failed:", err);
      }
    }

    loadContent();
  }, [])

  async function fetchNews(skill_id: string): Promise<NewsItem[]> {
    const url = `https://sj3d3m472d.execute-api.us-east-1.amazonaws.com/dev/news?skill_id=${skill_id}`;

    const res = await fetch(url);

    //console.log("NEWS STATUS:", res.status);

    if(!res.ok) {
      const errText = await res.text();
      //console.log("ERROR BODY:", errText);
      throw new Error(`Failed to fetch news: ${res.status}`);
    }

    const data = await res.json();
    //console.log("NEWS DATA:", data);

    return data;
  }

  async function fetchNotifications(
    skill_id: string
  ): Promise<NotificationItem[]> {
    const url = `https://sj3d3m472d.execute-api.us-east-1.amazonaws.com/dev/notifications?skill_id=${skill_id}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error( `Failed to fetch notifications: ${res.status}`);
    }

    return res.json();
  }

  function getLastYearNews(items: NewsItem[]) {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    return items.filter(item => {
      if (!item.date) return false;
      return new Date(item.date) >= oneYearAgo;
    }).sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }

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

      {/* <ThemedView style={[styles.card, styles.blueCard]}>
        <Ionicons name="alert-circle" size={22} color="#FFFFFF" style={styles.icon} />
        <ThemedText style={styles.cardText} lightColor="#FFFFFF">
          {mobileContent.notice_box || "This is a sample announcement message. The Civicvoice web dashboard will allow you to customize the message displayed here."}
        </ThemedText>
      </ThemedView> */}

      <ThemedView style={[styles.card, styles.redCard]}>
        <Ionicons name="notifications" size={22} color="#FFFFFF" style={styles.icon} />
        <ThemedText style={styles.cardText} lightColor="#FFFFFF">
          {topNotification || mobileContent.alert_box || "This is another important update or alert message. The Civicvoice web dashboard will allow you to customize the message displayed here."}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.divider} />

      {newsItems.map((item) => {
        const imageUrl = item.video_url?.[0];

        return (
          <ThemedView key={item.newsletter_id} style={[styles.card, styles.blueCard]}>
            {imageUrl ? (<Image source={{uri:imageUrl}} style={styles.newsImage} contentFit="cover"/>) : null}
            <ThemedText type="subtitle" style={{fontWeight: "bold", marginBottom: 10}} lightColor='#fff'>
              {item.title}
            </ThemedText>
            <Link href={{pathname: "/news/[id]", params: {id: item.newsletter_id, title: item.title, description: item.description, date: item.date, imageUrl: item.video_url?.[0] ?? null}}}>
              <ThemedText style={{color: "#fff", textDecorationLine: "underline"}}>
                Read More
              </ThemedText>
            </Link>
          </ThemedView>
        );
      })}

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

  newsImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginBottom: 10
  }
});