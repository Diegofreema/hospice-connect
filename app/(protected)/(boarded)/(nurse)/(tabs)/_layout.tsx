import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';

import { TabBarIcon } from '@/features/shared/components/tab-bar-icon';
import {
  IconDotsCircleHorizontal,
  IconHome2,
  IconMessageCircle,
} from '@tabler/icons-react-native';
import { useUnistyles } from 'react-native-unistyles';

export default function TabLayout() {
  const { theme } = useUnistyles();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.blue,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon size={size} icon={IconHome2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="message"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon size={size} icon={IconMessageCircle} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon
              size={size}
              icon={IconDotsCircleHorizontal}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
