import { useEffect, useState } from 'react';

import { useRouter } from 'expo-router';
import { FlatList, Image, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { searchFAQs } from '@/services/faqSearch';
import { fetchFAQs, FAQItem } from '@/services/faqs';
import { Ionicons } from '@expo/vector-icons';
import { SKILL_ID } from '@/constants/config';

import { useLocalSearchParams } from 'expo-router';

export default function FAQSearchScreen() {
    const params = useLocalSearchParams();
    const [faqs, setFaqs] = useState<FAQItem[]>([]);
    const [searchText, setSearchText] = useState("");
    const [filteredFaqs, setFilteredFaqs] = useState<FAQItem[] | null>(null);

    const router = useRouter();

    const getFaqImageUrl = (faq: FAQItem) => {
        const base = `https://civicvoice-faq-images.s3.us-east-1.amazonaws.com/public/${faq.id}`;
        return faq.updatedAt ? `${base}?v=${encodeURIComponent(faq.updatedAt)}` : base;
    }

    const sortFaqs = (faqs: FAQItem[]) =>
        [...faqs].sort((a, b) =>
        a.question.trim().toLowerCase()
        .localeCompare(b.question.trim().toLowerCase()))

    useEffect(() => {
        async function load() {
            try {
                setFaqs(sortFaqs(await fetchFAQs(SKILL_ID)));
            } catch (error) {
                console.error("Failed to load FAQs", error);
            }
        }
        load();
    }, []);

    useEffect(() => {
        const skillId = "amzn1.ask.skill.dd463ba3-38f4-423f-acd4-4d9d2a4a7d4d";

        if (searchText.trim().length < 2) {
            setFilteredFaqs(null);
            return;
        }

        const timeout = setTimeout(async () => {
            try {
                const results = await searchFAQs(searchText, skillId);

                setFilteredFaqs(results);
            } catch (err) {
                console.error(err);
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [searchText]);

    useEffect(() => {
        if (typeof params.query === "string") {
            setSearchText(params.query);
        }
    }, [params.query]);

    return (
        <FlatList
            data={filteredFaqs ?? faqs}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.container}
            ListHeaderComponent={
                <View style={styles.searchWrapper}>
                    <TextInput
                        style={styles.searchBar}
                        placeholder='Search Items...'
                        placeholderTextColor="#888"
                        value={searchText}
                        onChangeText={setSearchText}
                    />

                    {searchText.length > 0 && (
                        <Pressable
                            style={styles.clearButton}
                            onPress={() => setSearchText("")}
                            hitSlop={8}
                        >
                            <Ionicons name="close-circle" size={22} color="#888" />
                        </Pressable>
                    )}
                </View>
            }
            ListEmptyComponent={
                searchText.trim().length >= 2 ? (
                    <View style={styles.noResultsContainer}>
                        <Ionicons name="search-outline" size={48} color="#888" />
                        <ThemedText style={styles.noResultsTitle}>
                            No results found
                        </ThemedText>
                        <ThemedText style={styles.noResultsText}>
                            We couldn't find any items matching "{searchText.trim()}". Try a different search.
                        </ThemedText>
                    </View>
                ) : null
            }
            renderItem={({ item: faq }) => (
                <Pressable
                    style={[styles.card, faq.hazardous && styles.hazardousCard]}
                    onPress={() =>
                        router.push({
                            pathname: "/faq/[id]",
                            params: {
                                id: faq.id,
                                question: faq.question,
                                answer: faq.description,
                                read_more: faq.read_more ?? "",
                                tags: JSON.stringify(faq.tags),
                                updatedAt: faq.updatedAt ?? ""
                            },
                        })
                    }
                >
                    <Image
                        source={{ uri: getFaqImageUrl(faq) }}
                        style={styles.image}
                        resizeMode="contain"
                    />

                    <View style={styles.textContainer}>
                        <ThemedText style={styles.question}>
                            {faq.question.split(",")[0]}
                        </ThemedText>

                        {faq.hazardous && (
                            <View style={styles.hazardBadge}>
                                <Ionicons
                                    name="warning"
                                    size={14}
                                    color="white"
                                    style={{ marginRight: 4 }}
                                />
                                <ThemedText style={styles.hazardBadgeText}>
                                    Hazardous
                                </ThemedText>
                            </View>
                        )}

                        <ThemedText style={styles.readMore} numberOfLines={1} ellipsizeMode="tail">
                            {faq.description}
                        </ThemedText>
                    </View>
                </Pressable>
            )}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        paddingTop: 100
    },

    card: {
        backgroundColor: "#456781",
        padding: 14,
        borderRadius: 12,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center"
    },

    hazardousCard: {
        borderRightWidth: 6,
        borderRightColor: "red"
    },

    question: {
        color: "#fff",
        fontWeight: "600",
        marginBottom: 6,
    },

    readMore: {
        color: "#fff",
        //textDecorationLine: "underline",
    },

    image: {
        width: 80,
        aspectRatio: 1,
        borderRadius: 8,
        marginRight: 12,
        alignSelf: "flex-start"
    },

    textContainer: {
        flex: 1
    },

    searchBar: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 6,
        paddingRight: 44,
        fontSize: 16,
    },

    tagContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 8
    },

    tagPill: {
        backgroundColor: "#3F434D",
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginRight: 6,
        marginTop: 4,
    },

    tagText: {
        color: "white",
        fontSize: 12,
        fontWeight: "600",
    },

    hazardBadge: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        backgroundColor: "#D9534F",
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginBottom: 8,
    },

    hazardBadgeText: {
        color: "white",
        fontSize: 12,
        fontWeight: "600",
    },

    searchWrapper: {
        position: "relative",
        marginBottom: 16,
        marginTop: 10
    },

    clearButton: {
        position: "absolute",
        right: 12,
        top: "50%",
        transform: [{ translateY: -11}]
    },
    
    noResultsContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 30,
        paddingTop: 50,
    },

    noResultsTitle: {
        fontSize: 20,
        fontWeight: "600",
        marginTop: 12,
        marginBottom: 6
    },

    noResultsText: {
        color: "#888",
        textAlign: "center",
        fontSize: 15,
        lineHeight: 22
    }
});