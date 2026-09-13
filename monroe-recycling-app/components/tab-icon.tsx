import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSegments } from "expo-router";

type TabIconProps = Readonly<{
    name: React.ComponentProps<typeof Ionicons>['name'];
    color: string;
    size: number;
    focused: boolean;
}>;

export function TabIcon({
    name,
    color,
    size,
    focused,
}: TabIconProps) {
    const segments = useSegments() as string[];

    const isLocationScreen = segments.includes("ecopark") || segments.includes("locations");
    const isActive = focused || (name === 'leaf' && isLocationScreen);

    return (
        <View
            style={[
                styles.iconContainer,
                isActive && [
                    styles.activeIconContainer,
                    {
                        backgroundColor: isLocationScreen ? '#2E623C' : '#19549A',
                    },
                ],
            ]}
        >
            <Ionicons
                name={name}
                color={color}
                size={isActive ? 38 : Math.max(size, 32)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    iconContainer: {
        width: 64,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },

    activeIconContainer: {
        backgroundColor: '#152370',
        width: 66,
        height: 66,
        borderRadius: 33,
        marginTop: -29,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
