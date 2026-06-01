import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "react-native";
import { ThemedView } from "@/components/themed-view";

export default function NewsDetail() {
    const { title, description, date } = useLocalSearchParams();
    const router = useRouter();
    const colorScheme = useColorScheme();

    const formattedDate = date ? new Date(date as string).toLocaleDateString("en-US") : "";

    return (
        <ThemedView style={{ flex: 1}}>
            <ScrollView contentContainerStyle={styles.container}>
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
});