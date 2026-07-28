import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useSegments } from 'expo-router';

type TopBarProps = {
    title?: string;
};

export default function TopBar({ title = 'Monroe County Recycling',}: TopBarProps) {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const segments = useSegments() as string[];

    const isLocationScreen = segments.includes("locations") || segments.includes("ecopark");

    return (
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor: isLocationScreen ? "#2E623C" : "#152e70" }]}>
            <View style={styles.inner}>
                <Text style={styles.title}>{title}</Text>
                <TouchableOpacity onPress={() => router.push('/faq-search')} activeOpacity={0.7}>
                    <Ionicons name="search" size={22} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#152e70',
        zIndex: 1000,
    },
    inner: {
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    title: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
});