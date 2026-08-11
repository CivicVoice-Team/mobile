import { useEffect, useState } from "react";

import { Link } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet } from "react-native";

import { fetchLocations } from "@/services/locations";
import { LocationItem } from "@/types/location";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { SKILL_ID } from "@/constants/config";

export default function LocationScreen() {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const[error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLocations() {
      try {
        const data = await fetchLocations(SKILL_ID);
        setLocations(data);
      } catch (err) {
        console.error(err);
        setError("Couldn't load locations.")
      } finally {
        setLoading(false);
      }
    }
    loadLocations();
  }, []);

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color="#456B55" />
        <ThemedText>Loading locations...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText>{error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedView style={styles.titleContainer} >
            <ThemedText type="title">
              Locations
            </ThemedText>
        </ThemedView>

        {locations.map((location) => (
          <Link
            key={location.location_id}
            style={styles.link}
            href={{
              pathname: "/locations/[id]",
              params: {
                id: location.location_id
              }
            }}
          >
            <ThemedView style={[styles.card, styles.blueCard]}>
              <ThemedText
                type="subtitle"
                style={styles.locationTitle}
                lightColor="#fff"
              >
                {location.title}
              </ThemedText>

              <ThemedText
                numberOfLines={3}
                style={styles.preview}
                lightColor="#fff"
              >
                {location.about}
              </ThemedText>

              <ThemedText
                style={styles.address}
                lightColor="#fff"
              >
                {location.address}
              </ThemedText>

              <ThemedText
                style={styles.readMore}
                lightColor="#fff"
              >
                View Location
              </ThemedText>
            </ThemedView>
          </Link>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({

  titleContainer: {
    paddingVertical: 10,
    paddingTop: 100,
    backgroundColor: "#e2f1e5"
  },

  card: {
    width: "100%",
    alignSelf: "center",
    borderRadius: 16,
    padding: 18,
    minHeight: 180,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
    elevation: 3
  },

  blueCard: {
    backgroundColor: "#456B55",
  },

  locationTitle: {
    fontWeight: "bold",
    marginBottom: 10,
  },

  preview: {
    lineHeight: 20,
    height: 60
  },

  address: {
    marginTop: 12,
    opacity: 0.9,
  },

  readMore: {
    marginTop: 12,
    textDecorationLine: "underline",
    fontWeight: "bold",
  },

  container: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
    alignItems: "center"
  },

  link: {
    width: "100%",
    marginBottom: 16,
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  screen: {
    flex: 1,
    backgroundColor: "#e2f1e5"
  }
});
