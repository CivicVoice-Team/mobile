import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

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

export default function LocationScreen() {
  const [locations, setLocations] = useState<LocationItem[]>([]);

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
    async function loadLocations() {
      const skill_id = "amzn1.ask.skill.dd463ba3-38f4-423f-acd4-4d9d2a4a7d4d";

      try {
        const data = await fetchLocations(skill_id);
        setLocations(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadLocations();
  }, []);

  return (
    <ThemedView style={{flex:1, backgroundColor: "#e2f1e5"}}>
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
    justifyContent: "space-between"
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
  }
});
