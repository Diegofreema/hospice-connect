import { palette } from '@/theme';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
const PublicLayout = () => {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: palette.blue }}
      edges={['top', 'right', 'left']}
    >
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="light" />
    </SafeAreaView>
  );
};

export default PublicLayout;
