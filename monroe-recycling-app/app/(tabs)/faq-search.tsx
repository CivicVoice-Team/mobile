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
                    style={styles.card}
                    onPress={() =>
                        router.push({
                            pathname: "/faq/[id]",
                            params: {
                                id: faq.id,
                                question: faq.question,
                                answer: faq.answer,
                            },
                        })
                    }
        >
            <Image
                source={{ uri: getFaqImageUrl(faq.id) }}
                style={styles.image}
                resizeMode="cover"
            />

            <View style={styles.textContainer}>
                <ThemedText style={styles.question}>
                    {faq.question}
                </ThemedText>

                <ThemedText style={styles.readMore}>
                    Tap to read
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

    question: {
        color: "#fff",
        fontWeight: "600",
        marginBottom: 6,
    },

    readMore: {
        color: "#fff",
        textDecorationLine: "underline",
    },

    image: {
        width: 80,
        height: 60,
        borderRadius: 8,
        marginRight: 12
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
    }
});