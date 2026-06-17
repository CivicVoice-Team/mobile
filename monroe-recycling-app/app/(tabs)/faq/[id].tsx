import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";

export default function FAQDetail() {
    const { question, answer } = useLocalSearchParams();
    const router = useRouter();

    return (
        <ThemedView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.container}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#456781" />
                </TouchableOpacity>

                <ThemedText type="title">{question}</ThemedText>

                <ThemedText style={styles.answer}>
                    {answer}
                </ThemedText>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20
    },

    answer: {
        marginTop: 16,
        fontSize: 16,
        lineHeight: 24
    },
});