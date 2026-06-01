import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/themed-text";

export default function NewsDetail() {
    const { title, description, date } = useLocalSearchParams();

    const formattedDate = date ? new Date(date as string).toLocaleDateString("en-US") : "";

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <ThemedText type="title">{title}</ThemedText>

            <ThemedText style={styles.date}>
                {formattedDate}
            </ThemedText>

            <ThemedText style={styles.body}>
                {description}
            </ThemedText>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
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