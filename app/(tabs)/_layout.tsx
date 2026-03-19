import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const color = focused ? Theme.accent : Theme.muted;
  return (
    <Text style={[styles.tabIcon, { color }]}>{label}</Text>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: Theme.card,
          borderTopColor: Theme.divider,
          borderTopWidth: StyleSheet.hairlineWidth,
        },
        tabBarActiveTintColor: Theme.accent,
        tabBarInactiveTintColor: Theme.muted,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Workouts',
          tabBarIcon: ({ focused }) => <TabIcon label={'\u{1F4DD}'} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: 'Exercises',
          tabBarIcon: ({ focused }) => <TabIcon label={'\u{1F4AA}'} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ focused }) => <TabIcon label={'\u{1F4CA}'} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => <TabIcon label={'\u2699\uFE0F'} focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 22,
    marginBottom: -4,
  },
});
