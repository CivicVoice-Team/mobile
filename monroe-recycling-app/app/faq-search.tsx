// app/faq-search.tsx

import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';

export default function FAQSearchScreen() {
    return (
        <View style={styles.container}>
            <ThemedText type="title">FAQ Search</ThemedText>

            <ThemedText style={styles.text}>
                FAQ search page coming soon.
            </ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },

    text: {
        marginTop: 12,
        textAlign: 'center',
    },
});