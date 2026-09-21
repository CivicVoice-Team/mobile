import { useEffect, useState } from 'react';

import { useRouter } from 'expo-router';
import { FlatList, Image, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { fetchLocations, getLocationImageUrl } from '@/services/locations';
import { LocationItem } from '@/types/location';
import { Ionicons } from '@expo/vector-icons';
import { SKILL_ID } from '@/constants/config';

function LocationCard({
    location,
    onPress,
}: {
    location: LocationItem;
    onPress: () => void;
}) {
    const [imageFailed, setImageFailed] = useState(false);

    return (
        <Pressable style={styles.card} onPress={onPress}>
            <View style={styles.image}>
                {imageFailed ? (
                    <Ionicons name="location" size={28} color="#12304A" />
                ) : (
                    <Image
                        source={{ uri: getLocationImageUrl(location.location_id) }}
                        style={styles.imageFill}
                        resizeMode="contain"
                        onError={() => setImageFailed(true)}
                    />
                )}
            </View>

            <View style={styles.textContainer}>
                <ThemedText style={styles.title}>{location.title}</ThemedText>
            </View>
        </Pressable>
    );
}

export default function LocationsScreen() {
    const backgroundColor = useThemeColor({}, 'background');
    const [locations, setLocations] = useState<LocationItem[] | null>(null);
    const router = useRouter();

    useEffect(() => {
        async function load() {
            try {
                const data = await fetchLocations(SKILL_ID);
                const sorted = [...data].sort((a, b) =>
                    a.title.trim().toLowerCase()
                        .localeCompare(b.title.trim().toLowerCase())
                );

                if (sorted.length === 1) {
                    router.replace({
                        pathname: "/locations/[id]",
                        params: {
                            id: sorted[0].location_id,
                        },
                    });
                    return;
                }

                setLocations(sorted);
            } catch (error) {
                console.error("Failed to load locations", error);
                setLocations([]);
            }
        }
        load();
    }, [router]);

    if (locations === null) {
        return null;
    }

    return (
        <FlatList
            data={locations}
            keyExtractor={(item) => item.location_id}
            style={{ flex: 1, backgroundColor }}
            contentContainerStyle={[styles.container, { backgroundColor }]}
            renderItem={({ item: location }) => (
                <LocationCard
                    location={location}
                    onPress={() =>
                        router.push({
                            pathname: "/locations/[id]",
                            params: {
                                id: location.location_id,
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

    title: {
        color: "#12304A",
        fontWeight: "700",
        marginBottom: 2,
        maxWidth: 240,
    },

    image: {
        width: 62,
        height: 52,
        borderRadius: 10,
        marginRight: 12,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },

    imageFill: {
        width: "100%",
        height: "100%",
    },

    textContainer: {
        flex: 1,
        minWidth: 0,
    },
});
