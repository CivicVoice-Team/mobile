import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "react-native";
import { ThemedView } from "@/components/themed-view";
import { Image } from 'expo-image';

export default function NewsDetail() {
    const { title, description, date, imageUrl, link_url } = useLocalSearchParams();
    const router = useRouter();
    const colorScheme = useColorScheme();

    const formattedDate = date ? new Date(date as string).toLocaleDateString("en-US") : "";

    return (
        <ThemedView style={{ flex: 1}}>
            <ScrollView contentContainerStyle={styles.container}>
                {imageUrl ? (
                    <Image
                        source={{ uri: imageUrl as string }}
                        style={styles.headerImage}
                        contentFit="cover"
                    />
                ) : null}
                <TouchableOpacity style={styles.backButton} onPress={() => router.push("/")}>
                    <Ionicons name="arrow-back" size={24} color="#456781" />
                </TouchableOpacity>

                <ThemedText type="title">{title}</ThemedText>

                <ThemedText style={styles.date}>
                    {formattedDate}
                </ThemedText>

                <ThemedText style={styles.body}>
                    {description}
                </ThemedText>

                {link_url ? (
                  <TouchableOpacity
                    style={styles.readMoreButton}
                    onPress={() => Linking.openURL(link_url as string)}
                  >
                    <ThemedText style={styles.readMoreText}>
                      Read More
                    </ThemedText>
                  </TouchableOpacity>
                ) : null}
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },

  backButton: {
    marginBottom: 16
  },

  date: {
    marginTop: 8,
    marginBottom: 20,
    opacity: 0.7,
  },

  body: {
    fontSize: 16,
    lineHeight: 24,
  },

  headerImage: {
    width: "100%",
    height: 220,
    marginBottom: 16
  },

  readMoreButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#456781",
    borderRadius: 10,
    alignItems: "center",
  },

  readMoreText: {
    color: "#fff",
    fontWeight: "600"
  }
});