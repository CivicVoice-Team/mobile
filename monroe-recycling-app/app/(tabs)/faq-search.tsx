import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useRouter } from 'expo-router';
import { fetchFAQs, FAQItem } from '@/services/faqs';

export default function FAQSearchScreen() {
    const [faqs, setFaqs] = useState<FAQItem[]>([]);
    const router = useRouter();

    useEffect(() => {
        async function load() {
            const skill_id = "amzn1.ask.skill.dd463ba3-38f4-423f-acd4-4d9d2a4a7d4d";

            const data = await fetchFAQs(skill_id);
            setFaqs(data);
        }

        load();
    }, []);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <ThemedText type="title">FAQs</ThemedText>

            {faqs.map((faq) => (
                <Pressable
                    key={faq.id}
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
                    <ThemedText style={styles.question}>
                        {faq.question}
                    </ThemedText>

                    <ThemedText style={styles.readMore}>
                        Tap to read
                    </ThemedText>
                </Pressable>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16
    },

    card: {
        backgroundColor: "#456781",
        padding: 14,
        borderRadius: 12,
        marginBottom: 12,
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
});