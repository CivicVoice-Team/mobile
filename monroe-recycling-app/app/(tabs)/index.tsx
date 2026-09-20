import { Image } from 'expo-image';
import { Platform, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { fetchMobileContent } from '@/services/mobileContent'
import { SKILL_ID } from '@/constants/config';

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
  link_url?: string;
};

type NotificationItem = {
  title: string;
  description: string;
  date: string;
  state?: string;
}

type CalendarItem = {
  event_id: string;
  title: string;
  start: string;
  end: string;
  all_day: boolean;
  desc: string;
  loc: string;
  modified?: string;
  keywords: string;
  skill_id: string;
}

export default function HomeScreen() {
  const [mobileContent, setMobileContent] = useState<Record<string, string>>({});
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [topNotification, setTopNotification] = useState<NotificationItem | null>(null);
  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([]);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  useEffect(() => {
    async function loadContent() {
      // Mobile Content
      
      const data: MobileContentItem[] = await fetchMobileContent(SKILL_ID);

      const mapped: Record<string, string> = {};

      data.forEach((item) => {
        mapped[item.field_id] = item.text;
      });

      setMobileContent(mapped);

      // Notification Content
      try {
        const notifications = await fetchNotifications(SKILL_ID);

        //const latestNotification = notifications.filter((n) => n.state !== "INVALID").sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

        const now = new Date();

        const nextNotification = notifications.filter((n) => {
          if (n.state === "INVALID") return false;
          const notificationDate = new Date(n.date);
          return notificationDate >= now;
        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];



        if (nextNotification) {
          setTopNotification(nextNotification);
        }
      } catch (err) {
        console.error("Notification fetch failed:", err);
      }

      // News Content
      try {
        const rawNews = await fetchNews(SKILL_ID);

        const filteredNews = getLastYearNews(rawNews);

        setNewsItems(filteredNews);
      } catch (err) {
        console.error("News fetch failed:", err);
      }


      // Calendar Content

      try{
        const events = await fetchCalendar(SKILL_ID);

        const upcomingEvents = events
        .filter((event) => new Date(event.end) >= new Date())
        .sort(
          (a, b) =>
            new Date(a.start).getTime() - new Date(b.start).getTime()
        );

        setCalendarItems(upcomingEvents);

      } catch (err) {
        console.error("Calendar fetch failed:", err);
      }
      
    }

    loadContent();
  }, [])

  function toggleFilter(filter: string) {
  setSelectedFilters((current) => {
    if (current.includes(filter)) {
      return [];
    }

    return [filter];
  });
}

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


  async function fetchCalendar(skill_id: string): Promise<CalendarItem[]> {
  const url = `https://sj3d3m472d.execute-api.us-east-1.amazonaws.com/dev/get_calendar?skill_id=${encodeURIComponent(skill_id)}`;

  const res = await fetch(url);

  if (!res.ok) {
  const body = await res.text();
  console.log("Calendar error:", res.status, body);
  throw new Error(`Failed to fetch calendar: ${res.status}`);
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

  function formatEventTime(event: CalendarItem) {
    if (event.all_day) return 'All day';

    return new Date(event.start).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{light: '#A1CEDC', dark: '#1D3D47'}}
      headerImage={
        <Image
          source={
            mobileContent.home_banner 
            ? { uri: mobileContent.home_banner } 
            : require('@/assets/images/partial-react-logo.png')
          }
          style={styles.headerImage}
          contentFit='cover'
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.headerText}>Annoucements</ThemedText>
      </ThemedView>

      <ThemedView style={styles.filterContainer}>
        {['Alerts', 'Calendar', 'News'].map((filter) => {
          const isSelected = selectedFilters.includes(filter);

          return (
            <Pressable
              key={filter}
              onPress={() => toggleFilter(filter)}
              style={[
                styles.filterButton,
                isSelected && styles.filterButtonSelected,
              ]}
            >
              <ThemedText
                style={styles.filterButtonText}
                lightColor={isSelected ? '#FFFFFF' : '#12304A'}
                darkColor={isSelected ? '#FFFFFF' : '#12304A'}
              >
                {filter}
              </ThemedText>
            </Pressable>
          );
        })}
      </ThemedView>

      {(selectedFilters.length === 0 || selectedFilters.includes('Alerts')) && (
        <ThemedView style={[styles.card, styles.redCard]}>
          <ThemedView style={styles.alertHeader}>
            <Ionicons name="notifications" size={22} color="#FFFFFF" style={styles.alertIcon} />
            {topNotification?.title ? (
              <ThemedText type="subtitle" style={styles.alertTitle} lightColor="#FFFFFF">
                {topNotification.title}
              </ThemedText>
            ) : null}
          </ThemedView>

          <ThemedText style={styles.cardText} lightColor="#FFFFFF">
            {topNotification?.description || mobileContent.alert_box || "This is another important update or alert message. The Civicvoice web dashboard will allow you to customize the message displayed here."}
          </ThemedText>
        </ThemedView>
      )}

      {(selectedFilters.length === 0 || selectedFilters.includes('Calendar')) && (
        <>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title" style={styles.headerText}>
              Upcoming Events
            </ThemedText>
          </ThemedView>

          {calendarItems.map((event) => {
            const startDate = new Date(event.start);
            const isExpanded = expandedEventId === event.event_id;

            return (
              <Pressable
                key={event.event_id}
                accessibilityRole="button"
                accessibilityState={{ expanded: isExpanded }}
                accessibilityHint="Shows more event details"
                onPress={() => setExpandedEventId(isExpanded ? null : event.event_id)}
                style={({ pressed }) => [
                  styles.eventCard,
                  pressed && styles.eventCardPressed,
                ]}>
                <ThemedView style={styles.eventDateBadge} lightColor="#DDF3E7" darkColor="#DDF3E7">
                  <ThemedText style={styles.eventMonth} lightColor="#27704D" darkColor="#27704D">
                    {startDate.toLocaleDateString([], { month: 'short' })}
                  </ThemedText>
                  <ThemedText style={styles.eventDay} lightColor="#27704D" darkColor="#27704D">
                    {startDate.getDate()}
                  </ThemedText>
                </ThemedView>

                <ThemedView style={styles.eventSummary} lightColor="#58ADE0" darkColor="#58ADE0">
                  <ThemedText type="defaultSemiBold" style={styles.eventTitle} lightColor="#12304A" darkColor="#12304A">
                    {event.title}
                  </ThemedText>
                  <ThemedText style={styles.eventMeta} lightColor="#12304A" darkColor="#12304A">
                    {formatEventTime(event)}{event.loc ? ` · ${event.loc}` : ''}
                  </ThemedText>

                  {isExpanded && (
                    <ThemedView style={styles.eventDetails} lightColor="#58ADE0" darkColor="#58ADE0">
                      {event.desc ? (
                        <ThemedText style={styles.eventDescription} lightColor="#12304A" darkColor="#12304A">
                          {event.desc}
                        </ThemedText>
                      ) : null}
                      {!event.all_day ? (
                        <ThemedText style={styles.eventEndTime} lightColor="#12304A" darkColor="#12304A">
                          Ends {new Date(event.end).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                        </ThemedText>
                      ) : null}
                    </ThemedView>
                  )}
                </ThemedView>

                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={21}
                  color="#12304A"
                  style={styles.eventChevron}
                />
              </Pressable>
            );
          })}
        </>
      )}

      {/* <ThemedView style={styles.divider} /> */}

      {/* <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.headerText}>News</ThemedText>
      </ThemedView> */}

      {(selectedFilters.length === 0 || selectedFilters.includes('News')) && (
        <>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title" style={styles.headerText}>
              News
            </ThemedText>
          </ThemedView>

          {newsItems.map((item) => {
            const imageUrl = item.video_url?.[0];

            return (
              <Link key={item.newsletter_id} href={{pathname: "/news/[id]", params: {id: item.newsletter_id, title: item.title, description: item.description, date: item.date, imageUrl: item.video_url?.[0] ?? null, link_url: item.link_url ?? null,}}}>
                <ThemedView style={[styles.card, styles.blueCard]}>
                  {imageUrl ? (<Image source={{ uri: imageUrl}} style={styles.newsImage} contentFit='cover'/>) : null}
                  <ThemedText type="subtitle" style={{fontWeight: "bold", marginBottom: 10}} lightColor='#fff'>
                    {item.title}
                  </ThemedText>
                  <ThemedText style={{color:"#fff", textDecorationLine: "underline"}}>
                    Read More
                  </ThemedText>
                </ThemedView>
              </Link>
            );
          })}
        </>
      )}

    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },

  filterButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#58ADE0',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },

  filterButtonSelected: {
    backgroundColor: '#58ADE0',
  },

  filterButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },

  titleContainer: {
    paddingVertical: 10
  },

  headerText: {
    fontSize: 18
  },

  card: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    width: '100%',
    alignSelf: 'center',
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
    elevation: 3
  },

  blueCard: {
    backgroundColor: '#456781',
    alignSelf: 'center'
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
  },

  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    backgroundColor: 'transparent'
  },

  alertIcon: {
    marginRight: 8,
  },

  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },

  eventCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#58ADE0',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  eventCardPressed: {
    opacity: 0.82,
  },

  eventDateBadge: {
    alignItems: 'center',
    borderRadius: 8,
    margin: 10,
    minWidth: 54,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  eventMonth: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
    textTransform: 'uppercase',
  },

  eventDay: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 29,
  },

  eventSummary: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 32,
  },

  eventTitle: {
    fontSize: 16,
    lineHeight: 20,
  },

  eventMeta: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 2,
  },

  eventChevron: {
    position: 'absolute',
    right: 10,
    top: 18,
  },

  eventDetails: {
    borderTopColor: 'rgba(18, 48, 74, 0.28)',
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 10,
    paddingTop: 9,
  },

  eventDescription: {
    fontSize: 14,
    lineHeight: 20,
  },

  eventEndTime: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  }
});
