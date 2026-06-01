import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TopBarProps = {
    title?: string;
    onSearchPress?: () => void;
};

export default function TopBar({ title = 'Monroe County Recycling', onSearchPress }: TopBarProps) {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.inner}>
                <Text style={styles.title}>{title}</Text>
                <TouchableOpacity onPress={onSearchPress} activeOpacity={0.7}>
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