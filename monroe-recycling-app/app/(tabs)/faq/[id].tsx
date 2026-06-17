import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, TouchableOpacity, Image } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";

export default function FAQDetail() {
    const { id, question, answer } = useLocalSearchParams();
    const router = useRouter();
    const imageUrl = `https://civicvoice-faq-images.s3.us-east-1.amazonaws.com/public/${id}`;

    return (
        <ThemedView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.container}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#456781" />
                </TouchableOpacity>

                <Image
                    source={{ uri: imageUrl }}
                    style={styles.heroImage}
                    resizeMode="cover"
                />

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
        padding: 20,
        paddingTop: 100
    },

    answer: {
        marginTop: 16,
        fontSize: 16,
        lineHeight: 24
    },

    heroImage: {
        width: "100%",
        height: 220,
        borderRadius: 16,
        marginTop: 16,
        marginBottom: 20
    }
});