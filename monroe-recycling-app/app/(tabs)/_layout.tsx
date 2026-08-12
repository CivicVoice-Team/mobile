import React from 'react';
import { useEffect, useState } from 'react';

import { Ionicons } from '@expo/vector-icons';
import { Tabs, useSegments, Href } from 'expo-router';
import { StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { TabIcon } from '@/components/tab-icon';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SKILL_ID } from '@/constants/config';
import { fetchLocations } from '@/services/locations';

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
  const segments = useSegments() as string[];

  const isLocationScreen = segments.includes("locations") || segments.includes("ecopark");

  //const locationlink = SKILL_ID == "amzn1.ask.skill.dd463ba3-38f4-423f-acd4-4d9d2a4a7d4d" ? '/locations/0' : '/ecopark';

  const [firstLocationId, setFirstLocationId] = useState<string | null>(null);

  useEffect(() => {
    async function loadFirstLocation() {
      try {
        const locations = await fetchLocations(SKILL_ID);

        if (locations.length > 0) {
          setFirstLocationId(locations[0].location_id);
        }
      } catch (error) {
        console.error("Failed to load locations", error);
      }
    }

    loadFirstLocation();
  }, []);

  const locationlink: Href | null =
    SKILL_ID === "amzn1.ask.skill.dd463ba3-38f4-423f-acd4-4d9d2a4a7d4d"
        ? firstLocationId
            ? {
                pathname: "/locations/[id]",
                params: {
                    id: firstLocationId,
                },
            }
            : null
        : "/ecopark";

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
        tabBarStyle: { 
          backgroundColor: isLocationScreen ? "#2E623C" : "#152e70", 
        },
      }}>
      {TABS.map(tab => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: tab.tabBarIcon,
            ...(tab.name === 'ecopark' && locationlink
              ? { href: locationlink }
              : {}),
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
      <Tabs.Screen
        name="locations/[id]"
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