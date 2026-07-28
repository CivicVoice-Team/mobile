import { useRouter, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, TouchableOpacity, View, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

type Tag = {
  name: string;
  type: string;
  icon: string;
  color: string;
  link: string;
};

type LocationItem = {
  location_id : string;
  skill_id: string;
  title: string;
  about: string;
  address: string;
  hours: string;
  phone: string;
  homophones: string[];
  tags: Tag[];
}

export default function LocationsDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [location, setLocation] = useState<LocationItem | null>(null);

  const TAG_COLORS = {
    green: "#3FA34D",
    blue: "#3478F6",
    red: "#D9534F",
    orange: "#F59E0B",
    yellow: "#EAB308",
    purple: "#8B5CF6",
    gray: "#6B7280",
  };

  const TAG_ICONS = {
    leaf: "leaf",
    caution: "warning",
    dollar: "cash",
    calendar: "calendar",
    clock: "time",
    location: "location",
  } as const;

  const getTagUrl = (tag: any) => {
    if (tag.type === "maps") {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        tag.name
      )}`;
    }

    return tag.link;
  };

  async function fetchLocations(
    skill_id:string
  ): Promise<LocationItem[]> {
    const url = `https://sj3d3m472d.execute-api.us-east-1.amazonaws.com/dev/locations?skill_id=${skill_id}`;

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Failed to fetch locations: ${res.status}`);
    }

    return res.json();
  }

  useEffect(() => {
    async function loadLocation() {
      try {
        const data = await fetchLocations(
          "amzn1.ask.skill.dd463ba3-38f4-423f-acd4-4d9d2a4a7d4d"
        );

        const found = data.find(
          (location) => location.location_id === id
        );

        if (found) {
          setLocation(found);
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadLocation();
  }, [id]);

  if (!location) {
    return (
      <ThemedView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1, backgroundColor: "#e2f1e5" }}>
      <ScrollView contentContainerStyle={styles.container}>

        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#456781" />
        </TouchableOpacity>

        <ThemedText type="title" style={styles.title}>
          {location.title}
        </ThemedText>

        <ThemedText type="subtitle" style={styles.heading}>
          About
        </ThemedText>

        <ThemedText style={styles.body}>
          {location.about}
        </ThemedText>

        <View style={styles.tagContainer}>
          {location.tags?.map((tag: any, index: number) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.detailTag,
                {
                  backgroundColor:
                    TAG_COLORS[tag.color as keyof typeof TAG_COLORS] ?? "#3FA34D",
                },
              ]}
              onPress={async () => {
                const url = getTagUrl(tag);

                if (!url) return;

                const supported = await Linking.canOpenURL(url);

                if (supported) {
                  await Linking.openURL(url)
                }
              }}
            >
              <View style={styles.tagContent}>
                {tag.icon &&
                  TAG_ICONS[tag.icon as keyof typeof TAG_ICONS] && (
                    <Ionicons
                      name={TAG_ICONS[tag.icon as keyof typeof TAG_ICONS]}
                      size={14}
                      color="white"
                      style={styles.tagIcon}
                    />
                  )}
                <ThemedText style={styles.detailTagText}>
                  {tag.name}
                </ThemedText>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <ThemedText type="subtitle" style={styles.heading}>
          Address
        </ThemedText>

        <ThemedText style={styles.text}>
          {location.address}
        </ThemedText>

        <ThemedText type="subtitle" style={styles.heading}>
          Hours
        </ThemedText>

        <ThemedText style={styles.text}>
          {location.hours}
        </ThemedText>

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 100,
  },

  title: {
    fontSize: 28,
    marginTop: 20,
    marginBottom: 28,
  },

  heading: {
    marginTop: 20,
    marginBottom: 6,
    color: "#456B55",
  },

  text: {
    fontSize: 16,
    lineHeight: 24,
  },

  body: {
    fontSize: 16,
    lineHeight: 26,
    marginTop: 4,
    marginBottom: 4,
  },

  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },

  detailTag: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },

  detailTagText: {
    color: "white",
    fontWeight: 600,
  },

  tagContent: {
    flexDirection: "row",
    alignItems: "center"
  },

  tagIcon: {
    marginRight: 6
  }
});
