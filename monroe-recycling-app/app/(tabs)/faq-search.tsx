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
                <>
    <View style={styles.searchWrapper}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search waste materials..."
        placeholderTextColor="#D7DCE2"
        value={searchText}
        onChangeText={setSearchText}
      />

      <Ionicons
        name="mic"
        size={20}
        color="#FFFFFF"
        style={styles.micIcon}
      />
    </View>

                {searchText.trim().length === 0 && (
                <View style={styles.cameraPrompt}>
                    <ThemedText style={styles.instructions}>
                    Before visiting alternate drop-off locations, confirm availability
                    and hours of operation.
                    </ThemedText>

                    <Pressable
                    style={styles.cameraButton}
                    onPress={() => router.push('/camera')}>
                    <Ionicons name="camera" size={40} color="#FFFFFF" />
                    </Pressable>

                    <ThemedText style={styles.cameraText}>
                    Not sure what your waste item is? Scan with our AI camera feature!
                    </ThemedText>
                </View>
                )}
                </>
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
        paddingTop: 100,
        backgroundColor: "#202223",
    },

    card: {
        backgroundColor: "#58ADE0",
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
        color: "#12304A",
        fontWeight: "700",
        marginBottom: 2,
    },

    readMore: {
        color: "#12304A",
        fontSize:11,
        textDecorationLine: "underline",
    },

    image: {
        width: 62,
        height: 52,
        borderRadius: 10,
        marginRight: 12,
        backgroundColor: "#1230$A",
    },

    textContainer: {
        flex: 1
    },

    searchBar: {
        borderWidth: 1,
        borderColor: "#D7DCE2",
        borderRadius: 20,
        color: "#FFFFFF",
        paddingHorizontal: 14,
        paddingVertical: 9,
        paddingRight: 44,
    },

    micIcon:{
        position: 'absolute',
        right: 14,
        top: 10,
    },

    cameraPrompt:{
        alignItems: 'center',
        marginBottom: 18,
    },

    instructions: {
        color: "#FFFFFF",
        fontWeight: "600",
        textAlign: "center",
        fontSize: 13,
        lineHeight: 18,
    },

    cameraButton: {
        width: 84,
        height: 84,
        borderRadius: 42,
        backgroundColor: "#187843",
        alignItems: "center",
        justifyContent: 'center',
        marginVertical: 16,
    },

    cameraText:{
        color: "#E7EEF4",
        fontSize: 12,
        lineHeight: 18,
        textAlign: 'center',
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