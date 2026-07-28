import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, TouchableOpacity, View, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function LocationsDetail() {
  const router = useRouter();

  const location = {
    title: "Ecopark",
    address: "10 Avion Drive, Town of Chili",
    about:
      "Please note that the recycling stations at ecopark are self-serve (with the exception of Household Hazardous Waste). Residents should be prepared to unload their own items.\n\nAn appointment is required to drop off Household Hazardous Waste.",
    hours:
      "Wednesday 1:00 PM - 6:30 PM\nSaturday 7:30 AM - 1:00 PM\nClosed on Holidays",
    tags: [
      {
        name: "Ecopark",
        color: "orange",
        icon: "location",
        type: "maps",
        link: "",
      },
      {
        name: "Website",
        color: "green",
        icon: "leaf",
        type: "website",
        link: "https://www.monroecounty.gov/ecopark",
      },
      {
        name: "HHW Appointment",
        color: "blue",
        icon: "calendar",
        type: "custom",
        link: "https://wp.monroecounty.gov/hhw",
      },
    ],
  };

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

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>

        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#456781" />
        </TouchableOpacity>

        <ThemedText type="title" style={styles.title}>
          {location.title}
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

        <ThemedText type="subtitle" style={styles.heading}>
          About
        </ThemedText>

        <ThemedText style={styles.body}>
          {location.about}
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
    color: "#456781",
  },

  text: {
    fontSize: 16,
    lineHeight: 24,
  },

  body: {
    fontSize: 16,
    lineHeight: 26,
    marginTop: 4,
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
