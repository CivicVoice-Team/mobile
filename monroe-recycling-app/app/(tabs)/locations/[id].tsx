import { useRouter, useLocalSearchParams } from "expo-router";
import { Image, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { SKILL_ID } from "@/constants/config";
import { fetchLocations, getLocationImageUrl } from "@/services/locations";
import { LocationItem } from "@/types/location";

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
  card: "card",
  calendar: "calendar",
  clock: "time",
  location: "location",
  "information-circle": "information-circle",
} as const;

function getTagUrl(tag: LocationItem["tags"][number]) {
  if (tag.type === "maps") {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      tag.name
    )}`;
  }

  return tag.link;
}

export default function LocationsDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [location, setLocation] = useState<LocationItem | null>(null);
  const [locationCount, setLocationCount] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    async function loadLocation() {
      try {
        const data = await fetchLocations(SKILL_ID);
        setLocationCount(data.length);
        setLocation(data.find((item) => item.location_id === id) ?? null);
        setImageFailed(false);
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

  const hours = location.hours?.trim() ?? "";
  const address = location.address?.trim() ?? "";
  const phone = location.phone?.trim() ?? "";
  const about = location.about?.trim() ?? "";
  const tags = location.tags ?? [];
  const isLocationTag = (tag: LocationItem["tags"][number]) =>
    tag.type === "maps" || tag.icon === "location";
  const locationTags = tags.filter(isLocationTag);
  const displayTags = tags.filter((tag) => !isLocationTag(tag));
  const showBack = locationCount > 1;

  const renderTag = (tag: LocationItem["tags"][number], index: number) => (
    <TouchableOpacity
      key={`${tag.name}-${index}`}
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
          await Linking.openURL(url);
        }
      }}
    >
      <View style={styles.tagContent}>
        {tag.icon && TAG_ICONS[tag.icon as keyof typeof TAG_ICONS] && (
          <Ionicons
            name={TAG_ICONS[tag.icon as keyof typeof TAG_ICONS]}
            size={14}
            color="white"
            style={styles.tagIcon}
          />
        )}
        <ThemedText style={styles.detailTagText}>{tag.name}</ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={{ flex: 1, backgroundColor: "#e2f1e5" }}>
      <ScrollView contentContainerStyle={styles.container}>
        {showBack && (
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#456781" />
          </TouchableOpacity>
        )}

        <View style={styles.heroImage}>
          {imageFailed ? (
            <Ionicons name="location" size={48} color="#456B55" />
          ) : (
            <Image
              source={{ uri: getLocationImageUrl(location.location_id) }}
              style={styles.heroImageFill}
              resizeMode="contain"
              onError={() => setImageFailed(true)}
            />
          )}
        </View>

        <ThemedText type="title" style={styles.title}>
          {location.title}
        </ThemedText>

        {displayTags.length > 0 && (
          <View style={styles.tagContainer}>
            {displayTags.map(renderTag)}
          </View>
        )}

        {hours.length > 0 && (
          <>
            <ThemedText type="subtitle" style={styles.heading}>
              Hours
            </ThemedText>
            <ThemedText style={styles.text}>{hours}</ThemedText>
          </>
        )}

        {address.length > 0 && (
          <>
            <ThemedText type="subtitle" style={styles.heading}>
              Address
            </ThemedText>
            <ThemedText style={styles.text}>{address}</ThemedText>
          </>
        )}

        {locationTags.length > 0 && (
          <View style={styles.addressTagContainer}>
            {locationTags.map(renderTag)}
          </View>
        )}

        {phone.length > 0 && (
          <>
            <ThemedText type="subtitle" style={styles.heading}>
              Phone
            </ThemedText>
            <ThemedText
              style={styles.phone}
              onPress={() => Linking.openURL(`tel:${phone}`)}
            >
              {phone}
            </ThemedText>
          </>
        )}

        {about.length > 0 && (
          <>
            <ThemedText type="subtitle" style={styles.heading}>
              About
            </ThemedText>
            <ThemedText style={styles.body}>{about}</ThemedText>
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 100,
    paddingBottom: 40,
  },

  heroImage: {
    width: "100%",
    height: 220,
    marginTop: 8,
    marginBottom: 20,
    backgroundColor: "#e2f1e5",
    alignItems: "center",
    justifyContent: "center",
  },

  heroImageFill: {
    width: "100%",
    height: "100%",
  },

  title: {
    fontSize: 28,
    marginBottom: 8,
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

  phone: {
    fontSize: 16,
    lineHeight: 24,
    color: "#3478F6",
    textDecorationLine: "underline",
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
    marginTop: 12,
    marginBottom: 4,
  },

  addressTagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
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
    alignItems: "center",
  },

  tagIcon: {
    marginRight: 6,
  },
});
