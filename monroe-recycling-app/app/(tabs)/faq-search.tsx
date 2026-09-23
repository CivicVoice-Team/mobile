import { useEffect, useState } from 'react';

import { useRouter } from 'expo-router';
import { FlatList, Image, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { searchFAQs } from '@/services/faqSearch';
import { fetchFAQs, FAQItem } from '@/services/faqs';
import { Ionicons } from '@expo/vector-icons';
import { SKILL_ID } from '@/constants/config';

import { useLocalSearchParams } from 'expo-router';

const TAG_ICONS = {
    leaf: "leaf",
    caution: "warning",
    dollar: "cash",
    card: "card",
    calendar: "calendar",
    clock: "time",
    location: "location",
    "information-circle": "information-circle",
} as const;

const TAG_COLORS = {
    green: "#3FA34D",
    blue: "#3478F6",
    red: "#D9534F",
    orange: "#F59E0B",
    yellow: "#EAB308",
    purple: "#8B5CF6",
    gray: "#6B7280",
};

function getUniqueCardTagIcons(tags: FAQItem["tags"] = []) {
    const seen = new Set<string>();
    const icons: { iconName: (typeof TAG_ICONS)[keyof typeof TAG_ICONS]; color: string }[] = [];

    for (const tag of tags) {
        if (
            tag.icon === "leaf" ||
            tag.icon === "location" ||
            tag.type === "maps" ||
            tag.icon === "information-circle"
        ) {
            continue;
        }

        const iconName = TAG_ICONS[tag.icon as keyof typeof TAG_ICONS];
        if (!iconName || seen.has(iconName)) {
            continue;
        }

        seen.add(iconName);
        icons.push({
            iconName,
            color: TAG_COLORS[tag.color as keyof typeof TAG_COLORS] ?? "#12304A",
        });
    }

    return icons;
}

function FaqSearchCard({
    faq,
    imageUrl,
    onPress,
}: {
    faq: FAQItem;
    imageUrl: string;
    onPress: () => void;
}) {
    const title = faq.question.split(",")[0];
    const tagIcons = getUniqueCardTagIcons(faq.tags);

    return (
        <Pressable style={styles.card} onPress={onPress}>
            <Image
                source={{ uri: imageUrl }}
                style={styles.image}
                resizeMode="contain"
            />

            <View style={styles.textContainer}>
                <ThemedText style={styles.question}>{title}</ThemedText>
                {tagIcons.length > 0 && (
                    <View style={styles.cardFooter}>
                        <View style={styles.tagIcons}>
                            {tagIcons.map((tagIcon) => (
                                <Ionicons
                                    key={tagIcon.iconName}
                                    name={tagIcon.iconName}
                                    size={20}
                                    color={tagIcon.color}
                                    style={styles.tagIcon}
                                />
                            ))}
                        </View>
                    </View>
                )}
            </View>
        </Pressable>
    );
}

export default function FAQSearchScreen() {
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
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
            style={{ flex: 1, backgroundColor }}
            contentContainerStyle={[styles.container, { backgroundColor }]}
            ListHeaderComponent={
                <>
    <View style={styles.searchBar}>
      <Ionicons
        name="search"
        size={18}
        color="#19549A"
        style={styles.searchIcon}
      />
      <TextInput
        style={[styles.searchInput, { color: textColor }]}
        placeholder="Search items..."
        placeholderTextColor="#8A93A3"
        value={searchText}
        onChangeText={setSearchText}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
      />
      {searchText.length > 0 ? (
        <Pressable
          onPress={() => setSearchText("")}
          hitSlop={8}
          style={styles.searchAction}
        >
          <Ionicons name="close-circle" size={18} color="#8A93A3" />
        </Pressable>
      ) : (
        <Ionicons
          name="mic"
          size={18}
          color="#19549A"
          style={styles.searchAction}
        />
      )}
    </View>

                {searchText.trim().length === 0 && (
                <View style={styles.cameraPrompt}>
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
                <FaqSearchCard
                    faq={faq}
                    imageUrl={getFaqImageUrl(faq)}
                    onPress={() =>
                        router.push({
                            pathname: "/faq/[id]",
                            params: {
                                id: faq.id,
                                question: faq.question,
                                answer: faq.description,
                                mobile: faq.mobile ?? "",
                                read_more: faq.read_more ?? "",
                                tags: JSON.stringify(faq.tags),
                                updatedAt: faq.updatedAt ?? ""
                            },
                        })
                    }
                />
            )}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        paddingTop: 100,
    },

    card: {
        backgroundColor: "#58ADE0",
        padding: 14,
        borderRadius: 12,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
    },

    question: {
        color: "#12304A",
        fontWeight: "700",
        marginBottom: 2,
        maxWidth: 240,
    },

    cardFooter: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
        minHeight: 22,
    },

    tagIcons: {
        flexDirection: "row",
        alignItems: "center",
    },

    tagIcon: {
        marginRight: 8,
    },

    image: {
        width: 62,
        height: 52,
        borderRadius: 10,
        marginRight: 12,
        backgroundColor: "#1230$A",
    },

    textContainer: {
        flex: 1,
        minWidth: 0,
    },

    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#58ADE0",
        borderRadius: 24,
        paddingLeft: 14,
        paddingRight: 10,
        paddingVertical: 4,
        marginBottom: 16,
        marginTop: 10,
        minHeight: 46,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        elevation: 2,
    },

    searchIcon: {
        marginRight: 8,
    },

    searchInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 10,
        paddingHorizontal: 0,
    },

    searchAction: {
        padding: 4,
        marginLeft: 4,
    },

    cameraPrompt:{
        alignItems: 'center',
        marginBottom: 18,
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