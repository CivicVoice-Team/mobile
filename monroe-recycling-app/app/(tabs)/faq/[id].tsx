import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, TouchableOpacity, Image, View, Linking } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";

export default function FAQDetail() {
    const { id, question, answer, tags, updatedAt } = useLocalSearchParams();
    const parsedTags = typeof tags === "string" ? JSON.parse(tags) : [];
    const router = useRouter();

    const baseImageUrl =
        `https://civicvoice-faq-images.s3.us-east-1.amazonaws.com/public/${id}`;

    const imageUrl =
        updatedAt && typeof updatedAt === "string"
            ? `${baseImageUrl}?v=${encodeURIComponent(updatedAt)}` : baseImageUrl;

    const TAG_COLORS = {
        green: "#3FA34D",
        blue: "#3478F6",
        red: "#D9534F",
        orange: "#F59E0B",
        yellow: "#EAB308",
        purple: "#8B5CF6",
        gray: "#6B7280",
    };

    return (
        <ThemedView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.container}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#456781" />
                </TouchableOpacity>

                <Image
                    source={{ uri: imageUrl }}
                    style={styles.heroImage}
                    resizeMode="contain"
                />

                <ThemedText type="title" style={styles.title}>{question}</ThemedText>

                <View style={styles.tagContainer}>
                    {parsedTags.map((tag: any, index: number) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.detailTag,
                                {
                                    backgroundColor:
                                    TAG_COLORS[tag.color as keyof typeof TAG_COLORS] ??
                                    "#3FA34D",
                                },
                            ]}
                            onPress={async () => {
                                if (!tag.link) return;

                                const supported = await Linking.canOpenURL(tag.link);

                                if (supported) {
                                    await Linking.openURL(tag.link);
                                } else {
                                    console.warn(`Cannot open URL: ${tag.link}`);
                                }
                            }}
                        >
                            <ThemedText style={styles.detailTagText}>
                                {tag.name}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                </View>

                <ThemedText style={styles.answer}>
                    {answer}
                </ThemedText>

            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 24
    },

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
        marginBottom: 20,
        alignSelf: "flex-start"
    },

    tagContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 20
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
        fontWeight: "600"
    }
});