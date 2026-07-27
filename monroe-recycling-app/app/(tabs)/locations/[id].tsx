import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
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
      "Wednesday 1:00 PM – 6:30 PM\nSaturday 7:30 AM – 1:00 PM\nClosed on Holidays",
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
});
