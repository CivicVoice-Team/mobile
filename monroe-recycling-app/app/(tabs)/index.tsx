import { Image } from 'expo-image';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { fetchMobileContent } from '@/services/mobileContent'
import { SKILL_ID } from '@/constants/config';

const EVENT_TITLE_LINE_HEIGHT = 20;

const EVENT_DATE_GREEN = '#DDF3E7';
const EVENT_DATE_GREEN_TEXT = '#27704D';

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
  link_url?: string;
  link_button?: string;
}

function formatClock(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function openEventLink(url?: string) {
  const trimmed = url?.trim();
  if (!trimmed) return;
  const href = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  Linking.openURL(href);
}

function EventCard({
  event,
  isExpanded,
  onToggle,
}: {
  event: CalendarItem;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const startDate = new Date(event.start);
  const [stackTitle, setStackTitle] = useState(false);
  const cardWidthRef = useRef(0);
  const timeLabel = event.all_day
    ? 'All day'
    : `${formatClock(event.start)} - ${formatClock(event.end)}`;
  const accessibilityLabel = [event.title, event.loc, timeLabel].filter(Boolean).join(', ');

  const chevron = (
    <Ionicons
      name={isExpanded ? 'chevron-up' : 'chevron-down'}
      size={21}
      color="#12304A"
      style={styles.eventChevron}
    />
  );

  return (
    <ThemedView
      style={styles.eventCard}
      lightColor="#58ADE0"
      darkColor="#58ADE0"
      onLayout={(e) => {
        const width = Math.round(e.nativeEvent.layout.width);
        if (cardWidthRef.current !== 0 && width !== cardWidthRef.current) {
          setStackTitle(false);
        }
        cardWidthRef.current = width;
      }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ expanded: isExpanded }}
        accessibilityHint="Shows more event details"
        onPress={onToggle}
        style={({ pressed }) => [
          styles.eventCardHeader,
          pressed && styles.eventCardPressed,
        ]}>
        {stackTitle ? (
          <ThemedView style={styles.eventTitleRow} lightColor="#58ADE0" darkColor="#58ADE0">
            <ThemedText type="defaultSemiBold" style={styles.eventTitleStacked} lightColor="#12304A" darkColor="#12304A">
              {event.title}
            </ThemedText>
            {chevron}
          </ThemedView>
        ) : null}

        <ThemedView style={styles.eventBodyRow} lightColor="#58ADE0" darkColor="#58ADE0">
          <ThemedView style={styles.eventDateBadge} lightColor={EVENT_DATE_GREEN} darkColor={EVENT_DATE_GREEN}>
            <ThemedText style={styles.eventMonth} lightColor={EVENT_DATE_GREEN_TEXT} darkColor={EVENT_DATE_GREEN_TEXT}>
              {startDate.toLocaleDateString([], { month: 'short' })}
            </ThemedText>
            <ThemedText style={styles.eventDay} lightColor={EVENT_DATE_GREEN_TEXT} darkColor={EVENT_DATE_GREEN_TEXT}>
              {startDate.getDate()}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.eventSummary} lightColor="#58ADE0" darkColor="#58ADE0">
            <View
              pointerEvents="none"
              accessible={false}
              accessibilityElementsHidden
              importantForAccessibility="no"
              style={styles.eventTitleMeasureWrap}>
              <ThemedText
                type="defaultSemiBold"
                accessible={false}
                importantForAccessibility="no"
                style={styles.eventTitleMeasure}
                lightColor="#12304A"
                darkColor="#12304A"
                onTextLayout={(e) => {
                  if (e.nativeEvent.lines.length > 1) {
                    setStackTitle((prev) => (prev ? prev : true));
                  }
                }}>
                {event.title}
              </ThemedText>
            </View>
            {stackTitle ? null : (
              <ThemedText type="defaultSemiBold" style={styles.eventTitleInline} lightColor="#12304A" darkColor="#12304A">
                {event.title}
              </ThemedText>
            )}
            {event.loc ? (
              <ThemedText style={styles.eventMeta} lightColor="#12304A" darkColor="#12304A">
                {event.loc}
              </ThemedText>
            ) : null}
            <ThemedText style={styles.eventMeta} lightColor="#12304A" darkColor="#12304A">
              {event.all_day
                ? 'All day'
                : `${formatClock(event.start)} - ${formatClock(event.end)}`}
            </ThemedText>
          </ThemedView>

          <View style={styles.eventChevronSlot}>
            {stackTitle ? null : chevron}
          </View>
        </ThemedView>
      </Pressable>

      {isExpanded && (event.desc || event.link_button?.trim()) ? (
        <ThemedView style={styles.eventDetails} lightColor="#58ADE0" darkColor="#58ADE0">
          {event.desc ? (
            <ThemedText style={styles.eventDescription} lightColor="#12304A" darkColor="#12304A">
              {event.desc}
            </ThemedText>
          ) : null}
          {event.link_button?.trim() ? (
            <Pressable
              accessibilityRole="link"
              accessibilityLabel={event.link_button.trim()}
              onPress={() => openEventLink(event.link_url)}
              style={({ pressed }) => [
                styles.eventLinkButton,
                pressed && styles.eventLinkButtonPressed,
              ]}
            >
              <ThemedText style={styles.eventLinkButtonText} lightColor={EVENT_DATE_GREEN_TEXT} darkColor={EVENT_DATE_GREEN_TEXT}>
                {event.link_button.trim()}
              </ThemedText>
            </Pressable>
          ) : null}
        </ThemedView>
      ) : null}
    </ThemedView>
  );
}

export default function HomeScreen() {
  const [mobileContent, setMobileContent] = useState<Record<string, string>>({});
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [topNotification, setTopNotification] = useState<NotificationItem | null>(null);
  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([]);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

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

  return (
    <ParallaxScrollView
      headerBackgroundColor={{light: '#A1CEDC', dark: '#1D3D47'}}
      contentStyle={styles.feedContent}
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

      {/* <ThemedView style={[styles.card, styles.blueCard]}>
        <Ionicons name="alert-circle" size={22} color="#FFFFFF" style={styles.icon} />
        <ThemedText style={styles.cardText} lightColor="#FFFFFF">
          {mobileContent.notice_box || "This is a sample announcement message. The Civicvoice web dashboard will allow you to customize the message displayed here."}
        </ThemedText>
      </ThemedView> */}

      <ThemedView style={[styles.card, styles.redCard]}>
        <ThemedView style={styles.alertHeader}>
          <Ionicons name="notifications" size={22} color="#FFFFFF" style={styles.alertIcon} />
          {topNotification?.title ? (<ThemedText type="subtitle" style={styles.alertTitle} lightColor="#FFFFFF">
            {topNotification.title}
          </ThemedText>) : null}
        </ThemedView>
        <ThemedText style={styles.cardText} lightColor="#FFFFFF">
          {topNotification?.description || mobileContent.alert_box || "This is another important update or alert message. The Civicvoice web dashboard will allow you to customize the message displayed here."}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.titleContainer}>
  <ThemedText type="title" style={styles.headerText}>
      Upcoming Events
  </ThemedText>
    </ThemedView>

      {calendarItems.map((event) => (
        <EventCard
          key={event.event_id}
          event={event}
          isExpanded={expandedEventId === event.event_id}
          onToggle={() =>
            setExpandedEventId(expandedEventId === event.event_id ? null : event.event_id)
          }
        />
      ))}

      {/* <ThemedView style={styles.divider} /> */}

      {/* <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.headerText}>News</ThemedText>
      </ThemedView> */}

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

    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  feedContent: {
    paddingHorizontal: 16,
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

  eventCardHeader: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },

  eventCardPressed: {
    opacity: 0.82,
  },

  eventTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: 12,
    paddingRight: 8,
    paddingTop: 10,
  },

  eventBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    paddingRight: 8,
    position: 'relative',
  },

  eventTitleInline: {
    fontSize: 16,
    lineHeight: EVENT_TITLE_LINE_HEIGHT,
    textAlign: 'left',
  },

  eventTitleStacked: {
    flex: 1,
    fontSize: 16,
    lineHeight: EVENT_TITLE_LINE_HEIGHT,
    textAlign: 'left',
    paddingRight: 8,
  },

  eventTitleMeasureWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    opacity: 0,
  },

  eventTitleMeasure: {
    fontSize: 16,
    lineHeight: EVENT_TITLE_LINE_HEIGHT,
    fontWeight: '600',
  },

  eventMeta: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 2,
  },

  eventChevronSlot: {
    width: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },

  eventChevron: {
    marginTop: 1,
  },

  eventDetails: {
    borderTopColor: 'rgba(18, 48, 74, 0.28)',
    borderTopWidth: StyleSheet.hairlineWidth,
    marginHorizontal: 12,
    marginBottom: 12,
    paddingTop: 10,
  },

  eventDescription: {
    fontSize: 14,
    lineHeight: 20,
  },

  eventLinkButton: {
    alignItems: 'center',
    backgroundColor: EVENT_DATE_GREEN,
    borderRadius: 10,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  eventLinkButtonPressed: {
    opacity: 0.85,
  },

  eventLinkButtonText: {
    color: EVENT_DATE_GREEN_TEXT,
    fontSize: 15,
    fontWeight: '700',
  },
});
