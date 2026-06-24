import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
    return (
        <View
            style={[
                styles.iconContainer,
                focused && styles.activeIconContainer
            ]}
        >
            <Ionicons
                name={name}
                color={color}
                size={size}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },

    activeIconContainer: {
        backgroundColor: '#152370',
        width: 52,
        height: 52,
        borderRadius: 26,
        marginTop: -18,
        justifyContent: 'center',
        alignItems: 'center',
    },
});