import { useAuth } from '@/components/context/auth';
import { LoadingComponent } from '@/features/shared/components/loading';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
const ProtectedLayout = () => {
  const { user } = useAuth();
  if (user === undefined) {
    return <LoadingComponent />;
  }

  const isBoarded = !!user?.isBoarded;
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: 'white' }}
      edges={['top', 'right', 'left']}
    >
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={isBoarded}>
          <Stack.Screen name="(boarded)" />
        </Stack.Protected>
        <Stack.Protected guard={!isBoarded}>
          <Stack.Screen name="(not-boarded)" />
        </Stack.Protected>
      </Stack>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
};

export default ProtectedLayout;
