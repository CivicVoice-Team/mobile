import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, TouchableOpacity, Image, View, Linking } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";

export default function FAQDetail() {
    const { id, question, answer, read_more, tags, updatedAt } = useLocalSearchParams();
    const parsedTags = typeof tags === "string" ? JSON.parse(tags) : [];
    const router = useRouter();
    const [showReadMore, setShowReadMore] = useState(false);

    const hasReadMore = 
        typeof read_more === "string" && read_more.trim().length > 0;

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

    const TAG_ICONS = {
        leaf: "leaf",
        caution: "warning",
        dollar: "cash",
        calendar: "calendar",
        clock: "time",
        location: "location"
    } as const;

    const getTagUrl = (tag: any) => {
        if (tag.type === "maps") {
            return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tag.name)}`;
        }

        return tag.link;
    }

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
                                const url = getTagUrl(tag);

                                if (!url) return;

                                const supported = await Linking.canOpenURL(url);

                                if (supported) {
                                    await Linking.openURL(url);
                                } else {
                                    console.warn(`Cannot open URL: ${url}`);
                                }
                            }}
                        >
                            <View style={styles.tagContent}>
                                {tag.icon && TAG_ICONS[tag.icon as keyof typeof TAG_ICONS] && (
                                    <Ionicons
                                        name={TAG_ICONS[tag.icon as keyof typeof TAG_ICONS]}
                                        size={14}
                                        color="white"
                                        style={styles.tagIcon}
                                    />
                                )}

                                <ThemedText style={styles.detailTagText}>
                                    {tag.name}
                                </ThemedText>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <ThemedText style={styles.answer}>
                    {answer}
                </ThemedText>

                {hasReadMore && (
                    <>
                        <TouchableOpacity
                            style={styles.readMoreButton}
                            onPress={() => setShowReadMore(!showReadMore)}
                        >
                            <View style={styles.readMoreButtonContent}>
                                <ThemedText style={styles.readMoreButtonText}>
                                    {showReadMore ? "Hide Additional Information" : "Read More"}
                                </ThemedText>

                                <Ionicons
                                    name={showReadMore ? "chevron-up" : "chevron-down"}
                                    size={18}
                                    color="white"
                                    style={{ marginLeft: 6 }}
                                />
                            </View>
                        </TouchableOpacity>

                        {showReadMore && (
                            <ThemedText style={styles.readMoreText}>
                                {read_more}
                            </ThemedText>
                        )}
                    </>
                )}

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
    },

    tagContent: {
        flexDirection: "row",
        alignItems: "center",
    },

    tagIcon: {
        marginRight: 6,
    },

    readMoreButton: {
        marginTop: 28,
        backgroundColor: "#456781",
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center"
    },

    readMoreButtonContent: {
        flexDirection: "row",
        alignItems: "center"
    },

    readMoreButtonText: {
        color: "white",
        fontWeight: "600",
        fontSize: 16,
    },

    readMoreText: {
        marginTop: 16,
        fontSize: 16,
        lineHeight: 24
    }
});