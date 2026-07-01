import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Image, FlatList, TextInput } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useRouter } from 'expo-router';
import { fetchFAQs, FAQItem } from '@/services/faqs';
import { searchFAQs } from '@/services/faqSearch';

// export async function searchFAQs(
//     skillId: string,
//     query: string
// ) {
//     const resp = await API.post("api", "search_faq", {
//         body: {
//             query,
//             skill_id: skillId,
//         },
//     });

//     return resp.results || [];
// }

export default function FAQSearchScreen() {
    const [faqs, setFaqs] = useState<FAQItem[]>([]);
    const router = useRouter();
    const getFaqImageUrl = (faqId: string) => `https://civicvoice-faq-images.s3.us-east-1.amazonaws.com/public/${faqId}`;
    const [searchText, setSearchText] = useState('');
    const [filteredFaqs, setFilteredFaqs] = useState<FAQItem[] | null>(null);

    useEffect(() => {
        async function load() {
            const skill_id = "amzn1.ask.skill.dd463ba3-38f4-423f-acd4-4d9d2a4a7d4d";

            const data = await fetchFAQs(skill_id);

            const sortedFaqs = [...data].sort((a, b) =>
                a.question.trim().toLowerCase()
                    .localeCompare(b.question.trim().toLowerCase())
            );

            setFaqs(sortedFaqs);
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

    return (
        <FlatList
            data={filteredFaqs ?? faqs}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.container}
            ListHeaderComponent={
                <TextInput
                    style={styles.searchBar}
                    placeholder='Search Items...'
                    placeholderTextColor="#888"
                    value={searchText}
                    onChangeText={setSearchText}
                />
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
                                tags: JSON.stringify(faq.tags),
                            },
                        })
                    }
        >
            <Image
                source={{ uri: getFaqImageUrl(faq.id) }}
                style={styles.image}
                resizeMode="contain"
            />

            <View style={styles.textContainer}>
                <ThemedText style={styles.question}>
                    {faq.question.split(",")[0]}
                </ThemedText>

                <ThemedText style={styles.readMore} numberOfLines={1} ellipsizeMode="tail">
                    {faq.description}
                </ThemedText>

                <View style={styles.tagContainer}>
                    {faq.tags.slice(0, 3).map((tag, index) => (
                        <View key={index} style={styles.tagPill}>
                            <ThemedText style={styles.tagText}>
                                {tag.name}
                            </ThemedText>
                        </View>
                    ))}
                </View>
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
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 16,
        fontSize: 16
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
});