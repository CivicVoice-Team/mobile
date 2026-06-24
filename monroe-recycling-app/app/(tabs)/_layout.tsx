import React from 'react';

import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { TabIcon } from '@/components/tab-icon';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

function createTabBarIcon(
  iconName: React.ComponentProps<typeof Ionicons>['name']
) {
  return function TabBarIcon(props: {
    color: string;
    size: number;
    focused: boolean;
  }) {
    return (
      <TabIcon
        {...props}
        name={iconName}
      />
    );
  };
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const TABS = [
        {
            name: 'camera',
            title: 'Camera',
            tabBarIcon: createTabBarIcon('camera')
        },
        {
            name: 'index',
            title: 'Home',
            tabBarIcon: createTabBarIcon('home')
        },
        {
            name: 'ecopark',
            title: 'Ecopark',
            tabBarIcon: createTabBarIcon('leaf')
        },
        {
            name: 'profile',
            title: 'Profile',
            tabBarIcon: createTabBarIcon('person')
        }
    ] as const;

  return (
    
    <Tabs
      initialRouteName='index'
      backBehavior='history'
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: { backgroundColor: '#152e70' },
      }}>
      {TABS.map(tab => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: tab.tabBarIcon,
          }}
        />
      ))}
      <Tabs.Screen
        name="news/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="faq/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="faq-search"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  activeIconContainer: {
    backgroundColor: '#152e70',
    width: 52,
    height: 52,
    borderRadius: 26,

    marginTop: -18,

    justifyContent: 'center',
    alignItems: 'center',

    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 4,

    //elevation: 5,
  },
});