import React, { useEffect, useState } from 'react';

import { Ionicons } from '@expo/vector-icons';
import { Tabs, useSegments, Href } from 'expo-router';
import { type ColorValue } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { TabIcon } from '@/components/tab-icon';
import { SKILL_ID } from '@/constants/config';
import { fetchLocations } from '@/services/locations';

function createTabBarIcon(
  iconName: React.ComponentProps<typeof Ionicons>['name']
) {
  return function TabBarIcon(props: {
    color: ColorValue;
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
  const segments = useSegments() as string[];

  const isLocationScreen = segments.includes("locations") || segments.includes("ecopark");

  const [locationlink, setLocationlink] = useState<Href>(
    SKILL_ID === "amzn1.ask.skill.dd463ba3-38f4-423f-acd4-4d9d2a4a7d4d"
        ? "/locations"
        : "/ecopark"
  );

  useEffect(() => {
    if (SKILL_ID !== "amzn1.ask.skill.dd463ba3-38f4-423f-acd4-4d9d2a4a7d4d") {
      return;
    }

    async function loadLocationTab() {
      try {
        const locations = await fetchLocations(SKILL_ID);

        if (locations.length === 1) {
          setLocationlink({
            pathname: "/locations/[id]",
            params: {
              id: locations[0].location_id,
            },
          });
        } else {
          setLocationlink("/locations");
        }
      } catch (error) {
        console.error("Failed to load locations tab", error);
        setLocationlink("/locations");
      }
    }

    loadLocationTab();
  }, []);

  const TABS = [
        {
            name: 'camera',
            title: 'Search',
            tabBarIcon: createTabBarIcon('search')
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
    ] as const;

  return (
    
    <Tabs
      initialRouteName='index'
      backBehavior='history'
      screenOptions={{
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#FFFFFF',
        headerShown: false,
        tabBarShowLabel: false,
        tabBarButton: HapticTab,
        tabBarStyle: { 
          backgroundColor: isLocationScreen ? "#2E623C" : "#19549A",
          borderTopWidth: 0,
          height: 70,
          paddingTop: 7,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
        },
      }}>
      {TABS.map(tab => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: tab.tabBarIcon,
            ...(tab.name === 'camera'
              ? { href: '/faq-search' }
              : {}),
            ...(tab.name === 'ecopark'
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
        name="locations/index"
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
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
