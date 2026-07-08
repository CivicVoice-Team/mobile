import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, TouchableOpacity, Image, View, Linking } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";

export default function FAQDetail() {
    const { id, question, answer, tags } = useLocalSearchParams();
    const parsedTags = typeof tags === "string" ? JSON.parse(tags) : [];
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

                <View style={styles.tagContainer}>
                    {parsedTags.map((tag: any, index: number) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.detailTag}
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
    },

    tagContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 20
    },

    detailTag: {
        backgroundColor: "#3FA34D",
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