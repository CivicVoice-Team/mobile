import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useSegments } from 'expo-router';
import { fetchMobileContent } from '@/services/mobileContent';
import { SKILL_ID } from '@/constants/config';

type TopBarProps = {
    title?: string;
};

export default function TopBar({ title = 'Monroe County Recycling',}: TopBarProps) {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const segments = useSegments() as string[];
    const [headerUrl, setHeaderUrl] = useState('');

    const isLocationScreen = segments.includes("locations") || segments.includes("ecopark");

    useEffect(() => {
        async function loadHeader() {
            const data = await fetchMobileContent(SKILL_ID);
            const header = Array.isArray(data)
                ? data.find((field) => field.field_id === 'home_header')
                : null;
            setHeaderUrl(typeof header?.text === 'string' ? header.text.trim() : '');
        }

        loadHeader();
    }, []);

    return (
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor: isLocationScreen ? "#2E623C" : "#152e70" }]}>
            <View style={styles.inner}>
                <View style={styles.brand}>
                    {headerUrl ? (
                        <Image
                            source={{ uri: headerUrl }}
                            style={styles.headerImage}
                            contentFit="contain"
                            accessibilityLabel="App header"
                        />
                    ) : null}
                    <Text style={styles.title} numberOfLines={1}>{title}</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/profile')} activeOpacity={0.7}>
                    <Ionicons name="settings" size={22} color="white" />
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
    brand: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
        minWidth: 0,
    },
    headerImage: {
        width: 42,
        height: 42,
        marginRight: 8,
    },
    title: {
        flexShrink: 1,
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
});
